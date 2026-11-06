// @ts-check
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Two lines (CLAUDE.md "Prod and dev"). `npm run build` builds prod, exactly as before;
// `npm run build:dev` (PUBLIC_SITE_ENV=dev) builds dev.seemyhealth.ai. src/lib/site.ts reads the same
// variable inside the pages.
const IS_DEV = process.env.PUBLIC_SITE_ENV === 'dev';
const SITE = IS_DEV ? 'https://dev.seemyhealth.ai' : 'https://www.seemyhealth.ai';

// Dev only: the dev store's ProductVariant ids in place of the real store's in src/data/variants.ts
// (a variant id belongs to one store, and the dev store's cart refuses the other's). The map is
// src/data/dev-store-variant-ids.json, filled by scripts/dev-store-variant-ids.mjs. An id with no dev
// entry is left as it is and named in the build log: that variant's Add to Cart fails on dev.
function devStoreVariantIds() {
  const file = new URL('./src/data/dev-store-variant-ids.json', import.meta.url);
  /** @type {Record<string, { product: string; title: string; dev: string }>} */
  const variants = JSON.parse(readFileSync(file, 'utf8')).variants ?? {};
  const missing = new Set();
  return {
    name: 'smh-dev-store-variant-ids',
    enforce: /** @type {const} */ ('pre'),
    /** @param {string} code @param {string} id */
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/src/data/variants.ts')) return null;
      return code.replace(/gid:\/\/shopify\/ProductVariant\/\d+/g, (gid) => {
        const dev = variants[gid]?.dev;
        if (dev) return dev;
        missing.add(gid);
        return gid;
      });
    },
    buildEnd() {
      if (missing.size === 0) return;
      console.warn(
        `[dev-store-variant-ids] ${missing.size} variant(s) have no dev-store id in ` +
          `src/data/dev-store-variant-ids.json; Add to Cart fails for them on dev. ` +
          `Run scripts/dev-store-variant-ids.mjs with the dev store's Storefront token.`
      );
    },
  };
}

// Dev only: nothing on dev.seemyhealth.ai is indexed. The pages carry a noindex meta
// (Layout.astro); this replaces robots.txt with a disallow-all and adds an X-Robots-Tag header to
// every response Pages serves (images, models and the rest included). No sitemap is built.
function devNoIndex() {
  return {
    name: 'smh-dev-noindex',
    hooks: {
      /** @param {{ dir: URL }} options */
      'astro:build:done': async ({ dir }) => {
        await writeFile(new URL('robots.txt', dir), 'User-agent: *\nDisallow: /\n');
        await writeFile(new URL('_headers', dir), '/*\n  X-Robots-Tag: noindex, nofollow\n');
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: IS_DEV
    ? [react(), devNoIndex()]
    : [
        react(),
        sitemap({
          filter: (page) =>
            ![
              '/privacy/', '/terms/', '/terms/sale/', '/account/', '/account/orders/', '/404/',
            ].some(
              (path) => page.includes(path)
            ),
        }),
      ],

  vite: {
    plugins: IS_DEV ? [tailwindcss(), devStoreVariantIds()] : [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: SITE,
          changeOrigin: true,
        },
      },
    },
  },
});
