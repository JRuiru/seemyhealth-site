// SeeMyHealth BFF Worker
// Sits between the Astro frontend and Shopify/analytics APIs
// Deployed as a separate Cloudflare Worker at /api/* routes

import {
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
  cartGet,
  getProductByHandle,
  getLocalization,
  cartBuyerIdentityUpdate,
  type ShopifyConfig,
} from "./shopify";

import {
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  buildLogoutUrl,
  type CustomerAuthConfig,
} from "./customer-auth";

import {
  sendSalesNotification,
  sendCustomerAcknowledgment,
  type ContactFormData,
} from "./email";

interface Env {
  SHOPIFY_STORE_DOMAIN: string;
  SHOPIFY_STOREFRONT_TOKEN: string;
  SHOPIFY_ADMIN_TOKEN: string;
  SHOPIFY_CUSTOMER_CLIENT_ID: string;
  SHOPIFY_SHOP_ID: string;
  WEBHOOK_SECRET: string;
  SENDGRID_API_KEY: string;
  SALES_EMAIL: string;
  SENDGRID_SALES_TEMPLATE_ID: string;
  SENDGRID_ACK_TEMPLATE_ID: string;
  JUDGEME_SHOP_DOMAIN: string;
  JUDGEME_PUBLIC_TOKEN: string;
  JUDGEME_PRIVATE_TOKEN: string;
  ALLOWED_ORIGINS: string;
}

