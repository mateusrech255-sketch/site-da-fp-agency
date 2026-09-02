const fs = require('fs');
const file = 'astro.config.mjs';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/@font-faces\*/g, '@font-face\\\\s*');
content = content.replace(/font-displays\*:s\*/g, 'font-display\\\\s*:\\\\s*');

fs.writeFileSync(file, content);
