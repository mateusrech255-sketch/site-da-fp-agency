const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

code = code.replace(
  '<script is:inline async src="https://open.video/video.js"></script>',
  '<script is:inline async src="/api/proxy/open.video/video.js"></script>'
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched OpenVideoPlayer.astro");
