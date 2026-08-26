const fs = require('fs');
let code = fs.readFileSync('src/components/OpenVideoPlayer.astro', 'utf8');

// Update JS for user activity
code = code.replace(
  `playerRoot.classList.add('is-kwai-scrubbing');`,
  `playerRoot.classList.add('is-kwai-scrubbing');\n          playerRoot.classList.remove('vjs-user-inactive');\n          playerRoot.classList.add('vjs-user-active');`
);

// Update CSS for kwai-time-display (Add clamp and white-space)
code = code.replace(
  `font-size: 2.2rem;\n    font-weight: 900;`,
  `font-size: clamp(1.4rem, 6vw, 2.2rem);\n    white-space: nowrap;\n    font-weight: 900;`
);

// Move the display a bit lower (closer to the progress bar)
code = code.replace(
  `bottom: 80px;`,
  `bottom: 50px;`
);

// Enhance the force-show CSS for control bar and progress control
code = code.replace(
  `  .video-player-container.is-kwai-scrubbing .vjs-control-bar {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
  }`,
  `  .video-player-container.is-kwai-scrubbing .vjs-control-bar,
  .video-player-container.is-kwai-scrubbing .vjs-progress-control {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    transform: none !important;
  }`
);

fs.writeFileSync('src/components/OpenVideoPlayer.astro', code);
console.log("Patched Kwai fixes");
