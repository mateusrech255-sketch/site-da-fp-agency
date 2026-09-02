const fs = require('fs');
const file = 'astro.config.mjs';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/compressHTML: true,/, "compressHTML: true,\n  build: {\n    assets: 'assets',\n    inlineStylesheets: 'always'\n  },");
content = content.replace(/build: {\n    assets: 'assets',\n  },/, "");

fs.writeFileSync(file, content);
