const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const jsInject = `
      // Anti-Redirect: Bloqueia cliques que levam para fora (open.video ou rotas /v/)
      playerRoot.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor) {
          const href = anchor.href || '';
          if (href.includes('open.video') || href.includes('/v/')) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
      }, true); // Fase de captura (intercepta antes do script da Ezoic)
`;

code = code.replace(
  `let lastTap = 0;`,
  `${jsInject}\n      let lastTap = 0;`
);

const cssInject = `
  /* Impede que logos, titulos e overlays da Ezoic recebam cliques (Anti-Redirect) */
  .video-player-container a,
  .video-player-container .vjs-logo,
  .video-player-container .vignette-logo,
  .video-player-container [class*="logo"] {
    pointer-events: none !important;
    cursor: default !important;
  }
`;

code = code.replace(
  `  /* Oculta o botao de reportar`,
  `${cssInject}\n  /* Oculta o botao de reportar`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched redirects");
