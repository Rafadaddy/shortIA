const fs = require('fs');
let file = 'src/app/api/generate-wildlife/route.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/JSON\.parse\(response\)/g, "JSON.parse(response.replace(/^[\\s\\S]*?```json\\n?|```\\s*$/g, '').trim())");

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed wildlife parsing');
