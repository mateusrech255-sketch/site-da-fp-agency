const fs = require('fs');
const lines = fs.readFileSync('prompt_new_log.json', 'utf8').split('\n');
for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
       fs.writeFileSync('prompt_new.txt', data.content);
       console.log('Extracted new prompt!');
       break;
    }
  } catch(e) {}
}
