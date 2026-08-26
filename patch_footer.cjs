const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.astro', 'utf8');

code = code.replace(
  "import { Image } from 'astro:assets';\nimport logo from '../assets/fpagency.svg';",
  "import logoUrl from '../assets/fpagency.svg?url';"
);

// If the imports were swapped, let's catch both cases
code = code.replace(
  "import logo from '../assets/fpagency.svg';\nimport { Image } from 'astro:assets';",
  "import logoUrl from '../assets/fpagency.svg?url';"
);

const oldImgRegex = /<Image\s*src={logo}\s*alt="FP Agency Logo"\s*class="brand-logo"\s*width={46}\s*height={46}\s*loading="lazy"\s*\/>/g;

code = code.replace(
  oldImgRegex,
  `<img src={logoUrl} alt="" class="brand-logo" width="46" height="46" loading="lazy" decoding="async" />`
);

fs.writeFileSync('src/components/Footer.astro', code);
console.log("Patched Footer.astro!");
