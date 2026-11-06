// The dev store's variant ids, for the dev build (CLAUDE.md "Prod and dev").
//
// src/data/variants.ts holds the REAL store's ProductVariant ids, and a variant id belongs to one
// store: the dev store's cart refuses them. `npm run build:dev` swaps each one for the dev store's id
// listed in src/data/dev-store-variant-ids.json (astro.config.mjs, devStoreVariantIds); a prod build
// never reads that file.
//
//   node scripts/dev-store-variant-ids.mjs
//       refreshes the file's entries from variants.ts (one per real-store id), keeping every dev id
//       already filled in, and lists the ones still empty.
//
//   DEV_SHOPIFY_STORE_DOMAIN=seemyhealth-dev.myshopify.com DEV_SHOPIFY_STOREFRONT_TOKEN=... \
//     node scripts/dev-store-variant-ids.mjs
//       also asks the dev store's Storefront API for each product (same handle) and fills each dev
//       id by the variant's options (Finish/Size/Color), or the product's only variant.
//
// Run it again whenever a variant is added to variants.ts or to the dev store.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "src", "data", "dev-store-variant-ids.json");
const STOREFRONT_API_VERSION = "2025-04"; // as workers/bff/src/shopify.ts

const { productVariants } = await import(join(ROOT, "src", "data", "variants.ts"));

let existing = {};
try {
  existing = JSON.parse(await readFile(FILE, "utf8")).variants ?? {};
} catch {
  existing = {};
}

const domain = process.env.DEV_SHOPIFY_STORE_DOMAIN;
const token = process.env.DEV_SHOPIFY_STOREFRONT_TOKEN;

async function devVariants(handle) {
  const res = await fetch(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({
      query: `query ($handle: String!) { product(handle: $handle) { variants(first: 100) { edges { node { id title selectedOptions { name value } } } } } }`,
      variables: { handle },
    }),
  });
  if (!res.ok) throw new Error(`dev store answered ${res.status} for ${handle}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(", "));
  return json.data?.product?.variants?.edges?.map((e) => e.node) ?? null;
}

const variants = {};
for (const [handle, product] of Object.entries(productVariants)) {
  const live = domain && token ? await devVariants(handle) : null;
  if (domain && token && !live) console.warn(`  ! the dev store has no product "${handle}"`);

  for (const v of product.variants) {
    let dev = existing[v.id]?.dev ?? "";
    if (live) {
      const match =
        live.length === 1 && product.variants.length === 1
          ? live[0]
          : live.find((n) =>
              Object.entries(v.options).every(([name, value]) =>
                n.selectedOptions.some((o) => o.name === name && o.value === value)
              )
            );
      if (match) dev = match.id;
      else console.warn(`  ! no dev-store variant of ${handle} matches "${v.title}"`);
    }
    variants[v.id] = { product: handle, title: v.title, dev };
  }
}

await writeFile(
  FILE,
  JSON.stringify(
    {
      _readme:
        "Real-store ProductVariant id -> the dev store's id for the same variant. Read only by `npm run build:dev`; written by scripts/dev-store-variant-ids.mjs.",
      variants,
    },
    null,
    2
  ) + "\n"
);

const empty = Object.values(variants).filter((v) => !v.dev);
console.log(`Wrote ${Object.keys(variants).length} variants to src/data/dev-store-variant-ids.json.`);
if (empty.length) {
  console.log(`${empty.length} still have no dev-store id:`);
  for (const v of empty) console.log(`  - ${v.product}: ${v.title}`);
}
