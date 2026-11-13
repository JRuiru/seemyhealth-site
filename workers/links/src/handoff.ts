// Deferred-link handoff codes (cmh-golang Docs/deferred-links-plan.md): an /i/ link carries an
// invitation's token, so the Play button never puts it in the install referrer, which Google reads.
// The Worker swaps it for a short single-use code first: POST {API_BASE}/api/v2/links/handoffs with
// the shared secret in X-Links-Preview-Secret (cmh-golang internal/invitations/transport/http,
// HandoffRoutes). The referrer then carries handoff=<code>, and the app redeems the code once, on
// first launch, for the link.
//
// If the code cannot be made, the page gets none and the Play button carries no referrer at all:
// never the token. Nothing here logs; every outcome is a value.

const CODE = /^[A-Za-z0-9_-]{24}$/;

export const isHandoffCode = (s: string) => CODE.test(s);

export async function createHandoff(link: string, apiBase: string, secret: string | undefined, fetcher: typeof fetch = fetch): Promise<string | null> {
  if (!secret) return null;
  let res: Response;
  try {
    res = await fetcher(`${apiBase.replace(/\/+$/, '')}/api/v2/links/handoffs`, {
      method: 'POST',
      headers: { 'X-Links-Preview-Secret': secret, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ link }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    return null;
  }
  if (res.status !== 201) return null;
  try {
    return parseHandoff(await res.json());
  } catch {
    return null;
  }
}

// Strict: the code in its shape, or none.
export function parseHandoff(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const code = (body as Record<string, unknown>).code;
  return typeof code === 'string' && isHandoffCode(code) ? code : null;
}
