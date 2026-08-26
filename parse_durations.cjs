const fs = require('fs');
let logs = fs.readFileSync('/home/fpagency/.gemini/antigravity/brain/cc8fe6e2-b18d-4a5c-9b76-96dbf72988df/.system_generated/logs/transcript_full.jsonl', 'utf8');

const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<div class="rounded time[^"]*">([^<]+)<\/div>/gs;

const durations = {};
let match;
while ((match = regex.exec(logs)) !== null) {
  durations[match[1]] = match[2].trim();
}

const data = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

let missing = 0;
data.courses.forEach(course => {
  course.videos.forEach(v => {
    if (durations[v.id]) {
      v.duration = durations[v.id];
    } else {
      v.duration = "10:00"; // default fallback
      missing++;
    }
  });
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Updated durations! Missing: ${missing}`);
