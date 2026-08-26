const fs = require('fs');
let svg = fs.readFileSync('src/components/Logo.astro', 'utf8');

// Insert Astro frontmatter
const frontmatter = `---
interface Props {
  class?: string;
  width?: string | number;
  height?: string | number;
}
const { class: className, width = 46, height = 46 } = Astro.props;
---
`;

svg = svg.replace('<svg ', `<svg class={className} width={width} height={height} `);

fs.writeFileSync('src/components/Logo.astro', frontmatter + svg);
console.log("Created Logo.astro");
