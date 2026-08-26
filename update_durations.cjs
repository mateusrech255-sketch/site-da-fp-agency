const fs = require('fs');

const html = fs.readFileSync('prompt_new.txt', 'utf8');

// Match the ID and then the next time div
const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<div class="rounded time">([^<]+)<\/div>/gs;

const durations = {};
let match;
while ((match = regex.exec(html)) !== null) {
  durations[match[1]] = match[2].trim();
}

console.log(`Found ${Object.keys(durations).length} durations in prompt_new.txt`);

// Now let's try to extract from the transcript_full.jsonl for the Lucas Silva and Priscila Souza videos which might not be in prompt_new.txt
const logs = fs.readFileSync('/home/fpagency/.gemini/antigravity/brain/cc8fe6e2-b18d-4a5c-9b76-96dbf72988df/.system_generated/logs/transcript_full.jsonl', 'utf8');
const regex2 = /data-src-mobile=\\"https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*\\".*?<div class=\\"rounded time\\">([^<]+)<\\\/div>/gs;

let match2;
let foundInLogs = 0;
while ((match2 = regex2.exec(logs)) !== null) {
  if (!durations[match2[1]]) {
    durations[match2[1]] = match2[2].trim();
    foundInLogs++;
  }
}
console.log(`Found ${foundInLogs} NEW durations in logs`);

const data = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

let updated = 0;
data.courses.forEach(course => {
  course.videos.forEach(v => {
    if (durations[v.id]) {
      v.duration = durations[v.id];
      updated++;
    }
  });
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Updated ${updated} videos in videos.json`);
