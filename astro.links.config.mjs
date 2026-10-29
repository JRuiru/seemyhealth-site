// @ts-check
// The links.seemyhealth.ai pages: a second static build of this site, from links/ (srcDir) into
// workers/links/dist, which the links Worker serves as its assets. It shares the site's tokens
// (src/styles/global.css), fonts and components (AppStoreButtons, StoreName), so a links page reads
// as part of seemyhealth.ai, but it is never part of the site's own build or its Pages project.
//
//   npm run links:build   astro build --config astro.links.config.mjs, then the static OG cards
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The few files of the site's public/ a links page needs. Copied rather than given the whole of
// public/ (3D models, videos): one source of truth for each, and a small Worker asset bundle.
const FROM_SITE = [
  'images/favicon.svg',
  'images/favicon-32.png',
  'images/apple-touch-icon.png',
  'media/app-icons/community.riv',
  'media/app-icons/my-health.riv',
  'media/app-icons/providers.riv',
  'media/app-icons/nutrition.riv',
];

/** @type {import('astro').AstroIntegration} */
const copySiteAssets = {
  name: 'links-site-assets',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const file of FROM_SITE) {
        const to = new URL(file, dir);
        mkdirSync(new URL('.', to), { recursive: true });
        cpSync(fileURLToPath(new URL(`./public/${file}`, import.meta.url)), fileURLToPath(to));
      }
    },
  },
};

export default defineConfig({
  site: 'https://links.seemyhealth.ai',
  srcDir: './links',
  publicDir: './links/public',
  outDir: './workers/links/dist',
  // No trailing-slash redirects: the Worker reads each page by its exact asset path.
  build: { format: 'directory', inlineStylesheets: 'never' },
  integrations: [copySiteAssets],
  vite: {
    plugins: [tailwindcss()],
    // Every script and stylesheet a file of its own, so the pages' CSP needs no 'unsafe-inline' for script.
    build: { assetsInlineLimit: 0, sourcemap: false },
  },
});
