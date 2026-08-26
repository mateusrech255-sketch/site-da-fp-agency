const fs = require('fs');

const files = [
  'src/pages/aviso-legal.astro',
  'src/pages/politica-de-privacidade.astro',
  'src/pages/termos-de-servico.astro'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Remove accent line
  code = code.replace(/<div class="legal-accent-line"><\/div>\s*/g, '');

  // 2. Remove badge
  code = code.replace(/<div class="legal-badge">.*?<\/div>\s*/gs, '');

  // 3. Transform update-chip to plain text
  code = code.replace(/<div class="update-chip">\s*<i class=".*?"><\/i>\s*(Última atualização: [^<]+)\s*<\/div>/gs, '<p class="update-text">$1</p>');

  // 4. Change legal-card to legal-container (or just remove classes making it a card)
  code = code.replace(/class="legal-card"/g, 'class="legal-container"');

  // 5. Replace the entire <style> block with the sober, document-style CSS
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
    max-width: 800px; /* max-w-3xl/4xl equivalent for reading */
    width: 100%;
    position: relative;
  }

  /* Document Header */
  .legal-header {
    margin-bottom: 50px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08); /* border-zinc-800 equivalent */
    padding-bottom: 40px;
  }

  .legal-page h1 {
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 700; /* Less heavy for a document */
    color: #f8fafc;
    letter-spacing: -0.02em;
    margin: 0 0 15px 0;
    line-height: 1.2;
  }

  .update-text {
    font-size: 0.95rem;
    color: #64748b; /* slate-500 */
    margin: 0;
  }

  /* Document Content */
  .legal-content {
    color: #cbd5e1;
    line-height: 1.8; /* leading-relaxed */
  }

  .legal-content h2 {
    font-size: 1.5rem;
    color: #f8fafc;
    margin-top: 50px;
    margin-bottom: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .legal-content h3 {
    font-size: 1.15rem;
    color: #e2e8f0;
    margin-top: 35px;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .legal-content p {
    margin-bottom: 24px;
    color: #94a3b8; /* text-slate-400 */
    font-size: 1.05rem;
    text-align: left; /* No justify, better readability */
  }

  .legal-content ul {
    margin-bottom: 30px;
    padding-left: 20px;
    list-style-type: disc;
    color: #94a3b8;
  }

  .legal-content li {
    margin-bottom: 12px;
    font-size: 1.05rem;
    color: #94a3b8;
    line-height: 1.7;
  }

  .legal-content li strong {
    color: #e2e8f0;
    font-weight: 600;
  }

  .legal-content a {
    color: #cbd5e1;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  .legal-content a:hover {
    color: #fff;
    text-decoration-color: #fff;
  }

  @media (max-width: 768px) {
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
  }
</style>`;
    code = code.substring(0, styleStart) + newStyle;
  }

  fs.writeFileSync(file, code);
  console.log("Patched", file);
});
