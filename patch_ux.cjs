const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

const jsInject = `
      // UX Improvement: Double tap to seek (Rewind/Forward)
      let lastTap = 0;
      playerRoot.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        // Double tap threshold: 300ms
        if (tapLength < 300 && tapLength > 0) {
          const videoElement = playerRoot.querySelector('video');
          if (videoElement) {
            const rect = playerRoot.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            if (x < width * 0.4) {
              // Left side: Rewind 10s
              videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
              showRipple(playerRoot, 'left', '-10s');
            } else if (x > width * 0.6) {
              // Right side: Forward 10s
              videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
              showRipple(playerRoot, 'right', '+10s');
            }
          }
          e.preventDefault();
        }
        lastTap = currentTime;
      });

      // Simple visual feedback for double tap
      function showRipple(container, position, text) {
        const ripple = document.createElement('div');
        ripple.className = \`seek-ripple \${position}\`;
        ripple.innerText = text;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }
`;

code = code.replace(
  `removeShareControls();`,
  `removeShareControls();\n${jsInject}`
);

const cssInject = `
  /* UX Improvement: Thicker timeline for easier scrubbing */
  .video-player-container .vjs-progress-control {
    height: 35px !important;
    display: flex !important;
    align-items: center !important;
  }
  .video-player-container .vjs-progress-holder {
    height: 10px !important;
    border-radius: 5px !important;
  }
  .video-player-container .vjs-play-progress,
  .video-player-container .vjs-load-progress {
    border-radius: 5px !important;
  }
  .video-player-container .vjs-play-progress:before {
    font-size: 1.8em !important;
    top: -0.35em !important;
  }

  /* Ripple effect for double tap */
  .seek-ripple {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 15px 25px;
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: bold;
    pointer-events: none;
    animation: fadeOut 0.5s ease-out;
    z-index: 999;
  }
  .seek-ripple.left { left: 15%; }
  .seek-ripple.right { right: 15%; }
  @keyframes fadeOut {
    0% { opacity: 1; transform: translateY(-50%) scale(0.9); }
    100% { opacity: 0; transform: translateY(-50%) scale(1.2); }
  }
`;

code = code.replace(
  `display: none !important;\n  }\n\n</style>`,
  `display: none !important;\n  }\n${cssInject}\n</style>`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched UX");
