const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

code = code.replace(
  `.video-player-container {\n    width: min(100%, 420px);`,
  `.video-player-container {\n    position: relative;\n    width: min(100%, 420px);`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched position relative");
