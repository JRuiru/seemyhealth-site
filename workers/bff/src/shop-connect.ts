// Connect a store (Shopify) account to a SeeMyHealth app account.
//
// The app mints a single-use connect token (POST /api/v2/client/shop/account/connect on the
// backend) and opens https://seemyhealth.ai/account/connect?t=<token>. The page signs the visitor in
// to the store, then POSTs { t } to /api/shop/connect here. This module:
//
//   1. reads the signed-in customer from the SESSION (the httpOnly access token cookie, asked of the
//      Customer Account API): their id and email. Nothing about the customer comes from the browser.
//   2. calls the backend's server-to-server webhook, POST {BACKEND_API_BASE}/webhooks/shop/connect,
//      with Authorization: Bearer <SHOP_CONNECT_WEBHOOK_TOKEN> and { token, customer_id, email }.
//   3. maps the backend's answer onto a small closed set of outcomes for the page.
//
// The connect token is a bearer secret: it is never logged, and neither is the backend's body.
//
// Self-contained (no imports) so `npm test` can run it under plain Node.

export type ConnectOutcome =
  | "linked"
  | "already_linked"
  | "customer_linked_elsewhere"
  | "identity_linked_elsewhere"
  | "expired"
  | "signed_out"
  | "failed";

export interface ConnectResult {
  httpStatus: number;
  body: { status: ConnectOutcome; email?: string };
}

export interface ShopConnectConfig {
  /** e.g. https://api.dev.seemyhealth.ai (no trailing path). */
  backendApiBase: string | undefined;
  /** Shared bearer secret, the same value as the backend's SHOP_CONNECT_WEBHOOK_TOKEN. */
  webhookToken: string | undefined;
  /** Customer Account API host, e.g. account.seemyhealth.ai. */
  customerAccountDomain: string;
  /** Origin header the Customer Account API expects. */
  siteOrigin: string;
}

export interface SessionCustomer {
  id: string;
  email: string | null;
}

type Fetch = typeof fetch;

const CUSTOMER_GID = /^gid:\/\/shopify\/Customer\/\d+$/;
// The backend mints >= 32 random bytes, URL-safe. Anything else cannot be one of its tokens.
const CONNECT_TOKEN = /^[A-Za-z0-9_-]{32,512}$/;

export function isPlausibleConnectToken(t: unknown): t is string {
  return typeof t === "string" && CONNECT_TOKEN.test(t);
}

function result(httpStatus: number, status: ConnectOutcome, email?: string): ConnectResult {
  return { httpStatus, body: email ? { status, email } : { status } };
}

/**
 * The customer the session belongs to, from the Customer Account API.
 * null: no session, or the access token is no longer accepted (the page refreshes and retries).
 * Throws on anything else (the API unreachable or answering oddly).
 */
export async function getSessionCustomer(
  accessToken: string | null,
  config: Pick<ShopConnectConfig, "customerAccountDomain" | "siteOrigin">,
  fetchImpl: Fetch = fetch
): Promise<SessionCustomer | null> {
  if (!accessToken) return null;

  const res = await fetchImpl(
    `https://${config.customerAccountDomain}/customer/api/2026-04/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        Origin: config.siteOrigin,
        "User-Agent": "SeeMyHealth-BFF/1.0",
      },
      body: JSON.stringify({ query: `{ customer { id emailAddress { emailAddress } } }` }),
    }
  );

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Customer Account API answered ${res.status}`);

  const data = (await res.json()) as {
    data?: { customer?: { id?: unknown; emailAddress?: { emailAddress?: unknown } | null } | null };
  };
  const customer = data?.data?.customer;
  if (!customer) return null;
  if (typeof customer.id !== "string" || !CUSTOMER_GID.test(customer.id)) {
    throw new Error("Customer Account API returned an unexpected customer id");
  }
  const email = customer.emailAddress?.emailAddress;
  return { id: customer.id, email: typeof email === "string" && email.length > 0 ? email : null };
}

/** Maps the backend webhook's answer (section 1b of the contract) onto the page's outcomes. */
export function mapBackendAnswer(
  status: number,
  body: unknown,
  sessionEmail: string | null
): ConnectResult {
  const answer = (body && typeof body === "object" ? body : {}) as { status?: unknown; email?: unknown };

  if (status === 200 && answer.status === "linked") {
    const email = typeof answer.email === "string" && answer.email ? answer.email : sessionEmail ?? undefined;
    return result(200, "linked", email);
  }
  if (status === 200 && answer.status === "already_linked") {
    return result(200, "already_linked", sessionEmail ?? undefined);
  }
  if (status === 409 && answer.status === "customer_linked_elsewhere") {
    return result(409, "customer_linked_elsewhere");
  }
  if (status === 409 && answer.status === "identity_linked_elsewhere") {
    return result(409, "identity_linked_elsewhere");
  }
  if (status === 410) {
    return result(410, "expired");
  }

  // 401 (our webhook token is wrong), 503 (the backend has none configured), 5xx, or an answer
  // outside the contract. The status only: the body is not logged.
  console.error(`Shop connect webhook answered ${status}`);
  return result(502, "failed");
}

/** The whole POST /api/shop/connect, given the session's access token and the request body. */
export async function connectShopAccount(
  input: { accessToken: string | null; body: unknown },
  config: ShopConnectConfig,
  fetchImpl: Fetch = fetch
): Promise<ConnectResult> {
  if (!config.backendApiBase || !config.webhookToken) {
    console.error("Shop connect is not configured (BACKEND_API_BASE / SHOP_CONNECT_WEBHOOK_TOKEN)");
    return result(503, "failed");
  }

  const t = (input.body && typeof input.body === "object" ? (input.body as { t?: unknown }).t : undefined);
  if (!isPlausibleConnectToken(t)) {
    // A mangled or truncated link: nothing the backend could match, so it reads as an old link.
    return result(410, "expired");
  }

  let customer: SessionCustomer | null;
  try {
    customer = await getSessionCustomer(input.accessToken, config, fetchImpl);
  } catch (e) {
    console.error("Shop connect: could not read the session customer:", e instanceof Error ? e.message : "unknown");
    return result(502, "failed");
  }
  if (!customer) return result(401, "signed_out");
  if (!customer.email) {
    // Every store account here signs in by email; one without is outside the contract.
    console.error("Shop connect: the session customer has no email");
    return result(422, "failed");
  }

  let res: Response;
  try {
    res = await fetchImpl(`${config.backendApiBase.replace(/\/+$/, "")}/webhooks/shop/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.webhookToken}`,
        "User-Agent": "SeeMyHealth-BFF/1.0",
      },
      body: JSON.stringify({ token: t, customer_id: customer.id, email: customer.email }),
    });
  } catch (e) {
    console.error("Shop connect: backend unreachable:", e instanceof Error ? e.message : "unknown");
    return result(502, "failed");
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return mapBackendAnswer(res.status, body, customer.email);
}

/**
 * A return path for after sign-in: a same-origin PATH (with its query), never a URL. Anything that
 * could leave the site ("//evil", "/\\evil", "https://…", control characters) or lands on the BFF
 * itself (/api/…) answers null, and the caller falls back to /account.
 */
export function safeReturnPath(raw: string | null | undefined, siteOrigin: string): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw, siteOrigin);
  } catch {
    return null;
  }
  if (parsed.origin !== new URL(siteOrigin).origin) return null;
  if (parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")) return null;

  return `${parsed.pathname}${parsed.search}`;
}
