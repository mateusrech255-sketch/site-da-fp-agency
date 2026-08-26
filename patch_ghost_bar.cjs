const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const jsGhost = `
      // Kwai Ghost Progress Bar (Barra visual imune as ocultacoes da Ezoic)
      const ghostProgressContainer = document.createElement('div');
      ghostProgressContainer.className = 'kwai-ghost-progress';
      const ghostProgressFill = document.createElement('div');
      ghostProgressFill.className = 'kwai-ghost-fill';
      ghostProgressContainer.appendChild(ghostProgressFill);
      playerRoot.appendChild(ghostProgressContainer);
`;

const jsUpdate = `
        const updateTimeDisplay = () => {
          timeDisplay.innerText = \`\${formatTime(videoElement.currentTime)} / \${formatTime(videoElement.duration)}\`;
          if (videoElement.duration > 0) {
            const pct = (videoElement.currentTime / videoElement.duration) * 100;
            ghostProgressFill.style.width = \`\${pct}%\`;
          }
        };
`;

// Insert the Ghost elements after timeDisplay
code = code.replace(
  `playerRoot.appendChild(timeDisplay);`,
  `playerRoot.appendChild(timeDisplay);\n${jsGhost}`
);

// Replace the old updateTimeDisplay
code = code.replace(
  `const updateTimeDisplay = () => {
          timeDisplay.innerText = \`\${formatTime(videoElement.currentTime)} / \${formatTime(videoElement.duration)}\`;
        };`,
  jsUpdate
);

const cssGhost = `
  /* O FANTASMA: Barra de Progresso Visual Indestrutivel */
  .kwai-ghost-progress {
    position: absolute;
    bottom: 25px; /* Altura ideal acima dos controles nativos */
    left: 5%;
    width: 90%;
    height: 8px;
    background: rgba(255,255,255,0.3);
    z-index: 1000;
    pointer-events: none; /* Ignora toques para vazar pra barra real */
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .kwai-ghost-fill {
    height: 100%;
    width: 0%;
    background: #fff;
    border-radius: 4px;
    position: relative;
  }
  
  .kwai-ghost-fill:after {
    content: '';
    position: absolute;
    right: -12px;
    top: -4px;
    width: 24px;
    height: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.7);
  }

  .video-player-container.is-kwai-scrubbing .kwai-ghost-progress {
    opacity: 1;
  }

  /* Oculta os fragmentos quebrados da barra nativa durante o scrub */
  .video-player-container.is-kwai-scrubbing .vjs-progress-holder {
    opacity: 0 !important;
  }
`;

code = code.replace(
  `/* Forca a exibicao da barra durante o arrasto */`,
  `${cssGhost}\n  /* Forca a exibicao da barra durante o arrasto */`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched Ghost Bar");
