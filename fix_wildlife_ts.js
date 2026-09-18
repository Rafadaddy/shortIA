const fs = require('fs');
let file = 'src/app/naturaleza-salvaje/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{ mode: "full_from_script", current_script: scriptText, visualStyle, sceneCount, duration \}/g, '{ action: "full_from_script", customScript: scriptText }');
content = content.replace(/,\s*visualStyle/g, '');

fs.writeFileSync(file, content, 'utf8');
