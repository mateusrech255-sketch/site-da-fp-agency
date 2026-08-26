const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

// Slugify function
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

// Title Case function
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    if (['e', 'de', 'do', 'da', 'dos', 'das', 'com', 'a', 'o', 'para', 'em', 'no', 'na'].includes(word)) return word;
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

data.courses.forEach(course => {
  if (course.id === 'narrastars-lucas-evandro') {
      course.title = 'Narrastars — Estratégia e Canais Dark';
  } else if (course.id === 'narrastars-priscila-souza') {
      course.title = 'Narrastars — Edição e Narração';
  } else if (course.id === 'tarefas-remuneradas-priscila-souza') {
      course.title = 'Tarefas Remuneradas — Fundamentos';
  } else if (course.id === 'narrastars-lucas-silva') {
      course.title = 'Narrastars — Nichos FTV e Esportes';
  } else if (course.id === 'tarefas-pagas-lucas-silva') {
      course.title = 'Tarefas Pagas — Estrutura de Vídeo';
  }
  
  course.videos.forEach(v => {
    // Fix typos
    v.title = v.title.replace('COMO COLOCAR MARCA D \'AGUA DINAMICA', 'Como Colocar Marca d\'Água Dinâmica');
    v.title = v.title.replace('(FINAL))', '(Final)');
    
    // Fix all caps
    if (v.title === v.title.toUpperCase()) {
        v.title = toTitleCase(v.title);
    }
    
    // Specific fixes for uppercase prefixes
    v.title = v.title.replace(/^AULA\s*(\d+)/i, 'Aula $1 -');
    v.title = v.title.replace(/^AULA(\d+)/i, 'Aula $1 -');
    
    // Fix slugs
    v.slug = slugify(v.title);
    
    // Descriptions
    if (!v.description || v.description.trim() === '') {
        v.description = `Aprenda o passo a passo sobre ${v.title.toLowerCase().replace(/^aula \d+ - /, '')}.`;
    }
  });
});

fs.writeFileSync('src/data/videos.json', JSON.stringify(data, null, 2) + '\n');
console.log('Fixed videos.json!');
