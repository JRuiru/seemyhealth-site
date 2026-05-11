// Shopify Admin API token exchange via client credentials grant
// Tokens expire every 24 hours — this caches and auto-refreshes

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAdminToken(
  myshopifyDomain: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(
    `https://${myshopifyDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    }
  );

  if (!res.ok) {
    throw new Error(`Admin token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = data.access_token;
  // Refresh 5 minutes before expiry
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return cachedToken;
}
