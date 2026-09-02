const fs = require('fs');
const file = 'src/components/PrivacyBanner.astro';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/color: #fff;/, 'color: #0f1117;'); // darker text for better contrast on orange

fs.writeFileSync(file, content);
