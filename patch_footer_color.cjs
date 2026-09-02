const fs = require('fs');
const file = 'src/components/Footer.astro';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/color: #64748b/g, 'color: #94a3b8');

fs.writeFileSync(file, content);
