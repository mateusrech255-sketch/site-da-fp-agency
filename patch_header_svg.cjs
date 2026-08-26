const fs = require('fs');
let code = fs.readFileSync('src/components/Header.astro', 'utf8');

code = code.replace(
  "import { Image } from 'astro:assets';\nimport logo from '../assets/fpagency.svg';",
  "import logoUrl from '../assets/fpagency.svg?url';"
);

code = code.replace(
  `<Image
        src={logo}
        alt=""
        class="fp-header-logo"
        width={46}
        height={46}
        loading="eager"
      />`,
  `<img
        src={logoUrl}
        alt=""
        class="fp-header-logo"
        width="46"
        height="46"
        loading="eager"
        decoding="async"
      />`
);

fs.writeFileSync('src/components/Header.astro', code);
console.log("Patched Header.astro to use ?url");
