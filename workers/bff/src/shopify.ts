// Shopify Storefront API client for the BFF Worker

const STOREFRONT_API_VERSION = "2025-04";

export interface ShopifyConfig {
  storeDomain: string;
  storefrontToken: string;
}

export async function storefrontFetch<T>(
  config: ShopifyConfig,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const url = `https://${config.storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`Shopify GQL: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json.data!;
}

// --- GraphQL fragments ---

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText width height }
              product {
                title
                handle
                featuredImage { url altText width height }
              }
              price { amount currencyCode }
              selectedOptions { name value }
            }
          }
          cost {
            totalAmount { amount currencyCode }
          }
        }
      }
    }
  }
`;

// --- Cart operations ---

export async function cartCreate(
  config: ShopifyConfig,
  lines: { merchandiseId: string; quantity: number }[],
  countryCode?: string
) {
  const context = countryCode ? `@inContext(country: ${countryCode})` : "";
  const data = await storefrontFetch<{
    cartCreate: { cart: unknown; userErrors: { field: string; message: string }[] };
  }>(
    config,
    `${CART_FRAGMENT}
    mutation ($input: CartInput!) ${context} {
      cartCreate(input: $input) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }`,
    {
      input: {
        lines,
        ...(countryCode ? { buyerIdentity: { countryCode } } : {}),
      },
    }
  );

  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
  }
  return data.cartCreate.cart;
}

export async function cartLinesAdd(
  config: ShopifyConfig,
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  countryCode?: string
) {
  const context = countryCode ? `@inContext(country: ${countryCode})` : "";
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: unknown; userErrors: { field: string; message: string }[] };
  }>(
    config,
    `${CART_FRAGMENT}
    mutation ($cartId: ID!, $lines: [CartLineInput!]!) ${context} {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }`,
    { cartId, lines }
  );

  if (data.cartLinesAdd.userErrors.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(", "));
  }
  return data.cartLinesAdd.cart;
}

export async function cartLinesUpdate(
  config: ShopifyConfig,
  cartId: string,
  lines: { id: string; quantity: number }[],
  countryCode?: string
) {
  const context = countryCode ? `@inContext(country: ${countryCode})` : "";
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: unknown; userErrors: { field: string; message: string }[] };
  }>(
    config,
    `${CART_FRAGMENT}
    mutation ($cartId: ID!, $lines: [CartLineUpdateInput!]!) ${context} {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }`,
    { cartId, lines }
  );

  if (data.cartLinesUpdate.userErrors.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(", "));
  }
  return data.cartLinesUpdate.cart;
}

export async function cartLinesRemove(
  config: ShopifyConfig,
  cartId: string,
  lineIds: string[],
  countryCode?: string
) {
  const context = countryCode ? `@inContext(country: ${countryCode})` : "";
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: unknown; userErrors: { field: string; message: string }[] };
  }>(
    config,
    `${CART_FRAGMENT}
    mutation ($cartId: ID!, $lineIds: [ID!]!) ${context} {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }`,
    { cartId, lineIds }
  );

  if (data.cartLinesRemove.userErrors.length) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(", "));
  }
  return data.cartLinesRemove.cart;
}

export async function cartGet(config: ShopifyConfig, cartId: string, countryCode?: string) {
  const context = countryCode ? `@inContext(country: ${countryCode})` : "";
  const data = await storefrontFetch<{ cart: unknown }>(
    config,
    `${CART_FRAGMENT}
    query ($cartId: ID!) ${context} {
      cart(id: $cartId) { ...CartFields }
    }`,
    { cartId }
  );
  return data.cart;
}

export async function getProductByHandle(config: ShopifyConfig, handle: string, country?: string) {
  const contextDirective = country ? `@inContext(country: ${country})` : "";
  const data = await storefrontFetch<{ product: unknown }>(
    config,
    `query ($handle: String!) ${contextDirective} {
      product(handle: $handle) {
        id title handle availableForSale
        variants(first: 50) {
          edges {
            node {
              id title availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
      }
    }`,
    { handle }
  );
  return data.product;
}

export async function getLocalization(config: ShopifyConfig, country?: string) {
  const contextDirective = country ? `@inContext(country: ${country})` : "";
  const data = await storefrontFetch<{
    localization: {
      country: { isoCode: string; name: string; currency: { isoCode: string; name: string; symbol: string } };
      availableCountries: { isoCode: string; name: string; currency: { isoCode: string; name: string; symbol: string } }[];
    };
  }>(
    config,
    `query ${contextDirective} {
      localization {
        country {
          isoCode
          name
          currency { isoCode name symbol }
        }
        availableCountries {
          isoCode
          name
          currency { isoCode name symbol }
        }
      }
    }`
  );
  return data.localization;
}

export async function cartBuyerIdentityUpdate(
  config: ShopifyConfig,
  cartId: string,
  countryCode: string
) {
  const context = `@inContext(country: ${countryCode})`;
  const data = await storefrontFetch<{
    cartBuyerIdentityUpdate: { cart: unknown; userErrors: { field: string; message: string }[] };
  }>(
    config,
    `${CART_FRAGMENT}
    mutation ($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) ${context} {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }`,
    { cartId, buyerIdentity: { countryCode } }
  );

  if (data.cartBuyerIdentityUpdate.userErrors.length) {
    throw new Error(data.cartBuyerIdentityUpdate.userErrors.map((e) => e.message).join(", "));
  }
  return data.cartBuyerIdentityUpdate.cart;
}
