// Discount codes the site puts on a cart: a /discount/<code>/ link (public/_redirects sends it to
// /shop/?discount=<code>, and the cart client keeps the code for the cart).

// A code as such a link carries it (the backend's are SMH-XXXXXXXXXX): letters, digits, - and _,
// at most 64. Anything else is never sent to Shopify.
const DISCOUNT_CODE = /^[A-Za-z0-9_-]{1,64}$/;

// The body's discountCodes when it is a list of 1–5 well-formed codes, else null.
export function discountCodeList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 5) return null;
  return value.every((c) => typeof c === "string" && DISCOUNT_CODE.test(c)) ? (value as string[]) : null;
}
