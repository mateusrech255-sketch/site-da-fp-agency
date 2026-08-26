const fs = require('fs');

const durations = {};

// Helper to extract durations from a raw HTML string
function extract(html) {
  const parts = html.split('https://video-meta.open.video/resized-posters/');
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    const idMatch = p.match(/^([a-zA-Z0-9_-]+)\//);
    if (!idMatch) continue;
    const id = idMatch[1];
    
    // find the next time div
    const timeMatch = p.match(/class="rounded time">([^<]+)<\/div>/);
    if (timeMatch) {
      durations[id] = timeMatch[1].trim();
    }
  }
}

// 1. extract from prompt_new.txt
extract(fs.readFileSync('prompt_new.txt', 'utf8'));

// 2. extract from transcript_full.jsonl (it contains all previous prompts inside JSON)
const logs = fs.readFileSync('/home/fpagency/.gemini/antigravity/brain/cc8fe6e2-b18d-4a5c-9b76-96dbf72988df/.system_generated/logs/transcript_full.jsonl', 'utf8');
// The jsonl file has escaped HTML, so we can just unescape it roughly or split it.
const unescaped = logs.replace(/\\"/g, '"').replace(/\\\//g, '/');
extract(unescaped);

console.log("Total unique durations found:", Object.keys(durations).length);

const data = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));
let updated = 0;
data.courses.forEach(course => {
  course.videos.forEach(v => {
    if (durations[v.id]) {
      v.duration = durations[v.id];
      updated++;
    } else {
      console.log("Missing duration for:", v.id, v.title);
    }
  });
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Updated ${updated} videos in videos.json`);
