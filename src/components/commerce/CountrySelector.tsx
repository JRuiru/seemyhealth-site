import { useState, useEffect, useRef } from "react";
import { storeCountry, getStoredCountry, updateBuyerCountry } from "../../lib/shopify/cart-client";
import { invalidatePricingCache } from "../../lib/shopify/pricing";

interface Country {
  isoCode: string;
  name: string;
  currency: { isoCode: string; symbol: string };
}

interface Props {
  className?: string;
}

export default function CountrySelector({ className = "" }: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [current, setCurrent] = useState<Country | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const BFF_BASE = (import.meta as any).env?.PUBLIC_BFF_URL || "/api";
    const stored = getStoredCountry();
    const qs = stored ? `?country=${stored}` : "";

    fetch(`${BFF_BASE}/localization${qs}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setCurrent(data.country);
        setCountries(data.availableCountries || []);

        // If no stored country yet, save the detected one
        if (!stored && data.detectedCountry) {
          storeCountry(data.detectedCountry);
        }
      })
      .catch(() => {});
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (country: Country) => {
    setCurrent(country);
    setOpen(false);
    storeCountry(country.isoCode);
    invalidatePricingCache();

    // Notify all components to re-fetch prices
    window.dispatchEvent(
      new CustomEvent("country:changed", { detail: { country: country.isoCode } })
    );

    // Update existing cart's buyer identity
    try {
      await updateBuyerCountry(country.isoCode);
    } catch {
      // No cart yet — that's fine
    }
  };

  if (!current) return null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-brand-gray-400 hover:text-white transition-colors"
      >
        <span className="text-base">{countryFlag(current.isoCode)}</span>
        <span>{current.currency.isoCode}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && countries.length > 0 && (
        <div className="absolute bottom-full mb-2 right-0 w-64 max-h-72 overflow-y-auto bg-brand-gray-900 border border-white/10 rounded-xl shadow-2xl z-50">
          {countries.map((c) => (
            <button
              key={c.isoCode}
              onClick={() => handleSelect(c)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${
                c.isoCode === current.isoCode ? "text-white bg-white/5" : "text-brand-gray-400"
              }`}
            >
              <span className="text-base">{countryFlag(c.isoCode)}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-brand-gray-600">
                {c.currency.isoCode}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Convert country code to emoji flag
function countryFlag(code: string): string {
  try {
    return String.fromCodePoint(
      ...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  } catch {
    return code;
  }
}
