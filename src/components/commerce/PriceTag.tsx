import { useState, useEffect } from "react";
import {
  fetchProductPricing,
  formatLocalizedPrice,
  getFromPrice,
  type ProductPricing,
} from "../../lib/shopify/pricing";

interface Props {
  handle: string;
  /** "from" = lowest variant price, "variant" = specific variant title match */
  mode?: "from" | "variant";
  variantTitle?: string;
  className?: string;
  prefix?: string; // e.g. "From " or ""
  fallback?: string; // static fallback while loading, e.g. "$179.99"
}

/**
 * Drop-in component that displays a localized price for any product.
 * Fetches from the shared pricing cache (sessionStorage-backed).
 *
 * Usage:
 *   <PriceTag handle="ring-one" mode="from" prefix="From " fallback="$179.99" />
 *   <PriceTag handle="scale" mode="variant" variantTitle="Obsidian Black" fallback="$99.99" />
 */
export default function PriceTag({
  handle,
  mode = "from",
  variantTitle,
  className = "",
  prefix = "",
  fallback,
}: Props) {
  const [display, setDisplay] = useState<string | null>(null);

  const updatePrice = (pricing: ProductPricing | null, cancelled: boolean) => {
    if (cancelled || !pricing) return;
    let formatted: string | undefined;

    if (mode === "variant" && variantTitle) {
      const variant = pricing.variants.find((v) => v.title === variantTitle);
      if (variant) formatted = formatLocalizedPrice(variant.price);
    } else {
      formatted = formatLocalizedPrice(getFromPrice(pricing));
    }

    // Only update if the live price differs from the fallback
    if (formatted && formatted !== fallback) {
      setDisplay(formatted);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchProductPricing(handle).then((pricing) => updatePrice(pricing, cancelled));

    const handler = () => {
      fetchProductPricing(handle).then((pricing) => updatePrice(pricing, cancelled));
    };

    window.addEventListener("country:changed", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("country:changed", handler);
    };
  }, [handle, mode, variantTitle]);

  return (
    <span className={className}>
      {prefix}{display || fallback || "…"}
    </span>
  );
}
