#!/usr/bin/env node
// Renders every static Open Graph card (src/catalogue.ts STATIC_CARDS) into the links build, as
// /og/<name>.jpg: each kind's card, the payment states, the invite kinds' generic cards, the neutral
// invite states and the default. Runs after `astro build --config astro.links.config.mjs`, with the
// same card code the Worker uses for the dynamic ones. Fetches the site's own Cloudflare photos.
//
// Run under `node --experimental-strip-types` (Node 22); Node 24 needs no flag.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const OUT = join(HERE, '..', 'dist', 'og');
const require = createRequire(import.meta.url);

const { STATIC_CARDS, CF_IMG, LOGO } = await import(join(HERE, '..', 'src', 'catalogue.ts'));
const { initRenderer, renderCard, photoDataUri } = await import(join(HERE, '..', 'src', 'og', 'render.ts'));

await initRenderer(
  readFileSync(require.resolve('yoga-wasm-web/dist/yoga.wasm')),
  readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm')),
);

const font = (name) => readFileSync(join(ROOT, 'links', 'public', 'fonts', `${name}.ttf`)).buffer;
const fonts = { oswaldLight: font('oswald-300'), oswaldMedium: font('oswald-500'), interRegular: font('inter-400'), interSemibold: font('inter-600') };

const logo = await photoDataUri(LOGO);
if (!logo) throw new Error(`could not fetch the logo (${LOGO})`);

mkdirSync(OUT, { recursive: true });
const photos = new Map();
for (const [name, copy] of Object.entries(STATIC_CARDS)) {
  let photo;
  if (copy.photo) {
    if (!photos.has(copy.photo)) photos.set(copy.photo, await photoDataUri(`${CF_IMG}/${copy.photo}/public`));
    photo = photos.get(copy.photo);
    if (!photo) throw new Error(`could not fetch the photo ${copy.photo} for card ${name}`);
  }
  const bytes = await renderCard({ layout: copy.layout, eyebrow: copy.eyebrow, title: copy.title, bold: copy.bold || undefined, line: copy.line, accent: copy.accent, photo }, logo, fonts);
  writeFileSync(join(OUT, `${name}.jpg`), bytes);
  console.log(`  og/${name}.jpg  ${(bytes.byteLength / 1024).toFixed(0)} KB`);
}
console.log(`✓ ${Object.keys(STATIC_CARDS).length} static cards`);
