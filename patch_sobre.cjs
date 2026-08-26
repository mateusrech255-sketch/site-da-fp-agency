const fs = require('fs');

let file = 'src/pages/sobre.astro';
if (!fs.existsSync(file)) process.exit(0);
let code = fs.readFileSync(file, 'utf8');

// HTML Changes
code = code.replace(/<div class="premium-accent-line"><\/div>\s*/g, '');
code = code.replace(/<div class="premium-badge">.*?<\/div>\s*/gs, '');
code = code.replace(/<div class="subtitle-chip">\s*<i class=".*?"><\/i>\s*(.*?)\s*<\/div>/gs, '<p class="update-text">$1</p>');
code = code.replace(/class="premium-card"/g, 'class="legal-container"');
code = code.replace(/class="premium-header"/g, 'class="legal-header"');
code = code.replace(/class="premium-content"/g, 'class="legal-content"');
code = code.replace(/<main class="premium-page">/g, '<main class="legal-page">');

// Re-write the CSS entirely
const styleStart = code.indexOf('<style>');
if (styleStart !== -1) {
  const newStyle = `<style>
  :global(header) {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.8) !important;
    backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .legal-page {
    padding-top: 140px !important;
  }
  
  .section {
    padding: 60px 20px 100px;
    display: flex;
    justify-content: center;
  }

  .legal-container {
    max-width: 800px;
    width: 100%;
    position: relative;
  }

  /* Document Header */
  .legal-header {
    margin-bottom: 50px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 40px;
  }

  .legal-page h1 {
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.02em;
    margin: 0 0 15px 0;
    line-height: 1.2;
  }

  .update-text {
    font-size: 1.05rem;
    color: #94a3b8;
    margin: 0;
    font-style: italic;
  }

  /* Conteúdo e Tipografia */
  .legal-content {
    color: #cbd5e1;
    line-height: 1.8;
  }

  /* Drop Cap */
  .drop-cap::first-letter {
    float: left;
    font-size: 3.5rem;
    line-height: 1;
    font-weight: 900;
    color: #e2e8f0;
    margin-right: 12px;
    margin-top: 5px;
  }

  .legal-content h2 {
    font-size: 1.5rem;
    color: #f8fafc;
    margin-top: 50px;
    margin-bottom: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .legal-content p {
    margin-bottom: 24px;
    color: #94a3b8;
    font-size: 1.05rem;
    text-align: left;
  }

  /* Bloco de Citação */
  .highlight-quote {
    margin: 40px 0;
    padding: 25px 30px;
    background: rgba(255, 255, 255, 0.03);
    border-left: 4px solid #64748b;
    font-size: 1.15rem;
    font-style: italic;
    color: #e2e8f0;
    position: relative;
  }

  .quote-icon {
    display: none;
  }

  /* Grid Missão, Visão e Valores */
  .mvv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 40px 0;
  }

  .mvv-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 25px;
  }

  .mvv-icon {
    font-size: 1.8rem;
    color: #cbd5e1;
    margin-bottom: 15px;
  }

  .mvv-card h3 {
    font-size: 1.25rem;
    color: #f8fafc;
    margin-bottom: 10px;
    margin-top: 0;
  }

  .mvv-card p {
    font-size: 0.95rem;
    text-align: left;
    margin-bottom: 0;
    color: #94a3b8;
  }

  .mvv-card ul {
    padding-left: 20px;
    list-style-type: disc;
    margin-bottom: 0;
    color: #94a3b8;
  }

  .mvv-card li {
    font-size: 0.95rem;
    margin-bottom: 8px;
    color: #94a3b8;
    line-height: 1.5;
  }

  /* Ecossistema List */
  .ecosystem-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .eco-item {
    display: flex;
    gap: 15px;
    background: rgba(255, 255, 255, 0.02);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.03);
  }

  .eco-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
    border-radius: 10px;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .eco-text h4 {
    margin: 0 0 8px 0;
    color: #e2e8f0;
    font-size: 1.1rem;
  }

  .eco-text p {
    margin: 0;
    font-size: 0.95rem;
    text-align: left;
    line-height: 1.5;
    color: #94a3b8;
  }

  /* Lista de Diferenciais */
  .differentiators-list {
    margin-bottom: 30px;
    padding-left: 20px;
    list-style-type: disc;
    color: #94a3b8;
  }

  .differentiators-list li {
    margin-bottom: 12px;
    font-size: 1.05rem;
    color: #94a3b8;
    line-height: 1.6;
  }

  .differentiators-list li strong {
    color: #e2e8f0;
  }

  /* Declaração Final */
  .final-statement {
    text-align: left;
    font-size: 1.2rem;
    color: #cbd5e1;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 768px) {
    .legal-page {
      padding-top: 100px !important;
    }

    .section {
      padding: 20px 24px 80px;
    }
    
    .legal-header {
      margin-bottom: 35px;
      padding-bottom: 25px;
    }

    .legal-page h1 {
      font-size: 2rem;
      line-height: 1.15;
    }

    .legal-content h2 { 
      font-size: 1.4rem; 
      margin-top: 40px; 
    }
    
    .legal-content p, .legal-content li {
      font-size: 1.05rem;
      line-height: 1.65;
    }

    .ecosystem-list {
      grid-template-columns: 1fr;
    }

    .highlight-quote {
      font-size: 1.05rem;
      padding: 20px;
    }
  }
</style>`;
  code = code.substring(0, styleStart) + newStyle;
}

fs.writeFileSync(file, code);
console.log("Patched sobre.astro");
