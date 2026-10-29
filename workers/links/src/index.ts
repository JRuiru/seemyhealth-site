// links.seemyhealth.ai: the website half of the app link system.
//
//   /.well-known/apple-app-site-association   the 36 link templates, for both iOS app ids
//   /.well-known/assetlinks.json              Android App Links
//   /i/{token}                                an invitation's safe preview (restricted backend read)
//   /payments/return                          back from the hosted checkout
//   every other path in link-paths.json       its page kind's fallback page
//   /get-the-app                              the store buttons
//   /og/...                                   Open Graph cards
//   anything else                             404
//
// The pages are prerendered by astro.links.config.mjs into ./dist (the ASSETS binding); this Worker
// picks one per request and fills in what only the request knows: the visitor's platform (which store
// goes first), the page's own URL for og:url, and for an invite, what the restricted preview allows.
//
// Nothing here logs: an /i/ address carries a bearer token. Observability is off in wrangler.jsonc.

import { LINK_PATHS, PARAM_TYPES, type LinkPathSpec } from './generated/link-paths.ts';
import { PAGE_KIND_BY_PATH } from './page-kinds.ts';
import { APPLE_APP_SITE_ASSOCIATION, ASSET_LINKS } from './well-known.ts';
import { countLine, readPreview, safeImageUrl, shownTarget } from './invite.ts';
import { mintCardKey, openCardKey } from './og/card-key.ts';
import { INVITE_COPY } from './catalogue.ts';

export interface Env {
  ASSETS: Fetcher;
  API_BASE: string;
  LINKS_PREVIEW_SECRET?: string;
  // "on" draws a public group's or challenge's own card (about a second of CPU per new card, so
  // Workers Paid); anything else uses the invite kind's static card.
  OG_DYNAMIC?: string;
}

const CSP = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' https: data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS: Record<string, string> = {
  'X-Robots-Tag': 'noindex',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CSP,
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/.well-known/apple-app-site-association') return json(APPLE_APP_SITE_ASSOCIATION);
    if (path === '/.well-known/assetlinks.json') return json(ASSET_LINKS);

    // The build's own files: hashed bundles, fonts, icons, Rive files and the static cards.
    if (/^\/(_astro|images|media|fonts)\//.test(path) || /^\/og\/[a-zA-Z-]+\.jpg$/.test(path)) {
      return env.ASSETS.fetch(request);
    }
    if (path.startsWith('/og/invite/')) return dynamicCard(request, env, ctx);

    if (path === '/get-the-app') return page(request, env, '/t/get-the-app/', 200, 'public');

    const match = matchLinkPath(path);
    if (!match) return page(request, env, '/t/not-found/', 404, 'public');

    if (match.spec.name === 'invite') return invitePage(request, env, match.params.inviteToken);
    if (match.spec.name === 'paymentsReturn') return page(request, env, `/t/payment/${paymentState(url.searchParams.get('status'))}/`, 200, 'private');

    return page(request, env, `/t/kind/${PAGE_KIND_BY_PATH[match.spec.name]}/`, 200, 'public');
  },
} satisfies ExportedHandler<Env>;

// ---- Paths ---------------------------------------------------------------------------------------

const COMPILED = LINK_PATHS.map((spec) => {
  const names: string[] = [];
  const source = spec.template.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{([^}]+)\\?\}/g, (_m, name: string) => {
    names.push(name);
    return '([^/]+)';
  });
  return { spec: spec as LinkPathSpec, pattern: new RegExp(`^${source}$`), names };
});

// A path matches a template only when each id is the shape the backend makes: a misspelt id is a
// 404, not somebody else's page.
export function matchLinkPath(path: string): { spec: LinkPathSpec; params: Record<string, string> } | null {
  for (const { spec, pattern, names } of COMPILED) {
    const m = pattern.exec(path);
    if (!m) continue;
    const params: Record<string, string> = {};
    const ok = names.every((name, i) => {
      const type = spec.params.find((p) => p.name === name)?.type;
      const value = decodeSafe(m[i + 1]);
      if (value === null) return false;
      params[name] = value;
      return type !== undefined && new RegExp(PARAM_TYPES[type]).test(value);
    });
    if (ok) return { spec, params };
  }
  return null;
}

const decodeSafe = (s: string | undefined) => {
  try { return s === undefined ? null : decodeURIComponent(s); } catch { return null; }
};

// Flutterwave appends ?status=successful|completed|cancelled|failed. A hint, never the truth.
export function paymentState(status: string | null): 'pending' | 'successful' | 'notCompleted' {
  if (status === 'successful' || status === 'completed') return 'successful';
  return status ? 'notCompleted' : 'pending';
}

// ---- Pages ---------------------------------------------------------------------------------------

type Caching = 'public' | 'private';

interface Fill {
  slots?: Record<string, string | null>; // data-slot → text; null removes the element
  cover?: string | null;                // img[data-slot=cover] src
  title?: string;
  description?: string;
  ogImage?: string;                     // a path or an absolute URL
  imageAlt?: string;
}

