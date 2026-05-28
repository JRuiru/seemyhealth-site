// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.seemyhealth.ai',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !['/privacy/', '/terms/', '/terms/sale/', '/account/', '/account/orders/', '/404/'].some(
          (path) => page.includes(path)
        ),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'https://www.seemyhealth.ai',
          changeOrigin: true,
        },
      },
    },
  },

  adapter: cloudflare()
});
