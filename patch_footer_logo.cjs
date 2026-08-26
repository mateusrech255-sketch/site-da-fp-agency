const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.astro', 'utf8');

code = code.replace(
  "import logoUrl from '../assets/fpagency.svg?url';",
  "import Logo from './Logo.astro';"
);

const imgRegex = /<img\s*src=\{logoUrl\}\s*alt=""\s*class="brand-logo"\s*width="46"\s*height="46"\s*loading="lazy"\s*decoding="async"\s*\/>/;

code = code.replace(
  imgRegex,
  '<Logo class="brand-logo" />'
);

fs.writeFileSync('src/components/Footer.astro', code);
console.log("Patched Footer");
