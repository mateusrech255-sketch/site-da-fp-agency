const fs = require('fs');
let code = fs.readFileSync('src/components/Logo.astro', 'utf8');
code = code.replace('width="512" height="512"', '');
fs.writeFileSync('src/components/Logo.astro', code);
