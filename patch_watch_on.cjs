const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const jsInject = `
        // Remove a marca d'agua "Watch on..." caçando pelo texto
        playerRoot.querySelectorAll('a, div, span, button').forEach(el => {
          if (el.textContent && el.textContent.includes('Watch on ')) {
            if (el.innerText && el.innerText.length < 50) {
              el.style.display = 'none';
            }
          }
        });
`;

code = code.replace(
  `element.classList.remove('vjs-share', 'vjs-videojs-share');
        });`,
  `element.classList.remove('vjs-share', 'vjs-videojs-share');
        });\n${jsInject}`
);

const cssInject = `
  /* Oculta marcas d'agua e botoes "Watch on" conhecidos */
  .video-player-container .vjs-watermark,
  .video-player-container .ez-watermark,
  .video-player-container .vignette-watermark,
  .video-player-container [class*="watermark"],
  .video-player-container [class*="branding"],
  .video-player-container [class*="watch-on"] {
    display: none !important;
  }
`;

code = code.replace(
  `  /* O FANTASMA: Barra de Progresso Visual Indestrutivel */`,
  `${cssInject}\n  /* O FANTASMA: Barra de Progresso Visual Indestrutivel */`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched Watch on removal");
