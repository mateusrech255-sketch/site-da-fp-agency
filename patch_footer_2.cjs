const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.astro', 'utf8');

// replace imports
code = code.replace(/import \{ Image \} from 'astro:assets';\nimport logo from '\.\.\/assets\/fpagency\.svg';/, "import logoUrl from '../assets/fpagency.svg?url';");

// replace Image tag (which spans multiple lines)
const imgTagRegex = /<Image[\s\S]*?src=\{logo\}[\s\S]*?\/>/;
code = code.replace(imgTagRegex, '<img src={logoUrl} alt="" class="brand-logo" width="46" height="46" loading="lazy" decoding="async" />');

fs.writeFileSync('src/components/Footer.astro', code);
console.log("Patched correctly!");
