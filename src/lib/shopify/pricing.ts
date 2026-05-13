// Shared pricing cache — fetches localized prices from Shopify once per session
// All components and pages read from this cache to display market-local prices

const BFF_BASE = typeof window !== "undefined"
  ? ((import.meta as any).env?.PUBLIC_BFF_URL || "/api")
  : "/api";

const COUNTRY_KEY = "smh-country";
const PRICING_CACHE_KEY = "smh-pricing";
const PRICING_TTL = 30 * 60 * 1000; // 30 minutes

export interface LocalizedPrice {
  amount: string;
  currencyCode: string;
}

export interface VariantPrice {
  id: string;
  title: string;
  available: boolean;
  price: LocalizedPrice;
  compareAtPrice: LocalizedPrice | null;
  options: { name: string; value: string }[];
}

export interface ProductPricing {
  handle: string;
  variants: VariantPrice[];
}

interface PricingCache {
  country: string;
  products: Record<string, ProductPricing>;
  timestamp: number;
}

let memoryCache: PricingCache | null = null;

function getStoredCountry(): string {
  try {
    return localStorage.getItem(COUNTRY_KEY) || "";
  } catch {
    return "";
  }
}

function getStoredCache(): PricingCache | null {
  try {
    const raw = sessionStorage.getItem(PRICING_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as PricingCache;
    // Invalidate if country changed or expired
    if (cache.country !== getStoredCountry()) return null;
    if (Date.now() - cache.timestamp > PRICING_TTL) return null;
    return cache;
  } catch {
    return null;
  }
}

function saveCache(cache: PricingCache) {
  memoryCache = cache;
  try {
    sessionStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage full or unavailable
  }
}

// Fetch a single product's localized pricing
export async function fetchProductPricing(handle: string): Promise<ProductPricing | null> {
  const country = getStoredCountry();
  const qs = country ? `?country=${country}` : "";

  try {
    const res = await fetch(`${BFF_BASE}/products/${handle}${qs}`);
    if (!res.ok) return null;

    const json = await res.json();
    if (!json?.product?.variants?.edges) return null;

    const variants: VariantPrice[] = json.product.variants.edges.map(
      ({ node }: any) => ({
        id: node.id,
        title: node.title,
        available: node.availableForSale,
        price: node.price,
        compareAtPrice: node.compareAtPrice || null,
        options: node.selectedOptions,
      })
    );

    return { handle, variants };
  } catch {
    return null;
  }
}

// Fetch pricing for multiple products, using cache
export async function fetchAllPricing(
  handles: string[]
): Promise<Record<string, ProductPricing>> {
  const country = getStoredCountry();

  // Check memory cache first, then sessionStorage
  const cached = memoryCache || getStoredCache();
  if (cached && cached.country === country) {
    const missing = handles.filter((h) => !cached.products[h]);
    if (missing.length === 0) return cached.products;

    // Fetch only missing products
    const results = await Promise.all(missing.map(fetchProductPricing));
    for (const r of results) {
      if (r) cached.products[r.handle] = r;
    }
    cached.timestamp = Date.now();
    saveCache(cached);
    return cached.products;
  }

  // Fresh fetch for all products
  const results = await Promise.all(handles.map(fetchProductPricing));
  const products: Record<string, ProductPricing> = {};
  for (const r of results) {
    if (r) products[r.handle] = r;
  }

  const newCache: PricingCache = { country, products, timestamp: Date.now() };
  saveCache(newCache);
  return products;
}

// Get the "from" price for a product (lowest variant price)
export function getFromPrice(pricing: ProductPricing): LocalizedPrice {
  const sorted = [...pricing.variants].sort(
    (a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount)
  );
  return sorted[0]?.price || { amount: "0", currencyCode: "USD" };
}

// Format a price with locale-aware currency
export function formatLocalizedPrice(price: LocalizedPrice): string {
  const num = parseFloat(price.amount);
  const isWhole = num % 1 === 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currencyCode,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return isWhole ? `$${num}` : `$${num.toFixed(2)}`;
  }
}

// Invalidate cache (call when country changes)
export function invalidatePricingCache() {
  memoryCache = null;
  try {
    sessionStorage.removeItem(PRICING_CACHE_KEY);
  } catch {}
}

// Listen for country changes and invalidate
if (typeof window !== "undefined") {
  window.addEventListener("country:changed", () => {
    invalidatePricingCache();
  });
}
