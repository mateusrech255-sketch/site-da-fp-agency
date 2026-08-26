const fs = require('fs');
let code = fs.readFileSync('src/pages/treinamento/index.astro', 'utf8');

// Change the map block to a pre-computed array in the frontmatter
const frontmatterEnd = code.indexOf('---', 3);
let newCode = code.slice(0, frontmatterEnd) + `
const filterCourses = courses.map(course => {
  let filterText = course.title;
  if (filterText.includes('Narrastars —')) {
    filterText = filterText.replace('Narrastars —', 'Narrastars');
  } else if (filterText.includes('Tarefas Pagas —')) {
    filterText = filterText.replace('Tarefas Pagas —', 'Tarefas Pagas');
  }
  return { ...course, filterText };
});
` + code.slice(frontmatterEnd);

// Replace the render block
newCode = newCode.replace(
`    <div class="filter-container">
      <button class="filter-btn active" data-filter="all">Todos</button>
      {courses.map(course => {
        let filterText = course.title;
        if (filterText.includes('Narrastars —')) {
          filterText = filterText.replace('Narrastars —', 'Narrastars');
        } else if (filterText.includes('Tarefas Pagas —')) {
          filterText = filterText.replace('Tarefas Pagas —', 'Tarefas Pagas');
        }
        return <button class="filter-btn" data-filter={course.id}>{filterText}</button>;
      })}
    </div>`,
`    <div class="filter-container">
      <button class="filter-btn active" data-filter="all">Todos</button>
      {filterCourses.map(course => (
        <button class="filter-btn" data-filter={course.id}>{course.filterText}</button>
      ))}
    </div>`
);

fs.writeFileSync('src/pages/treinamento/index.astro', newCode);
console.log("Patched!");
