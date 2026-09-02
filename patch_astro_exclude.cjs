const fs = require('fs');
const file = 'astro.config.mjs';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/exclude: \['astro\/env\/runtime'\]/, "exclude: ['astro/env/runtime', 'astro:assets']");

fs.writeFileSync(file, content);
