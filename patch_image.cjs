const fs = require('fs');
let code = fs.readFileSync('src/pages/treinamento/index.astro', 'utf8');

if (!code.includes("import { Image } from 'astro:assets';")) {
  code = code.replace("import data from '../../data/videos.json';", "import data from '../../data/videos.json';\nimport { Image } from 'astro:assets';");
}

code = code.replace(
  '<img src={video.thumbnail} alt={video.title} loading="lazy" />',
  '<Image src={video.thumbnail} alt={video.title} width={360} height={640} loading="lazy" format="webp" />'
);

fs.writeFileSync('src/pages/treinamento/index.astro', code);
console.log("Patched index.astro");
