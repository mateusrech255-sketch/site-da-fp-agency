const fs = require('fs');
const file = 'astro.config.mjs';
let content = fs.readFileSync(file, 'utf8');

const pluginCode = `
    {
      name: 'font-display-swap',
      enforce: 'post',
      generateBundle(options, bundle) {
        for (const fileName of Object.keys(bundle)) {
          if (fileName.endsWith('.css')) {
            const chunk = bundle[fileName];
            if (chunk.type === 'asset' && typeof chunk.source === 'string') {
               chunk.source = chunk.source.replace(/@font-face\s*{([^}]+)}/g, (match, p1) => {
                 if (!p1.includes('font-display')) {
                   return \`@font-face {\${p1};font-display:swap;}\`;
                 }
                 return match.replace(/font-display\s*:\s*[^;]+;?/, 'font-display:swap;');
               });
            }
          }
        }
      }
    }
`;

content = content.replace(/vite: {/, "vite: {\n    plugins: [" + pluginCode + "],");
fs.writeFileSync(file, content);
