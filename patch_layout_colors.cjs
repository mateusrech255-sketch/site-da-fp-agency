const fs = require('fs');
const file = 'src/layouts/Layout.astro';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/--muted: #64748b;/g, '--muted: #94a3b8;');

fs.writeFileSync(file, content);
