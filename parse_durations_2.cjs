const fs = require('fs');
let logs = fs.readFileSync('/home/fpagency/.gemini/antigravity/brain/cc8fe6e2-b18d-4a5c-9b76-96dbf72988df/.system_generated/logs/transcript_full.jsonl', 'utf8');

// Some open video HTML has the time in `<span class="time">...</span>` or similar? Let's check for any time-like strings around the video id.
const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?(?:<span class="[^"]*time[^"]*">|<div class="[^"]*time[^"]*">)([0-9:]+)(?:<\/span>|<\/div>)/gs;

const durations = {};
let match;
while ((match = regex.exec(logs)) !== null) {
  durations[match[1]] = match[2].trim();
}
console.log(durations);
