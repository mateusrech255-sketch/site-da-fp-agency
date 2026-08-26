const fs = require('fs');
let code = fs.readFileSync('src/components/Header.astro', 'utf8');

code = code.replace(
  "import logoUrl from '../assets/fpagency.svg?url';",
  "import Logo from './Logo.astro';"
);

const imgRegex = /<img\s*src=\{logoUrl\}\s*alt=""\s*class="fp-header-logo"\s*width="46"\s*height="46"\s*loading="eager"\s*decoding="async"\s*\/>/;

code = code.replace(
  imgRegex,
  '<Logo class="fp-header-logo" />'
);

fs.writeFileSync('src/components/Header.astro', code);
console.log("Patched Header");
