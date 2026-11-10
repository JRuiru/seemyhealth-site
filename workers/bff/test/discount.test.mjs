// discountCodeList (src/discount.ts): which bodies POST /api/cart/create and /api/cart/discount
// pass on to Shopify. No network.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const { discountCodeList } = await import(join(HERE, '..', 'src', 'discount.ts'));

test('keeps well-formed codes', () => {
  assert.deepEqual(discountCodeList(['SMH-ABCDEFGHJK']), ['SMH-ABCDEFGHJK']);
  assert.deepEqual(discountCodeList(['WELCOME_10', 'x']), ['WELCOME_10', 'x']);
});

test('refuses anything else', () => {
  for (const bad of [undefined, null, 'SMH-A', [], [''], ['a b'], ['a/b'], ['<x>'], [1], ['a'.repeat(65)], Array(6).fill('A')]) {
    assert.equal(discountCodeList(bad), null, JSON.stringify(bad));
  }
});
