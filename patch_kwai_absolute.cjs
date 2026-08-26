const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const cssReplace = `
  /* Style the progress bar like Kwai (Floating) */
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
  }
`;

code = code.replace(
  `  /* Style the progress bar like Kwai */
  .video-player-container .vjs-progress-control {
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
  }`,
  cssReplace
);

// We need to remove the margin from vjs-progress-holder so it uses the padding instead
code = code.replace(
  `background: rgba(255,255,255,0.3) !important;
    margin: 0 15px !important;`,
  `background: rgba(255,255,255,0.3) !important;
    width: 100% !important;`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched Kwai absolute timeline");
