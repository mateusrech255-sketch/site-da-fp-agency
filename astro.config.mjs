import cloudflare from '@astrojs/cloudflare';
import { defineConfig, envField } from 'astro/config';

const site = process.env.SITE_URL || 'https://fpagency.com.br';
const base = process.env.SITE_BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  compressHTML: true,
  env: {
    schema: {
      INTERNAL_SECRET: envField.string({
        context: 'server',
        access: 'secret',
      }),
      PUBLIC_API_BASE: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://api.fpagency.com.br',
      }),
    },
  },
  build: {
    assets: 'assets',
  },
  vite: {
    optimizeDeps: {
      exclude: ['astro/env/runtime'],
    },
  },
});
