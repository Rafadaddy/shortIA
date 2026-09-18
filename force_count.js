const fs = require('fs');

let content = fs.readFileSync('src/app/api/generate-motivational/route.ts', 'utf-8');

const oldInstruction = `TU TAREA:
1. Divide este guion en EXACTAMENTE \${count} escenas.
2. Genera los prompts visuales para cada escena.
3. Genera la metadata de publicación.`;

const newInstruction = `TU TAREA MATEMÁTICA ESTRICTA:
1. Divide el guion en EXACTAMENTE \${count} escenas. ¡ESTO ES UNA REGLA MATEMÁTICA INQUEBRANTABLE!
   - Si el guion es muy corto, pon menos palabras por escena, pero NO reduzcas el número de escenas. 
   - El arreglo JSON "scenes" DEBE tener \${count} elementos físicos. Ni uno más, ni uno menos.
2. Genera los prompts visuales para cada escena.
3. Genera la metadata de publicación.`;

content = content.replace(oldInstruction, newInstruction);
fs.writeFileSync('src/app/api/generate-motivational/route.ts', content, 'utf-8');
console.log('Fixed strict counting');
