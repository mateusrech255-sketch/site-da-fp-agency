const fs = require('fs');
let code = fs.readFileSync('src/components/Header.astro', 'utf8');

const badPart = `<a href={\`\${baseUrl}/#jornadas\`}>`;
const index = code.indexOf(badPart);

if (index !== -1) {
  const newPart = `<img
        src={logo.src}
        alt="FP Agency"
        class="fp-header-logo"
        width="46"
        height="46"
        loading="eager"
      />
      <span>FP Agency</span>
    </a>

    <nav class="fp-header-links" id="navLinks" aria-label="Navegação principal">
      <a href={\`\${baseUrl}/#jornadas\`}>`;
      
  code = code.replace(
      `<img
        src={logo.src}
        alt="FP Agency"
        class="fp-header-logo"
      />
      <span>FP Agency</span>
    </a>
      <a href={\`\${baseUrl}/#jornadas\`}>`, 
      newPart
  );
  fs.writeFileSync('src/components/Header.astro', code);
  console.log("Header fixed!");
} else {
  console.log("Could not find bad part!");
}
