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

// Example values for each parameter type, as the backend makes them.
const EXAMPLE = {
  uuid: '3f1c2a4e-8b7d-4c1e-9a2b-1c2d3e4f5a6b',
  identityId: `usr_${'0123456789abcdef'.repeat(2)}`,
  documentId: 'usr_x_2026-10-29_steps',
  practiceCode: 'green-valley-clinic',
  inviteToken: TOKENS.privateGroup,
};
const examplePath = (p) => p.template.replace(/\{([^}]+)\}/g, (_m, name) => EXAMPLE[p.params.find((x) => x.name === name).type]);

let stub, stubCalls = [], worker;

before(async () => {
  stub = createServer((req, res) => {
    stubCalls.push({ method: req.method, url: req.url, secret: req.headers['x-links-preview-secret'] });
    const m = /^\/api\/v2\/links\/invites\/([A-Za-z0-9_-]+)$/.exec(req.url ?? '');
    if (req.headers['x-links-preview-secret'] !== SECRET) { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end('{"code":"UNAUTHORIZED"}'); }
    if (!m || m[1] === TOKENS.unknown) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"code":"INVITE_NOT_FOUND","category":"not_found"}'); }
    if (m[1] === TOKENS.broken) { res.writeHead(500); return res.end('{}'); }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(PREVIEWS[m[1]]));
  });
  await new Promise((r) => stub.listen(0, '127.0.0.1', r));
  worker = await unstable_dev(join(WORKER, 'src', 'index.ts'), {
    config: join(WORKER, 'wrangler.jsonc'),
    env: '',
    vars: { API_BASE: `http://127.0.0.1:${stub.address().port}`, LINKS_PREVIEW_SECRET: SECRET },
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
  test('the Apple file claims exactly the 36 templates, for both app ids, as JSON with no redirect', async () => {
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
    assert.equal(detail.components.length, 37);
    assert.ok(detail.components.some((c) => c['/'] === '/family-invitations' && c['?']?.sent === ''), '?sent has its own component');
    assert.ok(detail.components.some((c) => c['/'] === '/family-invitations' && !c['?']), 'and so does the bare list');
  });

  test('the Android file lists the dev app with its full fingerprint, and no placeholder for prod', async () => {
    const res = await get('/.well-known/assetlinks.json');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].target.package_name, 'ai.seemyhealth.app.dev');
    assert.equal(body[0].target.sha256_cert_fingerprints[0], '96:F2:9A:52:78:30:39:B9:64:9B:D3:13:1B:BD:3C:29:E0:F5:09:64:A5:EA:74:9F:82:27:CA:61:C0:A7:46:78');
  });
});

describe('every link path', () => {
  test('has a page kind', () => {
    for (const p of LINK_PATHS.paths) assert.ok(PAGE_KIND_BY_PATH[p.name], `${p.name} has no page kind`);
  });

  for (const p of LINK_PATHS.paths) {
    if (p.name === 'invite') continue;
    test(`${p.template} draws its ${PAGE_KIND_BY_PATH[p.name]} page with its Open Graph card`, async () => {
      const path = examplePath(p);
      const res = await get(path);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-robots-tag'), 'noindex');
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
      const html = await res.text();
      const kind = PAGE_KIND_BY_PATH[p.name];
      const card = kind === 'payment' ? '/og/payment-pending.jpg' : `/og/kind-${kind}.jpg`;
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
    for (const path of ['/groups/not-a-uuid', '/feed/', '/nope', '/t/kind/group/', '/users/123', '/practices/A_B']) {
      const res = await get(path);
      assert.equal(res.status, 404, path);
      assert.match(await res.text(), /Nothing/);
    }
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
      assert.match(c.url, /^\/api\/v2\/links\/invites\/[A-Za-z0-9_-]{43}$/);
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
    for (const name of ['default', 'not-found', 'kind-messages', 'invite-family', 'invite-revoked', 'payment-pending']) {
      const res = await get(`/og/${name}.jpg`);
      assert.equal(res.status, 200, name);
      assert.equal(res.headers.get('content-type'), 'image/jpeg', name);
    }
  });
});

describe('copy', () => {
  test('no page has an em or en dash, or a coming-soon store button', async () => {
    const paths = [...LINK_PATHS.paths.filter((p) => p.name !== 'invite').map(examplePath), '/get-the-app', '/nope',
      ...Object.values(TOKENS).map((t) => `/i/${t}`), '/payments/return?status=failed'];
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
