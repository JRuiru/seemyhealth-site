// The key in a dynamic card's URL. A crawler fetches og:image on its own, later and from elsewhere,
// so the image URL must name what to draw without naming the invite: the token never appears in it.
//
// The key carries the card itself: the kind, and only what the restricted preview already made
// public (a public group's or challenge's name, member count and image URL), plus an expiry. It is
// signed with HMAC-SHA256 under a key derived from LINKS_PREVIEW_SECRET, so nobody can mint a card
// with words of their own under our domain, and it lapses after CARD_KEY_TTL_SECONDS, after which the
// image route draws the kind's default card (between one and two TTLs, see mintCardKey). So the image route never calls the backend, never
// writes, holds nothing to log, and a revoked or reset link's page stops minting the group's card at
// once (the page re-reads the preview on every load), with an old card URL going generic within the
// TTL. Why not a hash of the token: a hash would still be a stable handle on one invitation, and the
// image route would have to call the backend with something.

export const CARD_KEY_TTL_SECONDS = 15 * 60;

export interface CardPayload {
  k: 'group' | 'challenge';
  n: string;          // name
  c: number | null;   // member or participant count
  i: string | null;   // https image URL
  e: number;          // expiry, unix seconds
}

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) => {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
};

async function signingKey(secret: string): Promise<CryptoKey> {
  // Derive a key for this one purpose, so the card signature never doubles as the backend secret.
  const base = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const derived = new Uint8Array(await crypto.subtle.sign('HMAC', base, enc.encode('links-og-card-key-v1')));
  return crypto.subtle.importKey('raw', derived, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function mintCardKey(payload: Omit<CardPayload, 'e'>, secret: string, now = Date.now()): Promise<string> {
  // The expiry is the end of the next whole window, so every view of one group's invite inside a
  // window mints the same key, and the image route's edge cache answers all but the first. A key
  // lives between one and two windows.
  const windowEnd = (Math.floor(now / 1000 / CARD_KEY_TTL_SECONDS) + 2) * CARD_KEY_TTL_SECONDS;
  const body = b64url(enc.encode(JSON.stringify({ ...payload, e: windowEnd })));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await signingKey(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function openCardKey(key: string, secret: string, now = Date.now()): Promise<CardPayload | null> {
  const [body, sig, extra] = key.split('.');
  if (!body || !sig || extra !== undefined || key.length > 2048) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await signingKey(secret), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as CardPayload;
    if ((p.k !== 'group' && p.k !== 'challenge') || typeof p.n !== 'string' || typeof p.e !== 'number') return null;
    if (p.e < Math.floor(now / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}
