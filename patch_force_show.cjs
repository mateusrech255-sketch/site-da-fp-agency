const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const forceShowCss = `
  /* FORÇA BRUTA: Impede que a Ezoic esconda qualquer elemento da barra durante o arrasto */
  .video-player-container.is-kwai-scrubbing .vjs-control-bar,
  .video-player-container.is-kwai-scrubbing .vjs-progress-control,
  .video-player-container.is-kwai-scrubbing .vjs-progress-holder,
  .video-player-container.is-kwai-scrubbing .vjs-play-progress,
  .video-player-container.vjs-scrubbing .vjs-control-bar,
  .video-player-container.vjs-scrubbing .vjs-progress-control {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    height: 40px !important;
  }

  .video-player-container.is-kwai-scrubbing .vjs-play-progress:before {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
`;

code = code.replace(
  `/* Forca a exibicao da barra durante o arrasto */`,
  `${forceShowCss}\n  /* Forca a exibicao da barra durante o arrasto */`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched brute force show");
