import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

const site = process.env.SITE_URL || 'https://mateusrech255-sketch.github.io';
const isDev = process.env.NODE_ENV === 'development';
const base = process.env.SITE_BASE_PATH ?? (isDev ? '/' : '/site-da-fp-agency');

export default defineConfig({
  site,
  base,
  output: 'server',
  adapter: node({
    mode: 'standalone',
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
});
