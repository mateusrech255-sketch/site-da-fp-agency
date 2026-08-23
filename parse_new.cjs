const fs = require('fs');
const html = fs.readFileSync('prompt_new.txt', 'utf8');

const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<a href="https:\/\/academy\.fpagency\.com\.br\/v\/([^"]+)"[^>]*>([^<]+)<\/a>/g;

let match;
const foundVideos = {};
while ((match = regex.exec(html)) !== null) {
  const id = match[1];
  const slug = match[2];
  const title = match[3];
  if (!foundVideos[id]) {
    foundVideos[id] = { id, slug, title };
  }
}

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

const allExistingIds = new Set();
currentData.courses.forEach(course => {
  course.videos.forEach(v => allExistingIds.add(v.id));
});

const missing = [];
for (const id in foundVideos) {
  if (!allExistingIds.has(id)) {
    missing.push(foundVideos[id]);
  }
}

console.log(JSON.stringify(missing, null, 2));
