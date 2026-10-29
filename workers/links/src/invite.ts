// Reads an invitation's restricted preview from the backend, for the /i/{token} page and nothing
// else: GET {API_BASE}/api/v2/links/invites/{token} with the Worker's shared secret in
// X-Links-Preview-Secret (cmh-golang internal/invitations/transport/http, LinksRoutes). It reads and
// never writes; opening the page consumes nothing.
//
// The token is never logged, never echoed into the page, and never put in a card URL. Nothing here
// writes to the console at all: every outcome is a value.

import { PARAM_TYPES } from './generated/link-paths.ts';

export type InviteKind = 'group' | 'challenge' | 'friend' | 'family';
export type InviteStatus = 'active' | 'expired' | 'revoked' | 'used_up';

export interface PublicTarget {
  name: string;
  imageUrl: string | null;
  memberCount: number | null;
}

export type PreviewOutcome =
  | { outcome: 'found'; kind: InviteKind; status: InviteStatus; target: PublicTarget | null }
  | { outcome: 'not_found' }
  | { outcome: 'unavailable' };

const TOKEN = new RegExp(PARAM_TYPES.inviteToken);
const KINDS: readonly string[] = ['group', 'challenge', 'friend', 'family'];
const STATUSES: readonly string[] = ['active', 'expired', 'revoked', 'used_up'];

export const isInviteToken = (s: string) => TOKEN.test(s);

export async function readPreview(token: string, apiBase: string, secret: string | undefined, fetcher: typeof fetch = fetch): Promise<PreviewOutcome> {
  if (!isInviteToken(token)) return { outcome: 'not_found' };
  // No secret, no call: the backend would answer 401 to every one of them.
  if (!secret) return { outcome: 'unavailable' };

  let res: Response;
  try {
    res = await fetcher(`${apiBase.replace(/\/+$/, '')}/api/v2/links/invites/${token}`, {
      method: 'GET',
      headers: { 'X-Links-Preview-Secret': secret, Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { outcome: 'unavailable' };
  }
  if (res.status === 404) return { outcome: 'not_found' };
  if (res.status !== 200) return { outcome: 'unavailable' };

  try {
    return parsePreview(await res.json());
  } catch {
    return { outcome: 'unavailable' };
  }
}

// Strict: exactly the contract's keys and types, or the page treats the read as failed.
export function parsePreview(body: unknown): PreviewOutcome {
  const unavailable = { outcome: 'unavailable' } as const;
  if (!isRecord(body) || !sameKeys(body, ['kind', 'status', 'target'])) return unavailable;
  const { kind, status, target } = body;
  if (typeof kind !== 'string' || !KINDS.includes(kind)) return unavailable;
  if (typeof status !== 'string' || !STATUSES.includes(status)) return unavailable;
  if (target === null) return { outcome: 'found', kind: kind as InviteKind, status: status as InviteStatus, target: null };
  if (!isRecord(target) || !sameKeys(target, ['name', 'imageUrl', 'memberCount'])) return unavailable;
  if (typeof target.name !== 'string' || target.name.trim() === '') return unavailable;
  if (target.imageUrl !== null && typeof target.imageUrl !== 'string') return unavailable;
  if (target.memberCount !== null && (typeof target.memberCount !== 'number' || !Number.isInteger(target.memberCount) || target.memberCount < 0)) return unavailable;
  return {
    outcome: 'found',
    kind: kind as InviteKind,
    status: status as InviteStatus,
    target: { name: target.name.trim(), imageUrl: target.imageUrl as string | null, memberCount: target.memberCount as number | null },
  };
}

// What the page may show of a target. Only an active invite to a group or a challenge ever shows
// one: the backend already sends null for everything else, and this holds even if it did not.
export function shownTarget(p: Extract<PreviewOutcome, { outcome: 'found' }>): PublicTarget | null {
  if (p.status !== 'active' || (p.kind !== 'group' && p.kind !== 'challenge')) return null;
  return p.target;
}

// An image the page may load: https only.
export function safeImageUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function countLine(kind: 'group' | 'challenge', n: number | null): string | null {
  if (n === null) return null;
  const formatted = n.toLocaleString('en-GB');
  if (kind === 'group') return n === 1 ? '1 member' : `${formatted} members`;
  return `${formatted} taking part`;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const sameKeys = (o: Record<string, unknown>, keys: string[]) => {
  const have = Object.keys(o).sort();
  return have.length === keys.length && [...keys].sort().every((k, i) => have[i] === k);
};
