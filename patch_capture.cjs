const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

code = code.replace(
  `progressControl.addEventListener('mousedown', startScrubbing);
        progressControl.addEventListener('touchstart', startScrubbing, {passive: true});`,
  `// Usa capture: true para garantir que a Ezoic nao engula o evento antes de nos
        progressControl.addEventListener('mousedown', startScrubbing, true);
        progressControl.addEventListener('touchstart', startScrubbing, {passive: true, capture: true});`
);

code = code.replace(
  `document.addEventListener('mouseup', stopScrubbing);
        document.addEventListener('touchend', stopScrubbing);`,
  `document.addEventListener('mouseup', stopScrubbing, true);
        document.addEventListener('touchend', stopScrubbing, true);`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched capture phase");