const SITE_ORIGIN = "https://www.seemyhealth.ai";
const ACCOUNT_ORIGIN = "https://account.seemyhealth.ai";

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());

  const isAllowed =
    allowed.includes(origin) || origin.startsWith("http://localhost");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowed[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function error(message: string, status = 400, headers: HeadersInit = {}): Response {
  return json({ error: message }, status, headers);
}

function redirect(url: string, cookies?: string[]): Response {
  const headers = new Headers({ Location: url });
  if (cookies) {
    for (const cookie of cookies) {
      headers.append("Set-Cookie", cookie);
    }
  }
  return new Response(null, { status: 302, headers });
}

function cookie(name: string, value: string, maxAge = 600): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const shopify: ShopifyConfig = {
      storeDomain: env.SHOPIFY_STORE_DOMAIN,
      storefrontToken: env.SHOPIFY_STOREFRONT_TOKEN,
    };

    const customerAuth: CustomerAuthConfig = {
      clientId: env.SHOPIFY_CUSTOMER_CLIENT_ID,
      shopId: env.SHOPIFY_SHOP_ID,
      customerAccountDomain: "account.seemyhealth.ai",
      redirectUri: `${SITE_ORIGIN}/api/auth/callback`,
    };

    // Detect buyer country from Cloudflare header or explicit query param
    const cfCountry = request.headers.get("cf-ipcountry") || undefined;
    const queryCountry = url.searchParams.get("country") || undefined;
    const buyerCountry = queryCountry || cfCountry; // explicit override wins

    try {
      // ============================================================
      // LOCALIZATION
      // ============================================================

      // GET /api/localization — detected country + available markets
      if (path === "/api/localization" && request.method === "GET") {
        const localization = await getLocalization(shopify, buyerCountry);
        return json({ ...localization, detectedCountry: cfCountry || null }, 200, {
          ...cors,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        });
      }

      // ============================================================
      // AUTH ROUTES — Shopify Customer Account API (OAuth 2.0 PKCE)
      // ============================================================

      // GET /api/auth/login — Redirects to Shopify login
      if (path === "/api/auth/login" && request.method === "GET") {
        const state = crypto.randomUUID();
        const { url: authUrl, codeVerifier, nonce } = await buildAuthorizationUrl(customerAuth, state);

        return redirect(authUrl, [
          cookie("smh_auth_state", state),
          cookie("smh_code_verifier", codeVerifier),
          cookie("smh_nonce", nonce),
        ]);
      }

      // GET /api/auth/callback — Shopify redirects back here with code
      if (path === "/api/auth/callback" && request.method === "GET") {
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedState = getCookie(request, "smh_auth_state");
        const codeVerifier = getCookie(request, "smh_code_verifier");

        if (!code || !state || !storedState || !codeVerifier) {
          return redirect(`${SITE_ORIGIN}/account?error=missing_params`);
        }

        if (state !== storedState) {
          return redirect(`${SITE_ORIGIN}/account?error=state_mismatch`);
        }

        let tokens;
        try {
          tokens = await exchangeCodeForTokens(customerAuth, code, codeVerifier);
        } catch (e: any) {
          console.error("Token exchange error:", e.message);
          return redirect(`${SITE_ORIGIN}/account?error=token_exchange`);
        }

        // Store tokens in secure httpOnly cookies
        // Access token is short-lived, refresh token is long-lived
        return redirect(`${SITE_ORIGIN}/account`, [
          cookie("smh_access_token", tokens.access_token, tokens.expires_in),
          cookie("smh_refresh_token", tokens.refresh_token, 60 * 60 * 24 * 30), // 30 days
          cookie("smh_id_token", tokens.id_token, 60 * 60 * 24 * 30),
          clearCookie("smh_auth_state"),
          clearCookie("smh_code_verifier"),
          clearCookie("smh_nonce"),
        ]);
      }

      // POST /api/auth/refresh — Refresh access token
      if (path === "/api/auth/refresh" && request.method === "POST") {
        const refreshToken = getCookie(request, "smh_refresh_token");
        if (!refreshToken) {
          return error("No refresh token", 401, cors);
        }

        const tokens = await refreshAccessToken(customerAuth, refreshToken);

        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Set-Cookie", cookie("smh_access_token", tokens.access_token, tokens.expires_in));
        headers.append("Set-Cookie", cookie("smh_refresh_token", tokens.refresh_token, 60 * 60 * 24 * 30));
        // Add CORS headers
        for (const [key, value] of Object.entries(cors)) {
          headers.set(key, value as string);
        }

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
      }

      // GET /api/auth/logout — Clear tokens and redirect to Shopify logout
      if (path === "/api/auth/logout" && request.method === "GET") {
        const idToken = getCookie(request, "smh_id_token");

        const cookies = [
          clearCookie("smh_access_token"),
          clearCookie("smh_refresh_token"),
          clearCookie("smh_id_token"),
        ];

        if (idToken) {
          const logoutUrl = buildLogoutUrl(customerAuth, idToken);
          return redirect(logoutUrl, cookies);
        }

        return redirect(SITE_ORIGIN, cookies);
      }

      // GET /api/auth/me — Get current customer info (proxied to Customer Account API)
      if (path === "/api/auth/me" && request.method === "GET") {
        const accessToken = getCookie(request, "smh_access_token");
        if (!accessToken) {
          return json({ customer: null }, 200, cors);
        }

        // Customer Account API GraphQL — discovered via /.well-known/customer-account-api
        const graphqlUrl = `https://${customerAuth.customerAccountDomain}/customer/api/2026-04/graphql`;
        const res = await fetch(graphqlUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken,
              Origin: SITE_ORIGIN,
              "User-Agent": "SeeMyHealth-BFF/1.0",
            },
            body: JSON.stringify({
              query: `{
                customer {
                  id
                  firstName
                  lastName
                  emailAddress { emailAddress }
                  defaultAddress {
                    address1
                    city
                    country
                    province
                    zip
                  }
                  orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
                    edges {
                      node {
                        id
                        number
                        processedAt
                        financialStatus
                        totalPrice { amount currencyCode }
                        lineItems(first: 10) {
                          edges {
                            node {
                              title
                              quantity
                              image { url altText }
                              price { amount currencyCode }
                              variantTitle
                            }
                          }
                        }
                        fulfillments(first: 5) {
                          edges {
                            node {
                              status
                              trackingInformation {
                                number
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }`,
            }),
          }
        );

        if (!res.ok) {
          console.error(`Customer API error: ${res.status}`);
          // Token might be expired
          if (res.status === 401) {
            return json({ customer: null, expired: true }, 200, cors);
          }
          return json({ customer: null }, 200, cors);
        }

        const data = await res.json() as any;
        // Only pass customer data to client, never raw GraphQL response
        const customer = data?.data?.customer || null;
        return json({ data: { customer } }, 200, cors);
      }

      // ============================================================
      // CART ROUTES
      // ============================================================

      // POST /api/cart/create
      if (path === "/api/cart/create" && request.method === "POST") {
        const body = (await request.json()) as {
          lines: { merchandiseId: string; quantity: number }[];
          countryCode?: string;
        };

        if (!body.lines?.length) {
          return error("lines[] required", 400, cors);
        }

        const country = body.countryCode || buyerCountry;
        const cart = await cartCreate(shopify, body.lines, country);
        return json({ cart }, 200, cors);
      }

      // POST /api/cart/buyer-identity — update buyer country on existing cart
      if (path === "/api/cart/buyer-identity" && request.method === "POST") {
        const body = (await request.json()) as {
          cartId: string;
          countryCode: string;
        };

        if (!body.cartId || !body.countryCode) {
          return error("cartId and countryCode required", 400, cors);
        }

        const cart = await cartBuyerIdentityUpdate(shopify, body.cartId, body.countryCode);
        return json({ cart }, 200, cors);
      }

      // POST /api/cart/add
      if (path === "/api/cart/add" && request.method === "POST") {
        const body = (await request.json()) as {
          cartId: string;
          lines: { merchandiseId: string; quantity: number }[];
          countryCode?: string;
        };

        if (!body.cartId || !body.lines?.length) {
          return error("cartId and lines[] required", 400, cors);
        }

        const country = body.countryCode || buyerCountry;
        const cart = await cartLinesAdd(shopify, body.cartId, body.lines, country);
        return json({ cart }, 200, cors);
      }

      // POST /api/cart/update
      if (path === "/api/cart/update" && request.method === "POST") {
        const body = (await request.json()) as {
          cartId: string;
          lines: { id: string; quantity: number }[];
          countryCode?: string;
        };

        if (!body.cartId || !body.lines?.length) {
          return error("cartId and lines[] required", 400, cors);
        }

        const country = body.countryCode || buyerCountry;
        const cart = await cartLinesUpdate(shopify, body.cartId, body.lines, country);
        return json({ cart }, 200, cors);
      }

      // POST /api/cart/remove
      if (path === "/api/cart/remove" && request.method === "POST") {
        const body = (await request.json()) as {
          cartId: string;
          lineIds: string[];
          countryCode?: string;
        };

        if (!body.cartId || !body.lineIds?.length) {
          return error("cartId and lineIds[] required", 400, cors);
        }

        const country = body.countryCode || buyerCountry;
        const cart = await cartLinesRemove(shopify, body.cartId, body.lineIds, country);
        return json({ cart }, 200, cors);
      }

      // GET /api/cart/:id
      if (path.startsWith("/api/cart/") && request.method === "GET") {
        const cartId = decodeURIComponent(path.replace("/api/cart/", ""));
        if (!cartId) return error("Cart ID required", 400, cors);

        const cart = await cartGet(shopify, cartId, buyerCountry);
        if (!cart) return error("Cart not found", 404, cors);

        return json({ cart }, 200, {
          ...cors,
          "Cache-Control": "private, no-cache",
        });
      }

      // ============================================================
      // PRODUCT ROUTES
      // ============================================================

      // GET /api/products/:handle?country=XX
      if (path.startsWith("/api/products/") && request.method === "GET") {
        const handle = path.replace("/api/products/", "");
        if (!handle) return error("Product handle required", 400, cors);

        const product = await getProductByHandle(shopify, handle, buyerCountry);
        if (!product) return error("Product not found", 404, cors);

        return json({ product, country: buyerCountry || null }, 200, {
          ...cors,
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        });
      }

      // ============================================================
      // CONTACT FORM
      // ============================================================

      // POST /api/contact — Business enquiry form
      if (path === "/api/contact" && request.method === "POST") {
        const body = (await request.json()) as ContactFormData;

        if (!body.company || !body.name || !body.email || !body.model) {
          return error("company, name, email, and model are required", 400, cors);
        }

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
          return error("Invalid email address", 400, cors);
        }

        // Send both emails in parallel
        await Promise.all([
          sendSalesNotification(env.SENDGRID_API_KEY, env.SALES_EMAIL, env.SENDGRID_SALES_TEMPLATE_ID, body),
          sendCustomerAcknowledgment(env.SENDGRID_API_KEY, env.SENDGRID_ACK_TEMPLATE_ID, body),
        ]);

        return json({ sent: true }, 200, cors);
      }

      // ============================================================
      // ============================================================
      // REVIEWS (Judge.me)
      // ============================================================

      // GET /api/reviews?handle=ring-one&page=1&per_page=5
      if (path === "/api/reviews" && request.method === "GET") {
        const handle = url.searchParams.get("handle");
        const page = url.searchParams.get("page") || "1";
        const perPage = url.searchParams.get("per_page") || "5";

        const params = new URLSearchParams({
          api_token: env.JUDGEME_PRIVATE_TOKEN,
          shop_domain: env.JUDGEME_SHOP_DOMAIN,
          per_page: perPage,
          page,
        });

        if (handle) {
          // Get Shopify product ID from handle first
          const productRes = await fetch(
            `https://judge.me/api/v1/widgets/product_review?api_token=${env.JUDGEME_PUBLIC_TOKEN}&shop_domain=${env.JUDGEME_SHOP_DOMAIN}&handle=${handle}`
          );
          const productData = (await productRes.json()) as { product_external_id?: number };
          if (productData.product_external_id) {
            params.set("product_id", String(productData.product_external_id));
          }
        }

        const res = await fetch(`https://judge.me/api/v1/reviews?${params}`);
        const data = await res.json();
        return json(data, 200, cors);
      }

      // GET /api/reviews/summary?handle=ring-one — rating + count for a product
      if (path === "/api/reviews/summary" && request.method === "GET") {
        const handle = url.searchParams.get("handle") || "";
        const res = await fetch(
          `https://judge.me/api/v1/widgets/product_review?api_token=${env.JUDGEME_PUBLIC_TOKEN}&shop_domain=${env.JUDGEME_SHOP_DOMAIN}&handle=${handle}`
        );
        const data = (await res.json()) as { widget?: string };
        // Extract rating and count from widget HTML
        const widgetHtml = data.widget || "";
        const ratingMatch = widgetHtml.match(/data-average-rating='([\d.]+)'/);
        const countMatch = widgetHtml.match(/data-number-of-reviews='(\d+)'/);
        return json({
          handle,
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          count: countMatch ? parseInt(countMatch[1]) : 0,
        }, 200, cors);
      }

      // GET /api/reviews/all — all reviews across all products (for /reviews page)
      if (path === "/api/reviews/all" && request.method === "GET") {
        const page = url.searchParams.get("page") || "1";
        const perPage = url.searchParams.get("per_page") || "10";
        const params = new URLSearchParams({
          api_token: env.JUDGEME_PRIVATE_TOKEN,
          shop_domain: env.JUDGEME_SHOP_DOMAIN,
          per_page: perPage,
          page,
        });
        const res = await fetch(`https://judge.me/api/v1/reviews?${params}`);
        const data = await res.json();
        return json(data, 200, cors);
      }

      // POST /api/reviews — submit a new review
      if (path === "/api/reviews" && request.method === "POST") {
        const body = (await request.json()) as {
          product_handle: string;
          rating: number;
          title: string;
          body: string;
          reviewer_name: string;
          reviewer_email: string;
        };

        if (!body.product_handle || !body.rating || !body.reviewer_email) {
          return error("Missing required fields", 400, cors);
        }

        // Get product external ID
        const widgetRes = await fetch(
          `https://judge.me/api/v1/widgets/product_review?api_token=${env.JUDGEME_PUBLIC_TOKEN}&shop_domain=${env.JUDGEME_SHOP_DOMAIN}&handle=${body.product_handle}`
        );
        const widgetData = (await widgetRes.json()) as { product_external_id?: number };

        if (!widgetData.product_external_id) {
          return error("Product not found", 404, cors);
        }

        const res = await fetch("https://judge.me/api/v1/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop_domain: env.JUDGEME_SHOP_DOMAIN,
            platform: "shopify",
            id: widgetData.product_external_id,
            name: body.reviewer_name,
            email: body.reviewer_email,
            rating: body.rating,
            title: body.title,
            body: body.body,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          return error(`Judge.me error: ${errText}`, res.status, cors);
        }

        return json({ submitted: true }, 201, cors);
      }

      // WEBHOOKS
      // ============================================================

      // POST /api/webhooks/shopify
      if (path === "/api/webhooks/shopify" && request.method === "POST") {
        const hmac = request.headers.get("X-Shopify-Hmac-SHA256");
        if (!hmac) return error("Missing HMAC", 401, cors);

        const rawBody = await request.text();
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(env.WEBHOOK_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(rawBody)
        );
        const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));

        if (computed !== hmac) {
          return error("Invalid webhook signature", 401, cors);
        }

        const topic = request.headers.get("X-Shopify-Topic") || "";
        const payload = JSON.parse(rawBody);
        console.log(`Webhook received: ${topic}`, payload.id);

        return json({ received: true }, 200, cors);
      }

      // Health check
      if (path === "/api/health") {
        return json({ status: "ok", timestamp: Date.now() }, 200, cors);
      }

      return error("Not found", 404, cors);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      console.error("BFF error:", message);
      return error("Internal error", 500, cors);
    }
  },
} satisfies ExportedHandler<Env>;
