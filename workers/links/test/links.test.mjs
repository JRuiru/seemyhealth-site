// The links Worker, end to end, locally: the real Worker in workerd (wrangler's unstable_dev) with
// the built pages, against a stub of the backend's restricted preview. Run with `npm run links:test`
// (it builds first). No network beyond 127.0.0.1, except the dynamic card fetching its photo from
// the site's Cloudflare Images.

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unstable_dev } from 'wrangler';

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKER = join(HERE, '..');
const LINK_PATHS = JSON.parse(readFileSync(join(WORKER, 'link-paths.json'), 'utf8'));
const { PAGE_KIND_BY_PATH } = await import(join(WORKER, 'src', 'page-kinds.ts'));
const { matchLinkPath, paymentState, detectPlatform } = await import(join(WORKER, 'src', 'index.ts'));
const { parsePreview } = await import(join(WORKER, 'src', 'invite.ts'));
const { parseRecipePreview } = await import(join(WORKER, 'src', 'recipe-share.ts'));
const { mintCardKey, openCardKey } = await import(join(WORKER, 'src', 'og', 'card-key.ts'));

const SECRET = 'test-preview-secret-not-a-real-one';
const token = (c) => c.repeat(43);
const TOKENS = {
  publicGroup: token('a'), privateGroup: token('b'), publicChallenge: token('c'), friend: token('d'), family: token('e'),
  expired: token('f'), revoked: token('g'), usedUp: token('h'), unknown: token('i'), broken: token('j'),
};
const PREVIEWS = {
  [TOKENS.publicGroup]: { kind: 'group', status: 'active', target: { name: 'Morning Runners', imageUrl: 'https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg/lifestyle-friends-bar/public', memberCount: 128 } },
  [TOKENS.privateGroup]: { kind: 'group', status: 'active', target: null },
  [TOKENS.publicChallenge]: { kind: 'challenge', status: 'active', target: { name: 'October Steps', imageUrl: null, memberCount: 42 } },
  [TOKENS.friend]: { kind: 'friend', status: 'active', target: null },
  [TOKENS.family]: { kind: 'family', status: 'active', target: null },
  [TOKENS.expired]: { kind: 'challenge', status: 'expired', target: null },
  [TOKENS.revoked]: { kind: 'group', status: 'revoked', target: null },
  [TOKENS.usedUp]: { kind: 'friend', status: 'used_up', target: null },
};

// Shared recipe codes and what the stub's recipe preview answers for each.
const CODES = { machboos: 'aB3dE5fG7h', noPhoto: 'Zz9Yy8Xx7W', unknown: 'NOPEnope00', broken: 'BRKbrk0000' };
const RECIPES = {
  [CODES.machboos]: { name: "Mum's chicken machboos", coverPhotoUrl: 'https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg/logging-food/public', kcalPerServing: 640.4, totalMinutes: 50, creatorName: 'John Kenyatta', sharedByName: 'John Kenyatta' },
  [CODES.noPhoto]: { name: 'High-protein oats', coverPhotoUrl: null, kcalPerServing: 410, totalMinutes: null, creatorName: 'SeeMyHealth', sharedByName: '' },
};

// Example values for each parameter type, as the backend makes them.
const EXAMPLE = {
  uuid: '3f1c2a4e-8b7d-4c1e-9a2b-1c2d3e4f5a6b',
  identityId: `usr_${'0123456789abcdef'.repeat(2)}`,
  documentId: 'usr_x_2026-10-29_steps',
  practiceCode: 'green-valley-clinic',
  inviteToken: TOKENS.privateGroup,
  handle: 'sam.runs_42',
  recipeLinkCode: CODES.machboos,
};
const examplePath = (p) => p.template.replace(/\{([^}]+)\}/g, (_m, name) => EXAMPLE[p.params.find((x) => x.name === name).type]);

let stub, stubCalls = [], worker;