async function page(request: Request, env: Env, template: string, status: number, caching: Caching, fill: Fill = {}): Promise<Response> {
  const asset = await env.ASSETS.fetch(new Request(new URL(template, request.url)));
  if (!asset.ok) return new Response('Not Found', { status: 404, headers: SECURITY_HEADERS });

  const url = new URL(request.url);
  const origin = url.origin;
  const platform = detectPlatform(request.headers.get('User-Agent') ?? '');

  let rewriter = new HTMLRewriter()
    .on('html', { element: (el) => { if (platform) el.setAttribute('data-platform', platform); } })
    .on('meta[data-og-url]', { element: (el) => { el.setAttribute('content', `${origin}${url.pathname}`); el.removeAttribute('data-og-url'); } })
    .on('meta[data-og-image]', {
      element: (el) => {
        const src = fill.ogImage ?? el.getAttribute('content') ?? '/og/default.jpg';
        el.setAttribute('content', src.startsWith('https://') || src.startsWith('http://') ? src : `${origin}${src}`);
        el.removeAttribute('data-og-image');
      },
    })
    .on('[data-og-text]', {
      element: (el) => {
        const which = el.getAttribute('data-og-text');
        const text = which === 'title' ? fill.title : which === 'description' ? fill.description : which === 'imageAlt' ? fill.imageAlt : undefined;
        if (text !== undefined) {
          if (el.tagName === 'title') el.setInnerContent(text);
          else el.setAttribute('content', text);
        }
        el.removeAttribute('data-og-text');
      },
    });

  if (fill.slots) {
    rewriter = rewriter.on('[data-slot]', {
      element: (el) => {
        const name = el.getAttribute('data-slot') ?? '';
        if (name === 'cover' || !(name in (fill.slots ?? {}))) return;
        const text = fill.slots?.[name];
        if (text === null) el.remove();
        else if (text !== undefined) el.setInnerContent(text); // escaped: setInnerContent is text by default
      },
    });
  }
  if (fill.cover) {
    const cover = fill.cover;
    rewriter = rewriter.on('img[data-slot="cover"]', { element: (el) => { el.setAttribute('src', cover); el.setAttribute('alt', ''); } });
  }

  const headers = new Headers(SECURITY_HEADERS);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', caching === 'public' ? 'public, max-age=300' : 'no-store');
  headers.set('Vary', 'User-Agent');
  const body = request.method === 'HEAD' ? null : rewriter.transform(asset).body;
  return new Response(body, { status, headers });
}

// iOS or Android, from the user agent; nothing else is read from the request.
export function detectPlatform(ua: string): 'ios' | 'android' | null {
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return null;
}

// ---- /i/{token} ----------------------------------------------------------------------------------

async function invitePage(request: Request, env: Env, token: string): Promise<Response> {
  const preview = await readPreview(token, env.API_BASE, env.LINKS_PREVIEW_SECRET);

  if (preview.outcome === 'not_found') return page(request, env, '/t/invite/not-found/', 404, 'private');
  if (preview.outcome === 'unavailable') return page(request, env, '/t/invite/unavailable/', 503, 'private');

  const { kind, status } = preview;
  if (status !== 'active') return page(request, env, `/t/invite/${kind}/${status}/`, 410, 'private');

  const target = shownTarget(preview);
  if (!target || (kind !== 'group' && kind !== 'challenge')) return page(request, env, `/t/invite/${kind}/generic/`, 200, 'private');

  const cover = safeImageUrl(target.imageUrl);
  const count = countLine(kind, target.memberCount);
  const ogImage = env.LINKS_PREVIEW_SECRET && env.OG_DYNAMIC === 'on'
    ? `/og/invite/${kind}.jpg?key=${await mintCardKey({ k: kind, n: target.name, c: target.memberCount, i: cover }, env.LINKS_PREVIEW_SECRET)}`
    : `/og/invite-${kind}.jpg`;
  const title = kind === 'group' ? `Join ${target.name} on SeeMyHealth` : `Join the ${target.name} challenge on SeeMyHealth`;

  return page(request, env, `/t/invite/${kind}/public/`, 200, 'private', {
    slots: { name: target.name, count },
    cover,
    title,
    description: [count, INVITE_COPY[kind].sentence].filter(Boolean).join('. '),
    ogImage,
    imageAlt: target.name,
  });
}

// ---- Dynamic cards -------------------------------------------------------------------------------

// /og/invite/{group|challenge}.jpg?key=...: a public group's or challenge's card. Rendered at most
// once per key per edge location for five minutes; an expired, altered or missing key, or a render
// that fails, is the kind's static card. Never a call to the backend.
async function dynamicCard(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const kind = /^\/og\/invite\/(group|challenge)\.jpg$/.exec(url.pathname)?.[1] as 'group' | 'challenge' | undefined;
  if (!kind) return new Response('Not Found', { status: 404 });
  const fallback = (why = 'key') => cardResponse(env.ASSETS.fetch(new Request(new URL(`/og/invite-${kind}.jpg`, url))), 300, why);

  const key = url.searchParams.get('key');
  const payload = key && env.LINKS_PREVIEW_SECRET ? await openCardKey(key, env.LINKS_PREVIEW_SECRET) : null;
  if (!payload || payload.k !== kind) return fallback();

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const { renderInviteCard } = await import('./og/dynamic.ts');
    const bytes = await renderInviteCard(payload, env.ASSETS, url.origin);
    const res = new Response(bytes, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff', 'X-Card': 'dynamic' } });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  } catch {
    return fallback('render');
  }
}

// X-Card says which card was drawn (dynamic, or the static fallback and why), never what is on it.
async function cardResponse(asset: Promise<Response>, maxAge: number, why: string): Promise<Response> {
  const res = await asset;
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', `public, max-age=${maxAge}`);
  headers.set('X-Card', `fallback; ${why}`);
  return new Response(res.body, { status: res.status, headers });
}

// ---- JSON ----------------------------------------------------------------------------------------

function json(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
  });
}
