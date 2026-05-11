import { useState, useEffect } from "react";

interface Props {
  accentColor: string;
}

interface VariantInfo {
  variant: { price: string; available: boolean } | undefined;
  quantity: number;
  productName: string;
  totalPrice: string;
}

export default function StickyAddToCart({ accentColor }: Props) {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState<VariantInfo | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const onVariant = (e: Event) => {
      setInfo((e as CustomEvent).detail);
    };
    const onVisibility = (e: Event) => {
      const { visible: atcVisible } = (e as CustomEvent).detail;
      setVisible(!atcVisible);
    };
    window.addEventListener("configurator:variant", onVariant);
    window.addEventListener("configurator:atc-visible", onVisibility);
    return () => {
      window.removeEventListener("configurator:variant", onVariant);
      window.removeEventListener("configurator:atc-visible", onVisibility);
    };
  }, []);

  if (!visible || !info) return null;

  const handleClick = async () => {
    const fn = (window as any).__configuratorAddToCart;
    if (fn) {
      setAdding(true);
      await fn();
      setAdding(false);
    }
  };

  const isAvailable = info.variant?.available ?? false;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 backdrop-blur-xl bg-brand-black/90"
      style={{ animation: "slideUp 0.25s ease-out" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Product info */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{info.productName}</p>
          <p className="text-sm font-display" style={{ color: accentColor }}>
            ${info.totalPrice}
          </p>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleClick}
          disabled={!isAvailable || adding}
          className={`
            shrink-0 px-6 sm:px-10 py-3 text-[12px] sm:text-[13px] uppercase tracking-[1.5px] font-medium rounded-full
            transition-all duration-200
            ${!isAvailable
              ? "bg-brand-gray-800 text-brand-gray-500 cursor-not-allowed"
              : "text-brand-black hover:opacity-90"
            }
          `}
          style={isAvailable ? { background: accentColor } : undefined}
        >
          {!isAvailable ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