before(async () => {
  stub = createServer((req, res) => {
    stubCalls.push({ method: req.method, url: req.url, secret: req.headers['x-links-preview-secret'] });
    const m = /^\/api\/v2\/links\/invites\/([A-Za-z0-9_-]+)$/.exec(req.url ?? '');
    if (req.headers['x-links-preview-secret'] !== SECRET) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end('{"code":"UNAUTHORIZED"}'); }
    const r = /^\/api\/v2\/links\/recipes\/([A-Za-z0-9]+)$/.exec(req.url ?? '');
    if (r) {
      if (r[1] === CODES.broken) { res.writeHead(500); return res.end('{}'); }
      if (!RECIPES[r[1]]) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"code":"RECIPE_LINK_NOT_FOUND","category":"not_found"}'); }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(RECIPES[r[1]]));
    }
    if (!m || m[1] === TOKENS.unknown) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"code":"INVITE_NOT_FOUND","category":"not_found"}'); }
    if (m[1] === TOKENS.broken) { res.writeHead(500); return res.end('{}'); }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(PREVIEWS[m[1]]));
  });
  await new Promise((r) => stub.listen(0, '127.0.0.1', r));
  worker = await unstable_dev(join(WORKER, 'src', 'index.ts'), {
    config: join(WORKER, 'wrangler.jsonc'),
    env: '',
    // OG_DYNAMIC on: production keeps it off on the Workers Free plan, but the drawn card is still the
    // path these tests hold to, and the static fallback is covered by the tampered-key test.
    vars: { API_BASE: `http://127.0.0.1:${stub.address().port}`, LINKS_PREVIEW_SECRET: SECRET, OG_DYNAMIC: 'on' },
    local: true,
    logLevel: 'error',
    experimental: { disableExperimentalWarning: true },
  });
});

after(async () => {
  await worker?.stop();
  stub?.close();
});

