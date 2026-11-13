// Reads a shared recipe's restricted preview from the backend, for the /r/{code} page and nothing
// else: GET {API_BASE}/api/v2/links/recipes/{code} with the Worker's shared secret in
// X-Links-Preview-Secret (cmh-golang internal/nutrition/transport/http, LinksRoutes). The same
// secret, header and outcomes as an invitation's preview (invite.ts); it reads and never writes.
//
// The code is never logged and never put in a card URL. Nothing here writes to the console.

import { PARAM_TYPES } from './generated/link-paths.ts';

export interface RecipePreview {
  name: string;
  coverPhotoUrl: string | null;
  kcalPerServing: number;
  totalMinutes: number | null;
  creatorName: string;   // "SeeMyHealth" for a catalogue recipe
  sharedByName: string;  // empty when the sharer's name could not be read
}

export type RecipePreviewOutcome =
  | { outcome: 'found'; recipe: RecipePreview }
  | { outcome: 'not_found' }
  | { outcome: 'unavailable' };

const CODE = new RegExp(PARAM_TYPES.recipeLinkCode);

const isRecipeLinkCode = (s: string) => CODE.test(s);

export async function readRecipePreview(code: string, apiBase: string, secret: string | undefined, fetcher: typeof fetch = fetch): Promise<RecipePreviewOutcome> {
  if (!isRecipeLinkCode(code)) return { outcome: 'not_found' };
  // No secret, no call: the backend would answer 401 to every one of them.
  if (!secret) return { outcome: 'unavailable' };

  let res: Response;
  try {
    res = await fetcher(`${apiBase.replace(/\/+$/, '')}/api/v2/links/recipes/${code}`, {
      method: 'GET',
      headers: { 'X-Links-Preview-Secret': secret, Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { outcome: 'unavailable' };
  }
  // RECIPE_LINK_NOT_FOUND: an unknown code, a deleted recipe, or one blocked between sharer and creator.
  if (res.status === 404) return { outcome: 'not_found' };
  if (res.status !== 200) return { outcome: 'unavailable' };

  try {
    return parseRecipePreview(await res.json());
  } catch {
    return { outcome: 'unavailable' };
  }
}

const KEYS = ['name', 'coverPhotoUrl', 'kcalPerServing', 'totalMinutes', 'creatorName', 'sharedByName'];

// Strict: exactly the contract's keys and types, or the page treats the read as failed.
export function parseRecipePreview(body: unknown): RecipePreviewOutcome {
  const unavailable = { outcome: 'unavailable' } as const;
  if (!isRecord(body) || !sameKeys(body, KEYS)) return unavailable;
  const { name, coverPhotoUrl, kcalPerServing, totalMinutes, creatorName, sharedByName } = body;
  if (typeof name !== 'string' || name.trim() === '') return unavailable;
  if (coverPhotoUrl !== null && typeof coverPhotoUrl !== 'string') return unavailable;
  if (typeof kcalPerServing !== 'number' || !Number.isFinite(kcalPerServing) || kcalPerServing < 0) return unavailable;
  if (totalMinutes !== null && (typeof totalMinutes !== 'number' || !Number.isInteger(totalMinutes) || totalMinutes < 0)) return unavailable;
  if (typeof creatorName !== 'string' || typeof sharedByName !== 'string') return unavailable;
  return {
    outcome: 'found',
    recipe: {
      name: name.trim(),
      coverPhotoUrl: coverPhotoUrl as string | null,
      kcalPerServing,
      totalMinutes: totalMinutes as number | null,
      creatorName: creatorName.trim(),
      sharedByName: sharedByName.trim(),
    },
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const sameKeys = (o: Record<string, unknown>, keys: string[]) => {
  const have = Object.keys(o).sort();
  return have.length === keys.length && [...keys].sort().every((k, i) => have[i] === k);
};
