const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

code = code.replace(
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button, .vignette-top-fullscreen, #vignette-top-fullscreen, .vjs-top-fullscreen-control, [class*="vignette-top-expand"], [class*="vignette-top"] [class*="fullscreen"]'`,
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button, .vignette-top-fullscreen, #vignette-top-fullscreen, .vjs-top-fullscreen-control, [class*="vignette-top-expand"], [class*="vignette-top"] [class*="fullscreen"], .vjs-fullscreen-control:not(.vjs-control-bar *), .vjs-dock-right'`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
