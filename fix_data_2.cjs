const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
}

data.courses.forEach(course => {
  course.videos.forEach(v => {
    // Specific fixes
    v.title = v.title.replace(/Como Colocar Marca D &.*?agua Dinamica/i, "Como Colocar Marca d'Água Dinâmica");
    v.title = v.title.replace(/Tutorial Esportes PARTE 2/i, "Tutorial Esportes Parte 2");
    v.title = v.title.replace(/Tutorial Esportes PARTE 3/i, "Tutorial Esportes Parte 3");
    v.title = v.title.replace(/Educação Narra Stars PARTE (\d+)/i, "Educação Narrastars Parte $1");
    v.title = v.title.replace(/Educação Narra Stars PARTE 3 \(Final\)/i, "Educação Narrastars Parte 3 (Final)");
    v.title = v.title.replace(/Aula 02 -, como fazer o roteiro/i, "Aula 2 - Como fazer o roteiro");
    v.title = v.title.replace(/Aula 03 - final Como colocar/i, "Aula 3 - Como colocar");
    v.title = v.title.replace(/Aula 01 - O que/i, "Aula 1 - O que");
    
    // Slugs
    v.slug = slugify(v.title);
  });
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(data, null, 2) + '\n');
console.log('Fixed again!');
