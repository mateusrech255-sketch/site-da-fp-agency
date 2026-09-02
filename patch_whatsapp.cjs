const fs = require('fs');
const file = 'src/components/WhatsAppFab.astro';
let content = fs.readFileSync(file, 'utf8');

// wa-fab-close color #64748b -> #475569
content = content.replace(/color: #64748b;/g, 'color: #475569;');

// background #25D366 -> #075E54 (better contrast with white)
content = content.replace(/background: #25D366;/g, 'background: #075E54;');
content = content.replace(/border: 2px solid #25D366;/g, 'border: 2px solid #075E54;');
content = content.replace(/rgba\(37, 211, 102,/g, 'rgba(7, 94, 84,');

fs.writeFileSync(file, content);
