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

// Redirect to Shopify's hosted login/signup page
export function login() {
  window.location.href = `${BFF_BASE}/auth/login`;
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

// Check if user is logged in (lightweight — just checks cookie presence isn't reliable
// since cookies are httpOnly, so we do a quick /auth/me call)
export async function isLoggedIn(): Promise<boolean> {
  const customer = await getCustomer();
  return customer !== null;
}
