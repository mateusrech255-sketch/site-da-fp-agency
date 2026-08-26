const fs = require('fs');
let code = fs.readFileSync('src/components/Header.astro', 'utf8');

code = code.replace(
  "import logo from '../assets/fpagency.svg';",
  "import { Image } from 'astro:assets';\nimport logo from '../assets/fpagency.svg';"
);

code = code.replace(
  `<img
        src={logo.src}
        alt="FP Agency"
        class="fp-header-logo"
        width="46"
        height="46"
        loading="eager"
      />`,
  `<Image
        src={logo}
        alt=""
        class="fp-header-logo"
        width={46}
        height={46}
        loading="eager"
      />`
);

fs.writeFileSync('src/components/Header.astro', code);
console.log("Patched Header.astro");
