const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

// Update Mutation Observer
code = code.replace(
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button'`,
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button, .vignette-top-fullscreen, #vignette-top-fullscreen, .vjs-top-fullscreen-control, [class*="vignette-top-expand"], [class*="vignette-top"] [class*="fullscreen"]'`
);

// Update CSS
code = code.replace(
  `.video-player-container #vignette-top-button {`,
  `.video-player-container #vignette-top-button,
  .video-player-container .vignette-top-fullscreen,
  .video-player-container #vignette-top-fullscreen,
  .video-player-container .vjs-top-fullscreen-control,
  .video-player-container [class*="vignette-top-expand"],
  .video-player-container [class*="vignette-top"] [class*="fullscreen"] {`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched fullscreen removal");
