const fs = require('fs');

const files = [
  'src/pages/aviso-legal.astro',
  'src/pages/politica-de-privacidade.astro',
  'src/pages/termos-de-servico.astro'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Fix header font size clamp
  code = code.replace(
    /font-size: clamp\(2.2rem, 5vw, 3.5rem\);/g,
    'font-size: clamp(1.8rem, 6vw, 3.5rem);'
  );

  // Fix mobile padding and sizing
  const oldMedia = `@media (max-width: 768px) {
    .section {
      padding: 20px 15px 80px;
    }

    .legal-content h2 { 
      font-size: 1.3rem; 
      margin-top: 40px; 
    }
    
    .legal-content p, .legal-content li {
      font-size: 1rem;
    }
  }`;

  const newMedia = `@media (max-width: 768px) {
    .legal-page {
      padding-top: 100px !important;
    }

    .section {
      padding: 20px 24px 80px; /* Aumentado de 15px para 24px nas laterais */
    }

    .legal-header {
      margin-bottom: 35px;
      padding-bottom: 25px;
    }

    .legal-page h1 {
      font-size: 2rem; /* Menor no celular para nao engolir a tela */
      line-height: 1.15;
    }

    .legal-content h2 { 
      font-size: 1.4rem; 
      margin-top: 40px; 
    }
    
    .legal-content p, .legal-content li {
      font-size: 1.05rem; /* Fonte ligeiramente mais generosa para leitura */
      line-height: 1.65;
    }
  }`;

  code = code.replace(oldMedia, newMedia);

  fs.writeFileSync(file, code);
  console.log("Patched mobile styles for", file);
});
