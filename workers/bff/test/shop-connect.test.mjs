// POST /api/shop/connect's logic (src/shop-connect.ts), against stubs of the Customer Account API
// and the backend's /webhooks/shop/connect. Run with `npm test` in workers/bff. No network.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const { connectShopAccount, mapBackendAnswer, safeReturnPath, isPlausibleConnectToken } = await import(
  join(HERE, '..', 'src', 'shop-connect.ts')
);

const SITE = 'https://www.seemyhealth.ai';
const TOKEN = 'a'.repeat(43);
const CUSTOMER_ID = 'gid://shopify/Customer/123';
const CONFIG = {
  backendApiBase: 'https://api.example.test',
  webhookToken: 'webhook-secret-for-tests',
  customerAccountDomain: 'account.example.test',
  siteOrigin: SITE,
};

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// A fetch that answers the Customer Account API with `customer` and the webhook with `webhook`,
// recording every call.
function stubFetch({ customer = { id: CUSTOMER_ID, emailAddress: { emailAddress: 'shop@example.com' } }, customerStatus = 200, webhook = [200, { status: 'linked', email: 'shop@example.com' }] } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).startsWith('https://account.example.test/')) {
      return jsonResponse(customerStatus, { data: { customer } });
    }
    if (String(url) === 'https://api.example.test/webhooks/shop/connect') {
      if (webhook instanceof Error) throw webhook;
      return jsonResponse(webhook[0], webhook[1]);
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return { fetchImpl, calls };
}

const quiet = (fn) => async () => {
  const original = console.error;
  console.error = () => {};
  try {
    await fn();
  } finally {
    console.error = original;
  }
};

describe('connectShopAccount', () => {
  test('sends the session customer, not anything from the body, to the backend with the bearer token', async () => {
    const { fetchImpl, calls } = stubFetch();
    const out = await connectShopAccount(
      { accessToken: 'session-access-token', body: { t: TOKEN, customer_id: 'gid://shopify/Customer/999', email: 'attacker@example.com' } },
      CONFIG,
      fetchImpl
    );

    assert.deepEqual(out, { httpStatus: 200, body: { status: 'linked', email: 'shop@example.com' } });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].init.headers.Authorization, 'session-access-token');
    const webhook = calls[1];
    assert.equal(webhook.init.method, 'POST');
    assert.equal(webhook.init.headers.Authorization, 'Bearer webhook-secret-for-tests');
    assert.deepEqual(JSON.parse(webhook.init.body), { token: TOKEN, customer_id: CUSTOMER_ID, email: 'shop@example.com' });
  });

  test('a visitor with no session is signed out, and the backend is never asked', async () => {
    const { fetchImpl, calls } = stubFetch();
    const out = await connectShopAccount({ accessToken: null, body: { t: TOKEN } }, CONFIG, fetchImpl);
    assert.deepEqual(out, { httpStatus: 401, body: { status: 'signed_out' } });
    assert.equal(calls.length, 0);
  });

  test('an access token the Customer Account API refuses is signed out', async () => {
    const { fetchImpl, calls } = stubFetch({ customerStatus: 401 });
    const out = await connectShopAccount({ accessToken: 'stale', body: { t: TOKEN } }, CONFIG, fetchImpl);
    assert.equal(out.body.status, 'signed_out');
    assert.equal(calls.length, 1);
  });

  test('a malformed token reads as an old link without asking anyone', async () => {
    const { fetchImpl, calls } = stubFetch();
    for (const t of [undefined, '', 'short', 'a'.repeat(42) + '!', 42]) {
      const out = await connectShopAccount({ accessToken: 'x', body: { t } }, CONFIG, fetchImpl);
      assert.deepEqual(out, { httpStatus: 410, body: { status: 'expired' } });
    }
    assert.equal(calls.length, 0);
  });

  test('unconfigured, it fails with 503 before reading anything', quiet(async () => {
    const { fetchImpl, calls } = stubFetch();
    for (const config of [{ ...CONFIG, webhookToken: undefined }, { ...CONFIG, backendApiBase: '' }]) {
      const out = await connectShopAccount({ accessToken: 'x', body: { t: TOKEN } }, config, fetchImpl);
      assert.deepEqual(out, { httpStatus: 503, body: { status: 'failed' } });
    }
    assert.equal(calls.length, 0);
  }));

  test('an unreachable backend is a failure the page can retry', quiet(async () => {
    const { fetchImpl } = stubFetch({ webhook: new Error('connection refused') });
    const out = await connectShopAccount({ accessToken: 'x', body: { t: TOKEN } }, CONFIG, fetchImpl);
    assert.deepEqual(out, { httpStatus: 502, body: { status: 'failed' } });
  }));

  test('a customer id that is not a Shopify customer gid is a failure, never forwarded', quiet(async () => {
    const { fetchImpl, calls } = stubFetch({ customer: { id: '123', emailAddress: { emailAddress: 'a@b.c' } } });
    const out = await connectShopAccount({ accessToken: 'x', body: { t: TOKEN } }, CONFIG, fetchImpl);
    assert.equal(out.body.status, 'failed');
    assert.equal(calls.length, 1);
  }));

  test('a trailing slash on the backend base does not double up', async () => {
    const { fetchImpl, calls } = stubFetch();
    await connectShopAccount({ accessToken: 'x', body: { t: TOKEN } }, { ...CONFIG, backendApiBase: 'https://api.example.test/' }, fetchImpl);
    assert.equal(calls[1].url, 'https://api.example.test/webhooks/shop/connect');
  });
});

