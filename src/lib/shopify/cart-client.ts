// Frontend cart client — talks to the BFF Worker, never directly to Shopify
// Cart ID is persisted in localStorage

const BFF_BASE = import.meta.env.PUBLIC_BFF_URL || "/api";
const CART_KEY = "smh-cart-id";
const COUNTRY_KEY = "smh-country";
// A discount code from a /discount/<code>/ link, waiting for a cart (public/_redirects rewrites the
// link to src/pages/discount/index.astro, which forwards to /shop/?discount=<code>). Cleared once a
// cart carries it.
const DISCOUNT_KEY = "smh-discount-code";
const DISCOUNT_CODE = /^[A-Za-z0-9_-]{1,64}$/;

// Takes ?discount=<code> off the address (kept, for the next cart) and answers the code waiting
// for a cart, if any.
function pendingDiscountCode(): string | null {
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("discount");
    if (fromUrl !== null) {
      if (DISCOUNT_CODE.test(fromUrl)) localStorage.setItem(DISCOUNT_KEY, fromUrl);
      url.searchParams.delete("discount");
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    }
    const code = localStorage.getItem(DISCOUNT_KEY);
    return code && DISCOUNT_CODE.test(code) ? code : null;
  } catch {
    return null;
  }
}

function clearPendingDiscountCode() {
  try {
    localStorage.removeItem(DISCOUNT_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function getStoredCartId(): string | null {
  try {
    return localStorage.getItem(CART_KEY);
  } catch {
    return null;
  }
}

function storeCartId(cartId: string) {
  try {
    localStorage.setItem(CART_KEY, cartId);
  } catch {
    // localStorage unavailable
  }
}

async function bffFetch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BFF_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error || `BFF ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface CartResponse {
  cart: {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    discountCodes?: { code: string; applicable: boolean }[];
    cost: {
      subtotalAmount: { amount: string; currencyCode: string };
      totalAmount: { amount: string; currencyCode: string };
    };
    lines: {
      edges: {
        node: {
          id: string;
          quantity: number;
          merchandise: {
            id: string;
            title: string;
            image: { url: string; altText: string } | null;
            product: {
              title: string;
              handle: string;
              featuredImage: { url: string; altText: string } | null;
            };
            price: { amount: string; currencyCode: string };
            selectedOptions: { name: string; value: string }[];
          };
          cost: { totalAmount: { amount: string; currencyCode: string } };
        };
      }[];
    };
  };
}

export function getStoredCountry(): string | null {
  try {
    return localStorage.getItem(COUNTRY_KEY);
  } catch {
    return null;
  }
}

export function storeCountry(code: string) {
  try {
    localStorage.setItem(COUNTRY_KEY, code);
  } catch {
    // localStorage unavailable
  }
}

export async function addToCart(
  variantId: string,
  quantity = 1
): Promise<CartResponse["cart"]> {
  const cartId = getStoredCartId();
  const countryCode = getStoredCountry() || undefined;

  const lines = [{ merchandiseId: variantId, quantity }];

  let result: CartResponse;

  if (cartId) {
    result = await bffFetch<CartResponse>("/cart/add", {
      cartId,
      lines,
      countryCode,
    });
  } else {
    const discount = pendingDiscountCode();
    result = await bffFetch<CartResponse>("/cart/create", {
      lines,
      countryCode,
      ...(discount ? { discountCodes: [discount] } : {}),
    });
    if (discount) clearPendingDiscountCode();
  }

  storeCartId(result.cart.id);
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function updateBuyerCountry(
  countryCode: string
): Promise<CartResponse["cart"] | null> {
  storeCountry(countryCode);
  const cartId = getStoredCartId();
  if (!cartId) return null;

  const result = await bffFetch<CartResponse>("/cart/buyer-identity", {
    cartId,
    countryCode,
  });

  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function updateLineItem(
  lineId: string,
  quantity: number
): Promise<CartResponse["cart"]> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error("No cart");

  const countryCode = getStoredCountry() || undefined;
  const result = await bffFetch<CartResponse>("/cart/update", {
    cartId,
    lines: [{ id: lineId, quantity }],
    countryCode,
  });

  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function removeLineItem(
  lineId: string
): Promise<CartResponse["cart"]> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error("No cart");

  const countryCode = getStoredCountry() || undefined;
  const result = await bffFetch<CartResponse>("/cart/remove", {
    cartId,
    lineIds: [lineId],
    countryCode,
  });

  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function getCart(): Promise<CartResponse["cart"] | null> {
  const discount = pendingDiscountCode();
  const cartId = getStoredCartId();
  if (!cartId) return null;

  if (discount) {
    try {
      const result = await bffFetch<CartResponse>("/cart/discount", {
        cartId,
        discountCodes: [discount],
        countryCode: getStoredCountry() || undefined,
      });
      clearPendingDiscountCode();
      return result.cart;
    } catch {
      // Cart expired: the code waits for the next cart (addToCart creates it with the code)
    }
  }

  try {
    const result = await bffFetch<CartResponse>(`/cart/${encodeURIComponent(cartId)}`);
    return result.cart;
  } catch {
    // Cart expired or invalid — clear it
    localStorage.removeItem(CART_KEY);
    return null;
  }
}

export function goToCheckout(checkoutUrl: string) {
  window.location.href = checkoutUrl;
}
