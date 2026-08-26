const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

// Revert the absolute positioning of vjs-progress-control
const badCss = `  /* Style the progress bar like Kwai (Floating) */
  .video-player-container .vjs-progress-control {
    position: absolute !important;
    bottom: 0px !important;
    left: 0% !important;
    width: 100% !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 15px !important;
    z-index: 50 !important;
  }
  
  .video-player-container .vjs-progress-control:hover,
  .video-player-container.is-kwai-scrubbing .vjs-progress-control {
    opacity: 1 !important;
    visibility: visible !important;
  }`;

const goodCss = `  /* Style the progress bar like Kwai */
  .video-player-container .vjs-progress-control {
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
  }`;

code = code.replace(badCss, goodCss);

// Force the control bar to stay visible during scrub with maximum aggression
code = code.replace(
  `  .video-player-container.is-kwai-scrubbing .vjs-control-bar,
  .video-player-container.is-kwai-scrubbing .vjs-progress-control {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    transform: none !important;
  }`,
  `  /* Forca a exibicao da barra durante o arrasto */
  .video-player-container.is-kwai-scrubbing .vjs-control-bar {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    transform: translateY(0) !important;
    z-index: 999 !important;
  }
  
  /* Mantem o video.js em estado ativo visualmente */
  .video-player-container.is-kwai-scrubbing.vjs-user-inactive .vjs-control-bar {
    opacity: 1 !important;
    visibility: visible !important;
  }`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched absolute timeline revert");
