const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const additionalCss = `
  /* Oculta o botao de reportar (bandeira) */
  .video-player-container .vjs-control-bar button[title*="Report" i],
  .video-player-container .vjs-control-bar button[title*="Denunciar" i],
  .video-player-container button[class*="report"],
  .video-player-container button[class*="flag"] {
    display: none !important;
  }
`;

code = code.replace(
  `display: none !important;\n  }\n\n  /* UX Improvement`,
  `display: none !important;\n  }\n${additionalCss}\n  /* UX Improvement`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched report CSS addition");
