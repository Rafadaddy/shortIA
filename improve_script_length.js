const fs = require('fs');
let routeCode = fs.readFileSync('src/app/api/generate-motivational/route.ts', 'utf-8');

// Update duration calculation to be dynamic based on scene count
routeCode = routeCode.replace(
  /const requestedDuration = duration \|\| "40 segundos";/,
  'const requestedDuration = duration || `${count * 10} segundos`;'
);

// Update narrative length rules
const newRules = `REGLAS DE ORO:
- NO uses frases genéricas como "tú puedes" o "nunca te rindas"
- SÍ usa datos reales, comparaciones impactantes o situaciones que todos sienten
- El tono debe ser DIRECTO, como un amigo hablándote con verdad
- LONGITUD OBLIGATORIA: Cada escena durará ~10 segundos. Debes escribir entre 30 y 40 palabras POR ESCENA. ¡Un guion corto arruinará el video! Profundiza en cada línea.
- Usa pausas naturales marcadas con "..."`;

routeCode = routeCode.replace(
  /REGLAS DE ORO:[\s\S]*?- Usa N[^\n]*\.\.\."/,
  newRules
);

// Re-write in case encoding failed matching
routeCode = routeCode.replace(
  /REGLAS DE ORO:[\s\S]*?marcadas con "\.\.\."/,
  newRules
);

fs.writeFileSync('src/app/api/generate-motivational/route.ts', routeCode, 'utf-8');
console.log('Updated script length rules.');
