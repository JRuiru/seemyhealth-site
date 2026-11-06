// Frontend auth client — talks to the BFF auth routes
// Session state is managed via httpOnly cookies (set by the BFF)

const BFF_BASE = typeof window !== "undefined"
  ? ((import.meta as any).env?.PUBLIC_BFF_URL || "/api")
  : "/api";

export interface CustomerAddress {
  address1: string;
  city: string;
  country: string;
  province: string;
  zip: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  image: { url: string; altText: string | null } | null;
  price: { amount: string; currencyCode: string };
  variantTitle: string | null;
}

export interface TrackingInfo {
  number: string;
  url: string | null;
}

export interface CustomerOrder {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { edges: { node: OrderLineItem }[] };
  fulfillments: { edges: { node: { status: string; trackingInformation: TrackingInfo[] } }[] };
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: { emailAddress: string };
  defaultAddress: CustomerAddress | null;
  orders: {
    edges: { node: CustomerOrder }[];
  };
}

// Redirect to Shopify's hosted login/signup page (back to /account afterwards).
// Takes no arguments on purpose: it is used directly as an onClick handler.
export function login() {
  window.location.href = `${BFF_BASE}/auth/login`;
}

// The same sign-in, coming back to `returnTo` (a same-origin path with its query) afterwards.
// The BFF keeps it only if it is one, else lands on /account.
export function loginReturningTo(returnTo: string) {
  window.location.href = `${BFF_BASE}/auth/login?${new URLSearchParams({ return_to: returnTo })}`;
}

// Log out — clears cookies and redirects to Shopify logout
export function logout() {
  window.location.href = `${BFF_BASE}/auth/logout`;
}

// Fetch current customer (returns null if not logged in)
export async function getCustomer(): Promise<Customer | null> {
  try {
    const res = await fetch(`${BFF_BASE}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = await res.json();

    // Token expired — try refresh
    if (data.expired) {
      const refreshed = await refreshToken();
      if (!refreshed) return null;
      // Retry after refresh
      const retry = await fetch(`${BFF_BASE}/auth/me`, {
        credentials: "include",
      });
      if (!retry.ok) return null;
      const retryData = await retry.json();
      return retryData?.data?.customer || retryData?.customer || null;
    }

    return data?.data?.customer || data?.customer || null;
  } catch {
    return null;
  }
}

// Refresh access token
async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BFF_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Shop account connect (POST /api/shop/connect) ---

// What the BFF answers. The BFF reads who is signed in from the session; the page sends only the
// connect token from its link.
export type ShopConnectStatus =
  | "linked"
  | "already_linked"
  | "customer_linked_elsewhere"
  | "identity_linked_elsewhere"
  | "expired"
  | "signed_out"
  | "failed";

export interface ShopConnectResult {
  status: ShopConnectStatus;
  email?: string;
}

const SHOP_CONNECT_STATUSES: ShopConnectStatus[] = [
  "linked", "already_linked", "customer_linked_elsewhere", "identity_linked_elsewhere", "expired", "signed_out", "failed",
];

async function postShopConnect(token: string): Promise<ShopConnectResult> {
  const res = await fetch(`${BFF_BASE}/shop/connect`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ t: token }),
  });
  const data = (await res.json().catch(() => null)) as { status?: unknown; email?: unknown } | null;
  const status = SHOP_CONNECT_STATUSES.find((s) => s === data?.status) ?? "failed";
  return typeof data?.email === "string" ? { status, email: data.email } : { status };
}

// Connects the signed-in store account to the app account that minted `token`. A short-lived access
// token is refreshed once before the answer counts as signed out.
export async function connectShopAccount(token: string): Promise<ShopConnectResult> {
  try {
    const first = await postShopConnect(token);
    if (first.status !== "signed_out") return first;
    if (!(await refreshToken())) return first;
    return await postShopConnect(token);
  } catch {
    return { status: "failed" };
  }
}

// Check if user is logged in (lightweight — just checks cookie presence isn't reliable
// since cookies are httpOnly, so we do a quick /auth/me call)
export async function isLoggedIn(): Promise<boolean> {
  const customer = await getCustomer();
  return customer !== null;
}
