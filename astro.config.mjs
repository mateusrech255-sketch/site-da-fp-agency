import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL || 'https://mateusrech255-sketch.github.io';
const isDev = process.env.NODE_ENV === 'development';
const base = process.env.SITE_BASE_PATH ?? (isDev ? '/' : '/site-da-fp-agency');

export default defineConfig({
  site,
  base,
  output: 'static',
  compressHTML: true,
  build: {
    assets: 'assets',
  },
});
