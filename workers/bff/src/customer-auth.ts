// Shopify Customer Account API — OAuth 2.0 PKCE flow
// https://shopify.dev/docs/api/customer

export interface CustomerAuthConfig {
  clientId: string;
  shopId: string;
  redirectUri: string; // https://www.seemyhealth.ai/api/auth/callback
}

const AUTH_BASE = (shopId: string) =>
  `https://shopify.com/authentication/${shopId}`;

// --- PKCE helpers ---

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateNonce(length = 32): string {
  return generateRandomString(length);
}

// --- OAuth endpoints ---

export async function buildAuthorizationUrl(
  config: CustomerAuthConfig,
  state: string
): Promise<{ url: string; codeVerifier: string; nonce: string }> {
  const codeVerifier = generateRandomString(96);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const nonce = generateNonce();

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: "openid email customer-account-api:full",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const url = `${AUTH_BASE(config.shopId)}/oauth/authorize?${params}`;
  return { url, codeVerifier, nonce };
}

export async function exchangeCodeForTokens(
  config: CustomerAuthConfig,
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}> {
  const tokenUrl = `${AUTH_BASE(config.shopId)}/oauth/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(
  config: CustomerAuthConfig,
  refreshToken: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const tokenUrl = `${AUTH_BASE(config.shopId)}/oauth/token`;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export function buildLogoutUrl(config: CustomerAuthConfig, idToken: string): string {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: "https://www.seemyhealth.ai",
  });

  return `${AUTH_BASE(config.shopId)}/logout?${params}`;
}
