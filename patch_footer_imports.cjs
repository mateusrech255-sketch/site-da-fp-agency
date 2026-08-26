const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.astro', 'utf8');

code = code.replace(/import \{ Image \} from 'astro:assets';\r?\nimport logo from '\.\.\/assets\/fpagency\.svg';/, "import logoUrl from '../assets/fpagency.svg?url';");

fs.writeFileSync('src/components/Footer.astro', code);
