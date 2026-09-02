const fs = require('fs');
const file = 'src/components/Header.astro';
let content = fs.readFileSync(file, 'utf8');

// add visibility: hidden to global-search-overlay
content = content.replace(
  /opacity: 0;\n    pointer-events: none;\n  }/,
  "opacity: 0;\n    pointer-events: none;\n    visibility: hidden;\n  }"
);

// add visibility: visible to global-search-overlay.active
content = content.replace(
  /opacity: 1;\n    pointer-events: auto;\n  }/,
  "opacity: 1;\n    pointer-events: auto;\n    visibility: visible;\n  }"
);

fs.writeFileSync(file, content);
