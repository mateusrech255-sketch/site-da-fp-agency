const fs = require('fs');

let html = '';
const lines = fs.readFileSync('recent_log.json', 'utf8').split('\n');
for (const line of lines.reverse()) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content.includes('Adicione mais uma tutora')) {
       html = data.content;
       break;
    }
  } catch(e) {}
}

const regex = /data-src-mobile="https:\/\/video-meta\.open\.video\/resized-posters\/([a-zA-Z0-9_-]+)\/res640\.webp[^"]*".*?<a href="https:\/\/academy\.fpagency\.com\.br\/v\/([^"]+)"[^>]*>([^<]+)<\/a>/gs;

let match;
const foundVideos = {};
while ((match = regex.exec(html)) !== null) {
  const id = match[1];
  const slug = match[2];
  const title = match[3];
  foundVideos[id] = {
    id,
    slug,
    title: title.trim(),
    description: "",
    thumbnail: `https://video-meta.open.video/resized-posters/${id}/res640.webp`
  };
}

const idsGroup1 = [
  "FXajlSVQ7Pu",
  "xzG4Q9U76Pu",
  "-qi5QTUl64u",
  "wyPyQCoRBPu",
  "tvHGJKgJsru",
  "t8aacehdsru",
  "7DGWIKhYZGu",
  "seiGJfhdsHu"
];

const idsGroup2 = [
  "AvjbdvgsYGu",
  "BCjXJKMttXu",
  "6fHicehZZau"
];

const group1 = idsGroup1.map(id => foundVideos[id]);
const group2 = idsGroup2.map(id => foundVideos[id]);

console.log("Group 1 found:", group1.filter(Boolean).length, "/", idsGroup1.length);
console.log("Group 2 found:", group2.filter(Boolean).length, "/", idsGroup2.length);

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

currentData.courses.push({
  id: "narrastars-priscila-souza",
  title: "Narrastars",
  tutor: "Priscila Souza",
  description: "Aprenda o passo a passo da narração, roteirização e edição com a tutora Priscila Souza.",
  videos: group1
});

currentData.courses.push({
  id: "tarefas-remuneradas-priscila-souza",
  title: "Tarefas Remuneradas",
  tutor: "Priscila Souza",
  description: "Descubra o que são, onde encontrar e como executar Tarefas Remuneradas com eficiência.",
  videos: group2
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(currentData, null, 2) + '\n');
console.log("Added new courses to videos.json!");
