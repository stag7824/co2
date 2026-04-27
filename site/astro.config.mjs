import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// Static, multilingual (DE default, EN under /en) Astro config.
// Build output goes to dist/ — that's what gets uploaded to Strato.
export default defineConfig({
  site: 'https://reduceco2now.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap(), react()],
});
