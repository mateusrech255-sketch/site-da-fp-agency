const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const additionalCss = `
  /* Oculta botoes de tela cheia que nao estejam na barra inferior */
  .video-player-container .vjs-fullscreen-control:not(.vjs-control-bar *),
  .video-player-container .vjs-dock-right,
  .video-player-container .vjs-top-bar-right {
    display: none !important;
  }
`;

code = code.replace(
  `display: none !important;\n  }`,
  `display: none !important;\n  }\n${additionalCss}`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched fullscreen removal 2");
