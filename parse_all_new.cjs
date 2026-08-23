const fs = require('fs');
const html = fs.readFileSync('prompt_new.txt', 'utf8');

// Use the /s flag so that dot matches newlines!
const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<a href="https:\/\/academy\.fpagency\.com\.br\/v\/([^"]+)"[^>]*>([^<]+)<\/a>/gs;

let match;
const foundVideos = [];
while ((match = regex.exec(html)) !== null) {
  const id = match[1];
  const slug = match[2];
  const title = match[3];
  foundVideos.push({id, slug, title});
}
console.log("Total found in HTML:", foundVideos.length);

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

const allExistingIds = new Set();
currentData.courses.forEach(course => {
  course.videos.forEach(v => allExistingIds.add(v.id));
});

const missing = [];
for (const vid of foundVideos) {
  if (!allExistingIds.has(vid.id) && !missing.find(v => v.id === vid.id)) {
    missing.push(vid);
  }
}

console.log("Missing videos:");
console.log(JSON.stringify(missing, null, 2));