describe('mapBackendAnswer', () => {
  test('every answer in the contract maps onto its outcome', quiet(async () => {
    assert.deepEqual(mapBackendAnswer(200, { status: 'linked', email: 'store@x.y' }, 'session@x.y'), { httpStatus: 200, body: { status: 'linked', email: 'store@x.y' } });
    assert.deepEqual(mapBackendAnswer(200, { status: 'already_linked' }, 'session@x.y'), { httpStatus: 200, body: { status: 'already_linked', email: 'session@x.y' } });
    assert.deepEqual(mapBackendAnswer(409, { status: 'customer_linked_elsewhere' }, 's'), { httpStatus: 409, body: { status: 'customer_linked_elsewhere' } });
    assert.deepEqual(mapBackendAnswer(409, { status: 'identity_linked_elsewhere' }, 's'), { httpStatus: 409, body: { status: 'identity_linked_elsewhere' } });
    assert.deepEqual(mapBackendAnswer(410, { status: 'expired' }, 's'), { httpStatus: 410, body: { status: 'expired' } });
  }));

  test('anything outside the contract is a failure, never passed through', quiet(async () => {
    for (const [status, body] of [[401, { error: 'nope' }], [503, null], [500, 'x'], [200, { status: 'surprise' }], [409, { status: 'other' }]]) {
      assert.deepEqual(mapBackendAnswer(status, body, 's'), { httpStatus: 502, body: { status: 'failed' } });
    }
  }));
});

describe('safeReturnPath', () => {
  test('keeps a same-origin path with its query', () => {
    assert.equal(safeReturnPath(`/account/connect?t=${TOKEN}`, SITE), `/account/connect?t=${TOKEN}`);
    assert.equal(safeReturnPath('/account', SITE), '/account');
  });

  test('refuses anything that could leave the site or land on the BFF', () => {
    for (const raw of [
      null, undefined, '', 'account', 'https://evil.example/', '//evil.example/x', '/\\evil.example',
      '\\\\evil.example', '/\tevil', '/%0aevil'.replace('%0a', '\n'), 'javascript:alert(1)',
      '/api/auth/logout', '/api', '/api/shop/connect', '/' + 'a'.repeat(2048),
    ]) {
      assert.equal(safeReturnPath(raw, SITE), null, String(raw));
    }
  });
});

test('isPlausibleConnectToken accepts URL-safe tokens of at least 32 characters only', () => {
  assert.equal(isPlausibleConnectToken('Ab-_'.repeat(11)), true);
  assert.equal(isPlausibleConnectToken('a'.repeat(31)), false);
  assert.equal(isPlausibleConnectToken('a'.repeat(40) + '+/='), false);
});
