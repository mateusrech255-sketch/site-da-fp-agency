const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

// Update Mutation Observer
code = code.replace(
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button, .vignette-top-fullscreen, #vignette-top-fullscreen, .vjs-top-fullscreen-control, [class*="vignette-top-expand"], [class*="vignette-top"] [class*="fullscreen"], .vjs-fullscreen-control:not(.vjs-control-bar *), .vjs-dock-right'`,
  `'.vjs-share-control, .vignette-top-share, #vignette-top-button, .vignette-top-fullscreen, #vignette-top-fullscreen, .vjs-top-fullscreen-control, [class*="vignette-top-expand"], [class*="vignette-top"] [class*="fullscreen"], .vjs-fullscreen-control:not(.vjs-control-bar *), .vjs-dock-right, .vignette-report-button, .vjs-report-control, [class*="report"]'`
);

// Update CSS
code = code.replace(
  `.video-player-container .vjs-top-bar-right {`,
  `.video-player-container .vjs-top-bar-right,
  .video-player-container .vignette-report-button,
  .video-player-container .vjs-report-control,
  .video-player-container [class*="report"] {`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched report removal");
