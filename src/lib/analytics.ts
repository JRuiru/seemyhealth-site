// GA4 event helpers — thin wrappers around gtag()
// Follows Google's recommended ecommerce events:
// https://developers.google.com/analytics/devguides/collection/ga4/reference/events

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// ── Page-level ──────────────────────────────────────────────

export function trackViewItem(item: {
  item_id: string;
  item_name: string;
  price?: number;
  currency?: string;
  item_variant?: string;
  item_category?: string;
}) {
  gtag("event", "view_item", {
    currency: item.currency || "USD",
    value: item.price || 0,
    items: [item],
  });
}

// ── Variant / option selection ──────────────────────────────

export function trackSelectVariant(productName: string, optionName: string, value: string) {
  gtag("event", "select_content", {
    content_type: "product_option",
    item_id: productName,
    option_name: optionName,
    option_value: value,
  });
}

// ── Cart ────────────────────────────────────────────────────

export function trackAddToCart(item: {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  currency?: string;
  quantity: number;
}) {
  gtag("event", "add_to_cart", {
    currency: item.currency || "USD",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(item: {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  currency?: string;
  quantity: number;
}) {
  gtag("event", "remove_from_cart", {
    currency: item.currency || "USD",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackViewCart(items: {
  item_id: string;
  item_name: string;
  price: number;
  currency?: string;
  quantity: number;
}[], value: number, currency: string) {
  gtag("event", "view_cart", {
    currency,
    value,
    items,
  });
}

export function trackBeginCheckout(items: {
  item_id: string;
  item_name: string;
  price: number;
  currency?: string;
  quantity: number;
}[], value: number, currency: string) {
  gtag("event", "begin_checkout", {
    currency,
    value,
    items,
  });
}

// ── Engagement ──────────────────────────────────────────────

export function trackVideoPlay(productName: string) {
  gtag("event", "video_start", {
    video_title: productName,
  });
}

export function trackCTAClick(ctaLabel: string, destination: string) {
  gtag("event", "select_promotion", {
    creative_name: ctaLabel,
    promotion_name: destination,
  });
}

export function trackCountryChange(country: string) {
  gtag("event", "select_content", {
    content_type: "country",
    item_id: country,
  });
}
