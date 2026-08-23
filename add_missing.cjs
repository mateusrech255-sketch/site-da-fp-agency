const fs = require('fs');

const currentData = JSON.parse(fs.readFileSync('src/data/videos.json', 'utf8'));

const aiCourse = {
  id: "inteligencia-artificial",
  title: "Inteligência Artificial",
  description: "Aprenda a utilizar ferramentas de Inteligência Artificial para otimizar suas produções, roteiros e geração de conteúdo.",
  videos: [
    {
      id: "34HrI9pJBOu",
      slug: "inteligência-artificial-para-geração-de-vídeos",
      title: "Inteligência Artificial para Geração de Vídeos",
      description: "Aprenda a utilizar Inteligência Artificial para gerar vídeos de forma automatizada e eficiente.",
      thumbnail: "https://video-meta.open.video/resized-posters/34HrI9pJBOu/res640.webp"
    },
    {
      id: "wibbJnUt65u",
      slug: "como-criar-vídeos-de-notícias-com-inteligência-artificial",
      title: "Como criar vídeos de notícias com Inteligência Artificial",
      description: "Aprenda o passo a passo para criar vídeos de notícias completos utilizando ferramentas de Inteligência Artificial.",
      thumbnail: "https://video-meta.open.video/resized-posters/wibbJnUt65u/res640.webp"
    },
    {
      id: "2zabJSpY7iu",
      slug: "como-assinar-gratuitamente-o-gemini",
      title: "Como assinar gratuitamente o Gemini",
      description: "Veja como acessar e assinar gratuitamente o Gemini, a avançada Inteligência Artificial do Google.",
      thumbnail: "https://video-meta.open.video/resized-posters/2zabJSpY7iu/res640.webp"
    }
  ]
};

currentData.courses.push(aiCourse);
fs.writeFileSync('src/data/videos.json', JSON.stringify(currentData, null, 2) + '\n');
console.log("Added 3 videos in a new course!");
