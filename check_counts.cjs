const fs = require('fs');
const html = fs.readFileSync('prompt_new.txt', 'utf8');
const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<a href="https:\/\/academy\.fpagency\.com\.br\/v\/([^"]+)"[^>]*>([^<]+)<\/a>/gs;
let match;
const foundIds = new Set();
while ((match = regex.exec(html)) !== null) {
  foundIds.add(match[1]);
}
console.log("Distinct IDs in HTML:", foundIds.size);

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));
const currentIds = new Set();
currentData.courses.forEach(course => {
  course.videos.forEach(v => currentIds.add(v.id));
});
console.log("Distinct IDs in JSON:", currentIds.size);

const missingInJson = [];
for (const id of foundIds) {
  if (!currentIds.has(id)) missingInJson.push(id);
}
console.log("Missing in JSON:", missingInJson);

const missingInHtml = [];
for (const id of currentIds) {
  if (!foundIds.has(id)) missingInHtml.push(id);
}
console.log("Missing in HTML (but present in JSON):", missingInHtml);
