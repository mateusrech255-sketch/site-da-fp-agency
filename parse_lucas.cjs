const fs = require('fs');

let html = '';
const lines = fs.readFileSync('/home/fpagency/.gemini/antigravity/brain/cc8fe6e2-b18d-4a5c-9b76-96dbf72988df/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines.reverse()) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content.includes('Adicione mais um tutor: Lucas Silva')) {
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
  "6fP5lCpItHu", // AULA1
  "sTOORnpctqu", // AULA2
  "68Oil9UIYru", // AULA3
  "s0abJfMAYru", // AULA4
  "BfbXd1gltau", // AULA5
  "sCarJvgkZWu", // MARCA D'AGUA
  "YCbbI1MQYGu", // Educacao 1
  "7naqILM7Yau", // Educacao 2
  "s1jGIvhRZHu", // Educacao 3
  "YmOaIKMRsru", // EXEMPLO EDUCACAO
  "t8PXIvhlsau", // Esportes 1
  "tSiadLgkZHu", // Esportes 2
  "subjJvMRtbu"  // Esportes 3
];

const idsGroup2 = [
  "svb5J0hAsHu", // Aula 01 Tarefas
  "A0bidfNRtqu", // Aula 02 Tarefas
  "71bOd0hQtbu"  // Aula 03 Tarefas
];

const group1 = idsGroup1.map(id => foundVideos[id]);
const group2 = idsGroup2.map(id => foundVideos[id]);

console.log("Group 1 found:", group1.filter(Boolean).length, "/", idsGroup1.length);
if (group1.filter(Boolean).length !== idsGroup1.length) {
    console.log("Missing Group 1 IDs:", idsGroup1.filter(id => !foundVideos[id]));
}
console.log("Group 2 found:", group2.filter(Boolean).length, "/", idsGroup2.length);
if (group2.filter(Boolean).length !== idsGroup2.length) {
    console.log("Missing Group 2 IDs:", idsGroup2.filter(id => !foundVideos[id]));
}

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

currentData.courses.push({
  id: "narrastars-lucas-silva",
  title: "Narrastars",
  tutor: "Lucas Silva",
  description: "Treinamento completo de Narração com foco em nichos virais.",
  videos: group1
});

currentData.courses.push({
  id: "tarefas-pagas-lucas-silva",
  title: "Tarefas Pagas",
  tutor: "Lucas Silva",
  description: "Descubra como estruturar vídeos para Tarefas Pagas com o tutor Lucas Silva.",
  videos: group2
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(currentData, null, 2) + '\n');
console.log("Added new courses to videos.json!");
