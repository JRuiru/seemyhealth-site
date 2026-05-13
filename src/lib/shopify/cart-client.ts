// Frontend cart client — talks to the BFF Worker, never directly to Shopify
// Cart ID is persisted in localStorage

const BFF_BASE = import.meta.env.PUBLIC_BFF_URL || "/api";
const CART_KEY = "smh-cart-id";
const COUNTRY_KEY = "smh-country";

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
    });
  } else {
    result = await bffFetch<CartResponse>("/cart/create", {
      lines,
      countryCode,
    });
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

  const result = await bffFetch<CartResponse>("/cart/update", {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function removeLineItem(
  lineId: string
): Promise<CartResponse["cart"]> {
  const cartId = getStoredCartId();
  if (!cartId) throw new Error("No cart");

  const result = await bffFetch<CartResponse>("/cart/remove", {
    cartId,
    lineIds: [lineId],
  });

  window.dispatchEvent(new CustomEvent("cart:updated", { detail: result.cart }));
  return result.cart;
}

export async function getCart(): Promise<CartResponse["cart"] | null> {
  const cartId = getStoredCartId();
  if (!cartId) return null;

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
