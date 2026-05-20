import { useState, useMemo, useEffect, useRef } from "react";
import { productVariants, type Variant, type MediaItem } from "../../data/variants";
import { addToCart } from "../../lib/shopify/cart-client";
import { trackViewItem, trackSelectVariant, trackAddToCart, trackVideoPlay } from "../../lib/analytics";
import RingSizeGuide from "./RingSizeGuide";

interface Props {
  slug: string;
  accentColor: string;
}

let modelViewerLoaded = false;
function loadModelViewer() {
  if (modelViewerLoaded || typeof document === "undefined") return;
  modelViewerLoaded = true;
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  document.head.appendChild(script);
}

function ModelViewerSlot({ src, alt, poster }: { src: string; alt: string; poster?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadModelViewer();
    const mv = document.createElement("model-viewer") as any;
    mv.src = src;
    mv.alt = alt;
    mv.autoRotate = true;
    mv.cameraControls = true;
    mv.shadowIntensity = "1";
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.addEventListener("load", () => setLoaded(true));
    ref.current?.appendChild(mv);
    return () => { mv.remove(); };
  }, [src, alt]);

  return (
    <div className="relative w-full h-full bg-brand-gray-900 overflow-hidden">
      <div ref={ref} className="w-full h-full" />
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}

function VideoWithPoster({ src, poster, productName }: { src: string; poster?: string; productName?: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => {
      setPlaying(true);
      if (productName) trackVideoPlay(productName);
    };
    v.addEventListener("playing", onPlay);
    return () => v.removeEventListener("playing", onPlay);
  }, [productName]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      {poster && (
        <img
          src={poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
            playing ? "opacity-0" : "opacity-100"
          }`}
          alt=""
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function MediaViewer({ item, name, colorName, index }: {
  item: MediaItem;
  name: string;
  colorName?: string;
  index: number;
}) {
  const alt = item.alt || `${name}${colorName ? ` — ${colorName}` : ""}`;
  const key = `${colorName}-${index}`;

  if (item.type === "video") {
    return <VideoWithPoster key={key} src={item.url} poster={item.poster} productName={name} />;
  }

  if (item.type === "model") {
    return <ModelViewerSlot key={key} src={item.url} alt={alt} poster={item.poster} />;
  }

  // Default: image
  return (
    <img
      key={key}
      src={item.url}
      alt={alt}
      className="w-full h-full object-cover transition-opacity duration-300"
    />
  );
}

export default function ProductConfigurator({ slug, accentColor }: Props) {
  const data = productVariants[slug];
  if (!data) return null;

  const isSingleVariant = data.variants.length === 1 && data.optionNames.length === 0;

  // Live data from Shopify — overrides static availability and prices
  const [liveVariantData, setLiveVariantData] = useState<Record<string, { available: boolean; price: string; currency: string }> | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const fetchLiveProduct = (countryOverride?: string) => {
    const BFF_BASE = (import.meta as any).env?.PUBLIC_BFF_URL || "/api";
    const stored = localStorage.getItem("smh-country");
    const country = countryOverride || stored || "";
    const qs = country ? `?country=${country}` : "";
    fetch(`${BFF_BASE}/products/${data.handle}${qs}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json?.product?.variants?.edges) return;
        const map: Record<string, { available: boolean; price: string; currency: string }> = {};
        for (const { node } of json.product.variants.edges) {
          map[node.id] = {
            available: node.availableForSale,
            price: node.price.amount,
            currency: node.price.currencyCode,
          };
        }
        setLiveVariantData(map);
        if (json.country) setDetectedCountry(json.country);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveProduct();

    // Re-fetch when country changes
    const handler = (e: Event) => {
      const code = (e as CustomEvent).detail?.country;
      if (code) fetchLiveProduct(code);
    };
    window.addEventListener("country:changed", handler);
    return () => window.removeEventListener("country:changed", handler);
  }, [data.handle]);

  // Merge live data into variant data
  const variants = useMemo(() => {
    if (!liveVariantData) return data.variants;
    return data.variants.map((v) => {
      const live = liveVariantData[v.id];
      if (!live) return v;
      return { ...v, available: live.available, price: live.price, currency: live.currency };
    });
  }, [data.variants, liveVariantData]);

  const optionValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const name of data.optionNames) {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const v of variants) {
        const val = v.options[name];
        if (val && !seen.has(val)) {
          seen.add(val);
          values.push(val);
        }
      }
      map[name] = values;
    }
    return map;
  }, [data, variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const name of data.optionNames) {
      defaults[name] = optionValues[name]?.[0] || "";
    }
    return defaults;
  });

  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const isRing = slug === "ring-one";

  const activeVariant = useMemo<Variant | undefined>(() => {
    if (isSingleVariant) return variants[0];
    return variants.find((v) =>
      data.optionNames.every((name) => v.options[name] === selected[name])
    );
  }, [selected, data, variants, isSingleVariant]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const colorOption = data.optionNames.find((n) => n === "Color" || n === "Finish");
  const selectedColorName = colorOption ? selected[colorOption] : undefined;
  const mediaItems: MediaItem[] = (selectedColorName && data.media?.[selectedColorName])
    || (data.media ? Object.values(data.media)[0] : undefined)
    || [];

  // Ambient color based on selected variant color
  const ambientColor = selectedColorName && data.ambientColors?.[selectedColorName];

  // Apply ambient background color to the page wrapper
  useEffect(() => {
    const wrapper = document.getElementById("configure-wrapper");
    if (wrapper && ambientColor) {
      wrapper.style.transition = "background-color 0.6s ease";
      wrapper.style.backgroundColor = ambientColor;
    } else if (wrapper) {
      wrapper.style.transition = "background-color 0.6s ease";
      wrapper.style.backgroundColor = "";
    }
  }, [ambientColor]);

  const currencyCode = activeVariant?.currency || "USD";
  const formatPrice = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(num);
    } catch {
      return `$${num.toFixed(2)}`;
    }
  };
  const totalPrice = activeVariant ? parseFloat(activeVariant.price) * quantity : 0;

  // Dispatch variant info for the sticky bar
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("configurator:variant", {
        detail: {
          variant: activeVariant,
          quantity,
          productName: data.name,
          totalPrice: activeVariant
            ? formatPrice(parseFloat(activeVariant.price) * quantity)
            : "—",
        },
      })
    );
  }, [activeVariant, quantity, data.name, currencyCode]);

  // Observe the add-to-cart button visibility for sticky bar
  useEffect(() => {
    const btn = addToCartRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(
          new CustomEvent("configurator:atc-visible", {
            detail: { visible: entry.isIntersecting },
          })
        );
      },
      { threshold: 0 }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  // Track view_item on initial load
  useEffect(() => {
    if (activeVariant) {
      trackViewItem({
        item_id: slug,
        item_name: data.name,
        price: parseFloat(activeVariant.price),
        currency: activeVariant.currency || "USD",
        item_variant: activeVariant.title,
      });
    }
  }, []); // fire once on mount

  const handleSelect = (optionName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [optionName]: value }));
    setStatus("idle");
    trackSelectVariant(data.name, optionName, value);
    if (optionName === "Color" || optionName === "Finish") {
      setActiveImageIndex(0);
    }
  };

  const handleAddToCart = async () => {
    if (!activeVariant || !activeVariant.available) return;
    setStatus("adding");
    try {
      await addToCart(activeVariant.id, quantity);
      trackAddToCart({
        item_id: slug,
        item_name: data.name,
        item_variant: activeVariant.title,
        price: parseFloat(activeVariant.price),
        currency: activeVariant.currency || "USD",
        quantity,
      });
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // Expose handleAddToCart globally for the sticky bar
  useEffect(() => {
    (window as any).__configuratorAddToCart = handleAddToCart;
    return () => { delete (window as any).__configuratorAddToCart; };
  }, [activeVariant, quantity]);

  return (
    <section className="py-10 sm:py-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Product media carousel */}
          <div className="lg:sticky lg:top-28 min-w-0">
            {/* Main viewer */}
            <div
              ref={swipeRef}
              className="relative aspect-[2/3] rounded-3xl overflow-hidden bg-brand-gray-900 touch-pan-y"
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const current = mediaItems[activeImageIndex];
                if (current?.type === "model") return; // let model-viewer handle touches
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 50 && mediaItems.length > 1) {
                  if (dx < 0) setActiveImageIndex((i) => (i + 1) % mediaItems.length);
                  else setActiveImageIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
                }
              }}
            >
              {mediaItems.length > 0 ? (
                <MediaViewer
                  item={mediaItems[activeImageIndex] || mediaItems[0]}
                  name={data.name}
                  colorName={selectedColorName}
                  index={activeImageIndex}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-gray-700">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Prev / Next arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
                    aria-label="Previous"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((i) => (i + 1) % mediaItems.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
                    aria-label="Next"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {mediaItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === activeImageIndex
                            ? "bg-white w-4"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`View media ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Mobile color switcher overlay */}
              {colorOption && (optionValues[colorOption]?.length ?? 0) > 1 && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 lg:hidden">
                  {optionValues[colorOption]?.map((value) => {
                    const hex = data.colorSwatches[value] || "#666";
                    const isActive = selected[colorOption] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(colorOption, value)}
                        className="w-10 h-10 rounded-full transition-all shadow-lg"
                        style={{
                          background: hex,
                          boxShadow: isActive
                            ? `0 0 0 2px #0d0d0d, 0 0 0 4px ${accentColor}`
                            : "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
                        }}
                        aria-label={value}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {mediaItems.map((item, i) => (
                  <button
                    key={`${selectedColorName}-thumb-${i}`}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImageIndex
                        ? "border-white/40"
                        : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    <img
                      src={item.type === "image" ? item.url : (item.poster || item.url)}
                      alt={item.alt || `${data.name} — ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge for video / 3D */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {item.type === "model" && (
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/50 text-[8px] uppercase tracking-wider text-white/70 font-medium">
                        3D
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Configuration */}
          <div className="lg:pt-4 min-w-0">
            <p
              className="text-[11px] uppercase tracking-[4px] mb-3"
              style={{ color: accentColor }}
            >
              Configure Your {data.name}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-300 uppercase leading-[0.95] mb-3">
              {data.name}
            </h1>
            <p className="text-sm text-brand-gray-400 mb-3">
              {slug === "ring-one" && "24/7 health tracking in a titanium ring."}
              {slug === "scale" && "13+ body metrics beyond weight."}
              {slug === "scale-pro" && "Segmental body composition analysis."}
              {slug === "bp-monitor" && "Clinical-grade blood pressure at home."}
              {slug === "hydra-one" && "Smart hydration tracking, all day."}
              {slug === "hema-one" && "Lab-quality blood analysis at home."}
            </p>
            <p className="text-3xl sm:text-4xl font-display font-400 mb-10" style={{ color: accentColor }}>
              {activeVariant ? formatPrice(activeVariant.price) : "—"}
            </p>

            {/* Option selectors */}
            {data.optionNames.map((optionName) => (
              <div key={optionName} className={`mb-10 ${(optionName === "Color" || optionName === "Finish") ? "hidden lg:block" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12px] uppercase tracking-[3px] text-brand-gray-400">
                    {optionName}: <span className="text-white font-medium">{selected[optionName]}</span>
                  </p>
                  {isRing && optionName === "Size" && (
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[11px] uppercase tracking-[1.5px] underline underline-offset-2 transition-colors hover:text-white"
                      style={{ color: accentColor }}
                    >
                      Size Guide
                    </button>
                  )}
                </div>

                {(optionName === "Color" || optionName === "Finish") ? (
                  <div className="hidden lg:flex gap-4">
                    {optionValues[optionName]?.map((value) => {
                      const hex = data.colorSwatches[value] || "#666";
                      const isActive = selected[optionName] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleSelect(optionName, value)}
                          className="group flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-14 h-14 rounded-full transition-all"
                            style={{
                              background: hex,
                              boxShadow: isActive
                                ? `0 0 0 2px #0d0d0d, 0 0 0 4px ${accentColor}`
                                : "0 0 0 1px rgba(255,255,255,0.1)",
                            }}
                          />
                          <span className={`text-[10px] uppercase tracking-[1.5px] transition-colors ${
                            isActive ? "text-white" : "text-brand-gray-600 group-hover:text-brand-gray-400"
                          }`}>
                            {value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {optionValues[optionName]?.map((value) => {
                      const isActive = selected[optionName] === value;
                      const variantForOption = variants.find((v) =>
                        v.options[optionName] === value &&
                        data.optionNames
                          .filter((n) => n !== optionName)
                          .every((n) => v.options[n] === selected[n])
                      );
                      const isAvailable = variantForOption?.available ?? false;

                      return (
                        <button
                          key={value}
                          onClick={() => handleSelect(optionName, value)}
                          disabled={!isAvailable}
                          className={`
                            w-14 h-14 text-[13px] font-medium rounded-full
                            transition-all border
                            ${isActive
                              ? "text-brand-black border-transparent"
                              : isAvailable
                                ? "text-white border-white/15 hover:border-white/30"
                                : "text-brand-gray-700 border-white/5 cursor-not-allowed"
                            }
                          `}
                          style={isActive ? { background: accentColor, borderColor: accentColor } : undefined}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-10">
              <p className="text-[12px] uppercase tracking-[3px] text-brand-gray-400 mb-4">Quantity</p>
              <div className="inline-flex items-center border border-white/10 rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-brand-gray-400 hover:text-white transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-brand-gray-400 hover:text-white transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 mb-8" />

            {/* Add to Cart */}
            <button
              ref={addToCartRef}
              onClick={handleAddToCart}
              disabled={!activeVariant?.available || status === "adding"}
              className={`
                w-full py-5 px-8 text-[14px] uppercase tracking-[2px] font-medium rounded-full
                transition-all duration-200
                ${!activeVariant?.available
                  ? "bg-brand-gray-800 text-brand-gray-500 cursor-not-allowed"
                  : status === "added"
                    ? "bg-green-500 text-white"
                    : status === "error"
                      ? "bg-red-500 text-white"
                      : "text-brand-black hover:opacity-90"
                }
              `}
              style={
                activeVariant?.available && (status === "idle" || status === "adding")
                  ? { background: accentColor }
                  : undefined
              }
            >
              {!activeVariant?.available
                ? "Out of Stock — Notify Me"
                : status === "adding"
                  ? "Adding..."
                  : status === "added"
                    ? "Added to Cart ✓"
                    : status === "error"
                      ? "Something went wrong — Try again"
                      : `Add to Cart — ${formatPrice(totalPrice)}`
              }
            </button>

            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-6 mt-5">
              <a
                href="/shop"
                className="text-[11px] uppercase tracking-[2px] text-brand-gray-500 hover:text-white transition-colors"
              >
                Continue Shopping
              </a>
              <span className="text-brand-gray-800">|</span>
              <a
                href={`/products/${slug}`}
                className="text-[11px] uppercase tracking-[2px] text-brand-gray-500 hover:text-white transition-colors"
              >
                Product Details
              </a>
            </div>

            {/* Delivery & Warranty Info */}
            <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
              {data.deliveryEstimate && (
                <div className="flex items-center gap-3 text-brand-gray-400">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h2.25m0 0V6.375c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v7.875m-9 0h9m4.5 0v-3.375c0-.621-.504-1.125-1.125-1.125h-1.5l-1.5-2.25h-3.375" />
                  </svg>
                  <div>
                    <span className="text-[11px] uppercase tracking-[1.5px]">Free shipping</span>
                    <span className="text-[11px] text-brand-gray-600 ml-1.5">· Est. {data.deliveryEstimate}</span>
                  </div>
                </div>
              )}
              {data.warrantyYears && (
                <div className="flex items-center gap-3 text-brand-gray-400">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <span className="text-[11px] uppercase tracking-[1.5px]">{data.warrantyYears}-year warranty</span>
                    <span className="text-[11px] text-brand-gray-600 ml-1.5">· <a href="/warranty" className="underline hover:text-brand-gray-300 transition-colors">Learn more</a></span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-brand-gray-400">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-[11px] uppercase tracking-[1.5px]">Secure encrypted checkout via Shopify</span>
              </div>
              <div className="flex items-center gap-3 text-brand-gray-400">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[11px] uppercase tracking-[1.5px]">30-day hassle-free returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Ring Size Guide Modal */}
      {isRing && (
        <RingSizeGuide
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          accentColor={accentColor}
          onSelectSize={(size) => handleSelect("Size", size)}
        />
      )}
    </section>
  );
}
