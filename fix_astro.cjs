const fs = require('fs');
let c = fs.readFileSync('astro.config.mjs', 'utf8');
c = c.replace(/@font-face\\\\s\*/g, '@font-face\\s*');
c = c.replace(/font-display\\\\s\*:\\\\s\*/g, 'font-display\\s*:\\s*');
fs.writeFileSync('astro.config.mjs', c);
