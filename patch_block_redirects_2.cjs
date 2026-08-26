const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const additionalCss = `
  /* Desativa os cliques na barra de titulo superior inteira */
  .video-player-container .vjs-dock-text,
  .video-player-container .vignette-title,
  .video-player-container [class*="vignette-title"],
  .video-player-container [class*="vjs-dock"] {
    pointer-events: none !important;
  }
`;

code = code.replace(
  `pointer-events: none !important;\n    cursor: default !important;\n  }`,
  `pointer-events: none !important;\n    cursor: default !important;\n  }\n${additionalCss}`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched title bar pointer events");
