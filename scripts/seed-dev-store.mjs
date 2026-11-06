// Builds the DEVELOPMENT store's catalogue from the website's own product data, and writes the dev
// store's variant ids for the dev build (CLAUDE.md "Prod and dev").
//
// src/data/variants.ts is the catalogue: every product's handle, name, options, variants, prices and
// images. For each product this upserts the same product in the dev store by HANDLE (productSet, so a
// rerun updates rather than duplicates), publishes it to every sales channel, and records each
// variant's dev id in src/data/dev-store-variant-ids.json by matching options. Variants sell without
// stock (inventory policy CONTINUE): testers buy with Shopify's test gateway.
//
// Auth is the backend's dev app ("SeeMyHealth Backend (dev)", cmh-golang/shopify/shopify.app.dev.toml,
// which alone holds the product and publication scopes), through the client-credentials grant the
// backend uses. The secret comes from Secret Manager in the command itself and is never written down:
//
//   SHOPIFY_CLIENT_SECRET="$(gcloud secrets versions access latest --secret cmh-dev-shopify-client-secret \
//     --project seemyhealth-go-dev)" node --experimental-strip-types scripts/seed-dev-store.mjs
//
// Refuses to run against any store but the development one.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "src", "data", "dev-store-variant-ids.json");
const STORE = "seemyhealth-dev.myshopify.com";
const CLIENT_ID = "a0d1000c8cce14569d2d917837c82c9a"; // the dev app's (public) client id
const API_VERSION = "2026-10"; // = cmh-golang platform/shopify.APIVersion

const secret = process.env.SHOPIFY_CLIENT_SECRET;
if (!secret) {
  console.error("SHOPIFY_CLIENT_SECRET is not set (see the header for the command)");
  process.exit(1);
}

const tokenRes = await fetch(`https://${STORE}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: secret }),
});
if (!tokenRes.ok) {
  console.error(`the dev store refused the app's credentials (${tokenRes.status}): is the dev app installed on ${STORE}?`);
  process.exit(1);
}
const { access_token: token } = await tokenRes.json();

async function admin(query, variables) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Admin API answered ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const { publications } = await admin(`{ publications(first: 20) { nodes { id name } } }`);

const PRODUCT_SET = `mutation ($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
  productSet(identifier: $identifier, input: $input, synchronous: true) {
    product { id variants(first: 100) { nodes { id selectedOptions { name value } } } }
    userErrors { field message }
  }
}`;
const PUBLISH = `mutation ($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) { userErrors { field message } }
}`;

const { productVariants } = await import(join(ROOT, "src", "data", "variants.ts"));
const ids = {};
const sameOptions = (a, b) => Object.entries(a).every(([k, v]) => b[k] === v);

for (const [handle, p] of Object.entries(productVariants)) {
  const optionValues = (name) => [...new Set(p.variants.map((v) => v.options[name]).filter(Boolean))];
  const images = Object.values(p.media ?? {})
    .flat()
    .filter((m) => m.type === "image")
    .slice(0, 10)
    .map((m) => ({ originalSource: m.url, contentType: "IMAGE", alt: m.alt ?? p.name }));

  const input = {
    handle,
    title: p.name,
    status: "ACTIVE",
    productOptions: p.optionNames.map((name) => ({ name, values: optionValues(name).map((v) => ({ name: v })) })),
    variants: p.variants.map((v) => ({
      optionValues: p.optionNames.map((name) => ({ optionName: name, name: v.options[name] })),
      price: v.price,
      inventoryPolicy: "CONTINUE",
    })),
    files: images,
  };
  const { productSet } = await admin(PRODUCT_SET, { identifier: { handle }, input });
  if (productSet.userErrors.length) {
    console.error(`  ✗ ${handle}: ${productSet.userErrors.map((e) => e.message).join("; ")}`);
    continue;
  }
  const product = productSet.product;
  const { publishablePublish } = await admin(PUBLISH, {
    id: product.id,
    input: publications.nodes.map((pub) => ({ publicationId: pub.id })),
  });
  if (publishablePublish.userErrors.length) {
    console.warn(`  ! ${handle} not published: ${publishablePublish.userErrors.map((e) => e.message).join("; ")}`);
  }

  for (const v of p.variants) {
    const devNode = product.variants.nodes.find((n) =>
      sameOptions(v.options, Object.fromEntries(n.selectedOptions.map((o) => [o.name, o.value]))),
    );
    ids[v.id] = { product: handle, title: v.title, dev: devNode?.id ?? "" };
  }
  console.log(`  ✓ ${handle}: ${product.variants.nodes.length} variants, ${images.length} images`);
}

const readme = JSON.parse(await readFile(FILE, "utf8"))._readme;
await writeFile(FILE, JSON.stringify({ _readme: readme, variants: ids }, null, 2) + "\n");
const missing = Object.values(ids).filter((v) => !v.dev);
console.log(`\n${Object.keys(ids).length} variants mapped${missing.length ? `, ${missing.length} without a dev id` : ""}.`);
