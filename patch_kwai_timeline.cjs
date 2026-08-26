const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

// 1. Inject the JS for Kwai Time Display
const kwaiJs = `
      // Kwai Style Time Display
      const timeDisplay = document.createElement('div');
      timeDisplay.className = 'kwai-time-display';
      playerRoot.appendChild(timeDisplay);

      const formatTime = (seconds) => {
        if (isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return \`\${m}:\${s}\`;
      };

      const setupKwaiTimeline = () => {
        const videoElement = playerRoot.querySelector('video');
        const progressControl = playerRoot.querySelector('.vjs-progress-control');
        
        if (!videoElement || !progressControl) {
          setTimeout(setupKwaiTimeline, 500);
          return;
        }

        const updateTimeDisplay = () => {
          timeDisplay.innerText = \`\${formatTime(videoElement.currentTime)} / \${formatTime(videoElement.duration)}\`;
        };

        videoElement.addEventListener('timeupdate', updateTimeDisplay);
        videoElement.addEventListener('durationchange', updateTimeDisplay);

        const startScrubbing = () => {
          playerRoot.classList.add('is-kwai-scrubbing');
          updateTimeDisplay();
        };

        const stopScrubbing = () => {
          playerRoot.classList.remove('is-kwai-scrubbing');
        };

        progressControl.addEventListener('mousedown', startScrubbing);
        progressControl.addEventListener('touchstart', startScrubbing, {passive: true});
        
        document.addEventListener('mouseup', stopScrubbing);
        document.addEventListener('touchend', stopScrubbing);
        
        videoElement.addEventListener('seeking', startScrubbing);
        videoElement.addEventListener('seeked', () => { setTimeout(stopScrubbing, 500); });
      };

      setupKwaiTimeline();
`;

// Insert the JS before `let lastTap = 0;`
code = code.replace(
  `let lastTap = 0;`,
  `${kwaiJs}\n      let lastTap = 0;`
);

// 2. Replace the old "Thicker timeline" CSS with the new Kwai CSS
const oldCssStart = `/* UX Improvement: Thicker timeline for easier scrubbing */`;
const oldCssEnd = `/* Ripple effect for double tap */`;

const kwaiCss = `/* Kwai Style Timeline & Time Display */
  .kwai-time-display {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.2rem;
    font-weight: 900;
    color: #fff;
    text-shadow: 0px 4px 15px rgba(0,0,0,0.9), 0px 0px 5px rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 100;
    letter-spacing: 1px;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  .video-player-container.is-kwai-scrubbing .kwai-time-display {
    opacity: 1;
  }

  /* Impede a barra de sumir enquanto arrasta */
  .video-player-container.is-kwai-scrubbing .vjs-control-bar {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
  }

  /* Remove default tooltips from video.js */
  .video-player-container .vjs-time-tooltip,
  .video-player-container .vjs-mouse-display {
    display: none !important;
  }

  /* Style the progress bar like Kwai */
  .video-player-container .vjs-progress-control {
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .video-player-container .vjs-progress-holder {
    height: 8px !important;
    border-radius: 4px !important;
    background: rgba(255,255,255,0.3) !important;
    margin: 0 15px !important;
  }
  
  .video-player-container .vjs-play-progress {
    background: #fff !important;
    border-radius: 4px !important;
  }
  
  .video-player-container .vjs-load-progress {
    background: rgba(255,255,255,0.15) !important;
    border-radius: 4px !important;
  }
  
  /* The Kwai white drag pill */
  .video-player-container .vjs-play-progress:before {
    content: '' !important;
    position: absolute !important;
    right: -12px !important;
    top: -4px !important;
    width: 24px !important;
    height: 16px !important;
    background: #fff !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
  }

  `;

// Regex replace the old CSS block
const regex = new RegExp(oldCssStart.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + oldCssEnd.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'));
code = code.replace(regex, kwaiCss + oldCssEnd);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched Kwai Timeline");
