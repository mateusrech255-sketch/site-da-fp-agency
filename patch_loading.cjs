const fs = require('fs');
let code = fs.readFileSync('src/pages/treinamento/index.astro', 'utf8');

code = code.replace(
  '{courses.map((course) => (',
  '{courses.map((course, cIdx) => ('
);

code = code.replace(
  '{course.videos.map((video) => (',
  '{course.videos.map((video, vIdx) => ('
);

code = code.replace(
  '<Image src={video.thumbnail} alt={video.title} width={360} height={640} loading="lazy" format="webp" />',
  '<Image src={video.thumbnail} alt={video.title} width={360} height={640} loading={cIdx === 0 && vIdx < 6 ? "eager" : "lazy"} format="webp" />'
);

fs.writeFileSync('src/pages/treinamento/index.astro', code);
console.log("Patched index.astro loading attribute");
