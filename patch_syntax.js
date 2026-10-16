const fs = require('fs');

let content = fs.readFileSync('src/app/cuerpo-humano/page.tsx', 'utf8');
content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/app/cuerpo-humano/page.tsx', content, 'utf8');
console.log('Fixed syntax error');
