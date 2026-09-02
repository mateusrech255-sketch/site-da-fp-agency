import cloudflare from '@astrojs/cloudflare';
import { defineConfig, envField } from 'astro/config';

const site = process.env.SITE_URL || 'https://fpagency.com.br';
const base = process.env.SITE_BASE_PATH ?? '/';

/**
 * Vite plugin: injects font-display:swap into every @font-face block
 * during CSS transformation — before bundling or inlining happens.
 * This works correctly even with inlineStylesheets:'always' and SSR.
 */
const fontDisplaySwapPlugin = {
  name: 'font-display-swap',
  transform(code, id) {
    if (!id.match(/\.(css)(\?|$)/)) return null;
    if (!code.includes('@font-face')) return null;

    const result = code.replace(/@font-face\s*\{([^}]+)\}/g, (match, body) => {
      if (body.includes('font-display')) {
        // Already has font-display — ensure it's set to swap
        return match.replace(/font-display\s*:\s*[^;]+;?/, 'font-display:swap;');
      }
      // No font-display — add swap before closing brace
      return `@font-face{${body.trimEnd()};font-display:swap;}`;
    });

    return result !== code ? { code: result, map: null } : null;
  },
};

export default defineConfig({
  site,
  base,
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  compressHTML: true,
  build: {
    assets: 'assets',
    inlineStylesheets: 'always',
  },
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
  vite: {
    plugins: [fontDisplaySwapPlugin],
    optimizeDeps: {
      exclude: ['astro/env/runtime'],
    },
  },
});