const get = (path, init = {}) => worker.fetch(path, { redirect: 'manual', ...init });
const meta = (html, prop) => new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`).exec(html)?.[1];

describe('association files', () => {
  test(`the Apple file claims exactly the ${LINK_PATHS.paths.length} templates, for both app ids, as JSON with no redirect`, async () => {
    const res = await get('/.well-known/apple-app-site-association');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    const [detail, ...rest] = body.applinks.details;
    assert.equal(rest.length, 0);
    assert.deepEqual(detail.appIDs, ['2QSN6768PN.ai.seemyhealth.app', '2QSN6768PN.ai.seemyhealth.app.dev']);
    const claimed = new Set(detail.components.map((c) => c['/']));
    const expected = new Set(LINK_PATHS.paths.map((p) => p.template.replace(/\{[^}]+\}/g, '*')));
    assert.deepEqual(claimed, expected);
    assert.equal(detail.components.length, LINK_PATHS.paths.length + 1); // + ?sent
    assert.ok(detail.components.some((c) => c['/'] === '/family-invitations' && c['?']?.sent === ''), '?sent has its own component');
    assert.ok(detail.components.some((c) => c['/'] === '/family-invitations' && !c['?']), 'and so does the bare list');
  });

  test('the Android file lists each app with the key that signs what Play installs, in full', async () => {
    const res = await get('/.well-known/assetlinks.json');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    const byPackage = Object.fromEntries(body.map((s) => [s.target.package_name, s.target.sha256_cert_fingerprints]));
    assert.deepEqual(byPackage, {
      'ai.seemyhealth.app': ['5B:37:4A:19:1D:C0:63:E9:04:59:83:0F:D2:BB:39:09:17:1B:E3:4D:98:D6:61:64:AE:55:A8:09:A7:66:E0:06'],
      'ai.seemyhealth.app.dev': [
        '30:5B:BB:15:76:E8:F1:69:7D:E4:82:C8:B5:02:67:32:86:83:CF:95:A7:CF:4C:A9:B0:B7:1E:4C:B1:58:B2:8D',
        '96:F2:9A:52:78:30:39:B9:64:9B:D3:13:1B:BD:3C:29:E0:F5:09:64:A5:EA:74:9F:82:27:CA:61:C0:A7:46:78',
      ],
    });
    // A fingerprint Android cannot match is a refusal of every link: whole, upper case, 32 bytes.
    for (const f of Object.values(byPackage).flat()) assert.match(f, /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
    // The upload key signs nothing a phone installs, so listing it would claim nothing.
    assert.ok(!Object.values(byPackage).flat().includes('9D:6D:83:45:5E:E7:F1:8F:59:FD:11:CE:2C:CB:F7:FB:FE:DF:ED:0C:1E:68:98:A5:2F:4D:46:9A:A8:2F:55:BC'));
  });
});

describe('every link path', () => {
  test('has a page kind', () => {
    for (const p of LINK_PATHS.paths) assert.ok(PAGE_KIND_BY_PATH[p.name], `${p.name} has no page kind`);
  });

  for (const p of LINK_PATHS.paths) {
    if (p.name === 'invite' || p.name === 'recipeShare') continue; // their own pages, below
    test(`${p.template} draws its ${PAGE_KIND_BY_PATH[p.name]} page with its Open Graph card`, async () => {
      const path = examplePath(p);
      const res = await get(path);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex');
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
      const html = await res.text();
      const kind = PAGE_KIND_BY_PATH[p.name];
      const card = kind === 'payment' ? '/og/payment-pending.jpg' : kind === 'connection' ? '/og/connection-invite.jpg' : `/og/kind-${kind}.jpg`;
      assert.match(meta(html, 'og:image'), new RegExp(`^http://[^/]+${card.replace(/\./g, '\\.')}$`));
      assert.equal(new URL(meta(html, 'og:url')).pathname, path);
      for (const tag of ['og:title', 'og:description', 'og:type', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        assert.ok(meta(html, tag), `${tag} present`);
      }
      assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
      assert.match(html, /Open in the App/);
      assert.match(html, /data-store="ios"/);
      assert.match(html, /data-store="android"/);
    });
  }

  test('an id of the wrong shape, a trailing slash, an unknown path and a template address are 404s', async () => {
    for (const path of ['/groups/not-a-uuid', '/feed/', '/nope', '/t/kind/group/', '/t/connection/', '/users/123', '/practices/A_B',
      '/c/ab', '/c/Sam', '/c/sam..runs', '/c/.sam', '/recipes/catalog/1234567',
      '/r/short', '/r/aB3dE5fG7h1', '/r/aB3dE-fG7h', '/r/aB3dE5fG7h/']) {
      const res = await get(path);
      assert.equal(res.status, 404, path);
      assert.match(await res.text(), /Nothing/);
    }
  });

  test('every kind of response says https only, for a year', async () => {
    const paths = ['/.well-known/apple-app-site-association', '/.well-known/assetlinks.json', '/feed', '/nope', `/i/${TOKENS.publicGroup}`, '/og/default.jpg', '/get-the-app'];
    for (const path of paths) {
      assert.equal((await get(path)).headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains', path);
    }
    assert.equal((await get('/feed', { method: 'POST' })).headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains', 'a 405');
  });

  test('anything but GET or HEAD is refused', async () => {
    assert.equal((await get('/feed', { method: 'POST' })).status, 405);
    const head = await get('/feed', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal((await head.text()).length, 0);
  });

  test('the visitor\'s store goes first', async () => {
    const android = await (await get('/feed', { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9)' } })).text();
    assert.match(android, /<html[^>]*data-platform="android"/);
    const iphone = await (await get('/feed', { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)' } })).text();
    assert.match(iphone, /<html[^>]*data-platform="ios"/);
    assert.equal(detectPlatform('Mozilla/5.0 (Macintosh)'), null);
  });

  test('the payment return reads ?status= as a hint', async () => {
    assert.equal(paymentState(null), 'pending');
    assert.equal(paymentState('successful'), 'successful');
    assert.equal(paymentState('cancelled'), 'notCompleted');
    const res = await get('/payments/return?status=successful&tx_ref=x');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.match(await res.text(), /You&#39;re All Set|You're All Set/);
  });

  test('paths match only their own template', () => {
    assert.equal(matchLinkPath('/groups/3f1c2a4e-8b7d-4c1e-9a2b-1c2d3e4f5a6b/posts/3f1c2a4e-8b7d-4c1e-9a2b-1c2d3e4f5a6b/comments').spec.name, 'groupPostComments');
    assert.equal(matchLinkPath('/i/short'), null);
  });
});

describe('/i/{token}', () => {
  const invite = async (t, ua) => {
    const res = await get(`/i/${t}`, ua ? { headers: { 'User-Agent': ua } } : {});
    return { res, html: await res.text() };
  };

  test('a public group shows its name, count and that it is public, and never the token', async () => {
    const { res, html } = await invite(TOKENS.publicGroup);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.match(html, /Morning Runners/);
    assert.match(html, /128 members/);
    assert.match(html, /Public group/);
    assert.equal(meta(html, 'og:title'), 'Join Morning Runners on SeeMyHealth');
    const og = new URL(meta(html, 'og:image'));
    assert.equal(og.pathname, '/og/invite/group.jpg');
    assert.ok(!og.search.includes(TOKENS.publicGroup));
    // The token appears in og:url only (the page's own address, which a crawler must be given back).
    const withoutOgUrl = html.replace(/<meta property="og:url"[^>]*>/, '');
    assert.ok(!withoutOgUrl.includes(TOKENS.publicGroup), 'the token is nowhere else in the page');
  });

  test('a private group shows nothing about the group', async () => {
    const { res, html } = await invite(TOKENS.privateGroup);
    assert.equal(res.status, 200);
    assert.doesNotMatch(html, /Morning Runners|members<|Public group/);
    assert.match(html, /Its details are for members/);
    assert.match(meta(html, 'og:image'), /\/og\/invite-group\.jpg$/);
  });

  test('a public challenge shows its name and how many are taking part', async () => {
    const { html } = await invite(TOKENS.publicChallenge);
    assert.match(html, /October Steps/);
    assert.match(html, /42 taking part/);
  });

  test('a friend invite is person to person and names nobody', async () => {
    const { res, html } = await invite(TOKENS.friend);
    assert.equal(res.status, 200);
    assert.match(html, /Someone Wants/);
    assert.match(meta(html, 'og:image'), /\/og\/invite-friend\.jpg$/);
  });

  test('a family invite says what joining means and shares nothing', async () => {
    const { html } = await invite(TOKENS.family);
    assert.match(html, /Joining shares nothing about your health/);
    assert.match(meta(html, 'og:image'), /\/og\/invite-family\.jpg$/);
    assert.equal(meta(html, 'og:title'), "You've Been Invited to Share with Family");
  });

  test('expired, revoked and used-up answer 410 in the apps\' words, with a neutral card', async () => {
    for (const [t, words, card] of [
      [TOKENS.expired, 'This invite has run out of time. Ask whoever sent it to share a new one.', 'invite-expired'],
      [TOKENS.revoked, 'This invite isn&#39;t active any more. Ask whoever sent it for a new link.', 'invite-revoked'],
      [TOKENS.usedUp, 'Someone has already used this invite. Ask whoever sent it for one of your own.', 'invite-used-up'],
    ]) {
      const { res, html } = await invite(t);
      assert.equal(res.status, 410);
      assert.ok(html.includes(words) || html.includes(words.replace('&#39;', "'")), words);
      assert.match(meta(html, 'og:image'), new RegExp(`/og/${card}\\.jpg$`));
    }
  });

  test('an unknown token is 404, a malformed one never reaches the backend, a failed read is 503', async () => {
    assert.equal((await invite(TOKENS.unknown)).res.status, 404);
    const before = stubCalls.length;
    const { res, html } = await invite('not-a-token');
    assert.equal(res.status, 404);
    assert.match(html, /Nothing/);
    assert.equal(stubCalls.length, before);
    const broken = await invite(TOKENS.broken);
    assert.equal(broken.res.status, 503);
    assert.match(broken.html, /Invite Didn/);
  });

  test('the backend is only ever read: GET, with the secret', () => {
    assert.ok(stubCalls.length > 0);
    for (const c of stubCalls) {
      assert.equal(c.method, 'GET');
      assert.equal(c.secret, SECRET);
      assert.match(c.url, /^\/api\/v2\/links\/(invites\/[A-Za-z0-9_-]{43}|recipes\/[A-Za-z0-9]{10})$/);
    }
  });

  test('WhatsApp and iMessage crawlers get the tags straight away, with no redirect', async () => {
    for (const ua of ['WhatsApp/2.24.20.80 A', 'facebookexternalhit/1.1 Facebot Twitterbot/1.0']) {
      const { res, html } = await invite(TOKENS.publicGroup, ua);
      assert.equal(res.status, 200);
      assert.match(meta(html, 'og:image'), /\/og\/invite\/group\.jpg\?key=/);
      const fallback = await get('/feed', { headers: { 'User-Agent': ua } });
      assert.equal(fallback.status, 200);
    }
  });
});

describe('/r/{code}', () => {
  const share = async (code, ua) => {
    const res = await get(`/r/${code}`, ua ? { headers: { 'User-Agent': ua } } : {});
    return { res, html: await res.text() };
  };

  test('shows the recipe\'s name, its photo and who shared it, with one job: get the app', async () => {
    const { res, html } = await share(CODES.machboos);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    assert.match(html, /data-slot="name"[^>]*>Mum(&#39;|')s chicken machboos</);
    assert.match(html, /data-slot="shared-by"[^>]*>Shared by John Kenyatta</);
    assert.match(html, /<img src="https:\/\/imagedelivery\.net\/NnC2JvU8j4bgBbmedVhjJg\/logging-food\/public"[^>]*data-slot="cover"/);
    assert.match(html, /This Recipe Opens/);
    assert.match(html, /data-store="ios"/);
    assert.match(html, /data-store="android"/);
    assert.match(html, /Already have it\?/);
    assert.match(html, /Open in the App/);
    assert.doesNotMatch(html, />A Recipe<|>Shared with you</, 'every placeholder is filled');
  });

  test('the rich preview: the recipe\'s name, "Shared by", and its drawn card, never the code', async () => {
    const { html } = await share(CODES.machboos);
    assert.match(meta(html, 'og:title'), /^Mum(&#39;|')s chicken machboos \| SeeMyHealth$/);
    assert.match(meta(html, 'og:description'), /^Shared by John Kenyatta\. 640 kcal, 50 min\./);
    assert.match(meta(html, 'og:image:alt'), /^Mum(&#39;|')s chicken machboos$/);
    const og = new URL(meta(html, 'og:image').replace(/&amp;/g, '&'));
    assert.equal(og.pathname, '/og/share/recipe.jpg');
    assert.ok(!og.search.includes(CODES.machboos));
    assert.equal(new URL(meta(html, 'og:url')).pathname, `/r/${CODES.machboos}`);
    const withoutOgUrl = html.replace(/<meta property="og:url"[^>]*>/, '');
    assert.ok(!withoutOgUrl.includes(CODES.machboos), 'the code is nowhere else in the page');

    const card = await get(`${og.pathname}${og.search}`);
    assert.equal(card.status, 200);
    assert.equal(card.headers.get('content-type'), 'image/jpeg');
    assert.equal(card.headers.get('x-card'), 'dynamic');
  });

  test('no photo and no sharer name: the art stays and it says it was shared with you', async () => {
    const { res, html } = await share(CODES.noPhoto);
    assert.equal(res.status, 200);
    assert.match(html, /High-protein oats/);
    assert.match(html, /data-slot="shared-by"[^>]*>Shared with you</);
    assert.match(meta(html, 'og:description'), /^Shared with you\. 410 kcal\./);
  });

  test('an unknown code is 404 in the recipe\'s words, a failed read is 503, a malformed code never reaches the backend', async () => {
    const unknown = await share(CODES.unknown);
    assert.equal(unknown.res.status, 404);
    assert.equal(unknown.res.headers.get('cache-control'), 'no-store');
    assert.match(unknown.html, /Recipe Not Found/);
    assert.match(meta(unknown.html, 'og:image'), /\/og\/recipe-share-not-found\.jpg$/);
    const broken = await share(CODES.broken);
    assert.equal(broken.res.status, 503);
    assert.match(broken.html, /Recipe Didn/);
    const before = stubCalls.length;
    const bad = await share('short');
    assert.equal(bad.res.status, 404);
    assert.match(bad.html, /Nothing/);
    assert.equal(stubCalls.length, before);
  });

  test('a crawler gets the tags straight away, with no redirect', async () => {
    for (const ua of ['WhatsApp/2.24.20.80 A', 'facebookexternalhit/1.1 Facebot Twitterbot/1.0']) {
      const { res, html } = await share(CODES.machboos, ua);
      assert.equal(res.status, 200);
      assert.match(meta(html, 'og:image'), /\/og\/share\/recipe\.jpg\?key=/);
    }
  });

  test('a tampered key draws the static recipe card, and an invite key never draws a recipe', async () => {
    const stat = new Uint8Array(await (await get('/og/recipe-share.jpg')).arrayBuffer());
    const groupKey = await mintCardKey({ k: 'group', n: 'Morning Runners', c: 1, i: null }, SECRET);
    for (const q of ['?key=abc.def', `?key=${groupKey}`, '']) {
      const res = await get(`/og/share/recipe.jpg${q}`);
      assert.match(res.headers.get('x-card'), /^fallback/);
      assert.deepEqual(new Uint8Array(await res.arrayBuffer()), stat);
    }
  });

  test('the recipe preview is read strictly', () => {
    const ok = RECIPES[CODES.machboos];
    assert.equal(parseRecipePreview(ok).outcome, 'found');
    assert.equal(parseRecipePreview({ ...ok, extra: 1 }).outcome, 'unavailable');
    assert.equal(parseRecipePreview({ ...ok, name: ' ' }).outcome, 'unavailable');
    assert.equal(parseRecipePreview({ ...ok, totalMinutes: 1.5 }).outcome, 'unavailable');
    const { sharedByName, ...missing } = ok;
    assert.equal(parseRecipePreview(missing).outcome, 'unavailable');
  });
});

describe('/c/{handle}', () => {
  test('shows the @handle, says the request waits in Requests, and offers the stores', async () => {
    const res = await get('/c/sam.runs_42');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    const html = await res.text();
    assert.match(html, /data-slot="handle"[^>]*>@sam\.runs_42</);
    assert.match(html, /Invited You/);
    assert.match(html, /waiting in Requests/);
    assert.equal(meta(html, 'og:title'), '@sam.runs_42 invited you to connect on SeeMyHealth');
    assert.match(meta(html, 'og:description'), /@sam\.runs_42&#39;s connection request|@sam\.runs_42's connection request/);
    assert.match(meta(html, 'og:image'), /\/og\/connection-invite\.jpg$/);
    assert.doesNotMatch(html, /@someone/, 'every placeholder is filled');
    assert.match(html, /data-store="ios"/);
    assert.match(html, /data-store="android"/);
  });

  test('never reads the backend', async () => {
    const before = stubCalls.length;
    await get('/c/sam.runs_42');
    assert.equal(stubCalls.length, before);
  });
});

describe('Open Graph cards', () => {
  test('a public group\'s card renders as a 1200 x 630 JPEG from its key', async () => {
    const html = await (await get(`/i/${TOKENS.publicGroup}`)).text();
    const og = new URL(meta(html, 'og:image'));
    const res = await get(`${og.pathname}${og.search}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/jpeg');
    assert.equal(res.headers.get('cache-control'), 'public, max-age=300');
    // Drawn here, not the static fallback: a render that throws falls back silently otherwise.
    assert.equal(res.headers.get('x-card'), 'dynamic');
    const bytes = new Uint8Array(await res.arrayBuffer());
    assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
  });

  test('a tampered, foreign or expired key draws the kind\'s static card', async () => {
    const stat = new Uint8Array(await (await get('/og/invite-group.jpg')).arrayBuffer());
    const forged = await mintCardKey({ k: 'group', n: 'Not Ours', c: 1, i: null }, 'some-other-secret');
    for (const q of ['?key=abc.def', `?key=${forged}`, '']) {
      const res = await get(`/og/invite/group.jpg${q}`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('x-card'), /^fallback/);
      assert.deepEqual(new Uint8Array(await res.arrayBuffer()), stat);
    }
    const old = await mintCardKey({ k: 'group', n: 'Old', c: 1, i: null }, SECRET, Date.now() - 31 * 60 * 1000);
    assert.equal(await mintCardKey({ k: 'group', n: 'Same', c: 1, i: null }, SECRET, 1_800_000_000_000), await mintCardKey({ k: 'group', n: 'Same', c: 1, i: null }, SECRET, 1_800_000_000_000 + 60_000), 'one window, one key');
    assert.equal(await openCardKey(old, SECRET), null);
  });

  test('every static card is served as a JPEG', async () => {
    for (const name of ['default', 'not-found', 'kind-messages', 'kind-awards', 'invite-family', 'invite-revoked', 'connection-invite', 'payment-pending',
      'recipe-share', 'recipe-share-not-found', 'recipe-share-unavailable']) {
      const res = await get(`/og/${name}.jpg`);
      assert.equal(res.status, 200, name);
      assert.equal(res.headers.get('content-type'), 'image/jpeg', name);
    }
  });
});

describe('copy', () => {
  test('no page has an em or en dash, or a coming-soon store button', async () => {
    const paths = [...LINK_PATHS.paths.filter((p) => p.name !== 'invite').map(examplePath), '/get-the-app', '/nope',
      ...Object.values(TOKENS).map((t) => `/i/${t}`), ...Object.values(CODES).map((c) => `/r/${c}`), '/payments/return?status=failed'];
    for (const path of paths) {
      const html = await (await get(path)).text();
      const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
      assert.doesNotMatch(text, /[–—]/, `${path} has a dash`);
      assert.doesNotMatch(text, /coming soon/i, path);
    }
  });

  test('the preview is read strictly', () => {
    assert.equal(parsePreview({ kind: 'group', status: 'active', target: null, extra: 1 }).outcome, 'unavailable');
    assert.equal(parsePreview({ kind: 'team', status: 'active', target: null }).outcome, 'unavailable');
    assert.equal(parsePreview({ kind: 'group', status: 'active', target: { name: 'x', imageUrl: null } }).outcome, 'unavailable');
  });
});
