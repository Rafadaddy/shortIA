const fs = require('fs');

// 1. Update page.tsx
const pageFile = 'src/app/videos-motivacionales/page.tsx';
let page = fs.readFileSync(pageFile, 'utf-8');

page = page.replace(
  /const \[sceneCount, setSceneCount\] = useState\(5\);/,
  'const [sceneCount, setSceneCount] = useState(5);\n  const [duration, setDuration] = useState("40 Segundos");'
);

// update handleGenerate
page = page.replace(
  /prompt_type: "animation"\n\s*\}\);/,
  'prompt_type: "animation", duration });'
);
page = page.replace(
  /prompt_type: "image"\n\s*\}\);/,
  'prompt_type: "image", duration });'
);
page = page.replace(
  /const res = await aiFetch\("\/api\/generate-motivational", \{\n\s*niche,\n\s*idea: finalIdea,\n\s*tone,\n\s*style: visualStyle,\n\s*sceneCount\n\s*\}\);/g,
  `const res = await aiFetch("/api/generate-motivational", {
        niche,
        idea: finalIdea,
        tone,
        style: visualStyle,
        sceneCount,
        duration
      });`
);
page = page.replace(
  /const res = await aiFetch\("\/api\/generate-motivational", \{ mode: "ideas", niche \}\);/g,
  'const res = await aiFetch("/api/generate-motivational", { mode: "ideas", niche });'
); // Ensure ideas mode is untouched if it was matched wrongly

// Add the UI
const durationSelect = `
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Duración Objetivo</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
                >
                  <option value="40 Segundos">~40 Segundos (Corto)</option>
                  <option value="1 Minuto">1 Minuto</option>
                  <option value="3 Minutos">3 Minutos</option>
                  <option value="5 Minutos">5 Minutos</option>
                  <option value="10 Minutos">10 Minutos</option>
                </select>
              </div>
`;

// Insert after sceneCount block
// </div>
// <div className="space-y-2">
// <label ...>Escenas:
// <input ...>
page = page.replace(
  /                <\/div>\n              <\/div>\n\n              <div className="flex flex-col sm:flex-row gap-4">/,
  `                </div>\n              </div>\n${durationSelect}\n\n              <div className="flex flex-col sm:flex-row gap-4">`
);

fs.writeFileSync(pageFile, page, 'utf-8');
console.log('Updated page.tsx');


// 2. Update route.ts
const routeFile = 'src/app/api/generate-motivational/route.ts';
let route = fs.readFileSync(routeFile, 'utf-8');

// I previously forced it to `${count * 10} segundos`.
// I will change it to use the selected duration, but explain to the LLM how many words are needed.
route = route.replace(
  /const requestedDuration = duration \|\| `\$\{count \* 10\} segundos`;/g,
  'const requestedDuration = duration || "40 Segundos";'
);

const newRules = `REGLAS DE ORO:
- NO uses frases genéricas como "tú puedes" o "nunca te rindas"
- SÍ usa datos reales, comparaciones impactantes o situaciones que todos sienten
- El tono debe ser DIRECTO, como un amigo hablándote con verdad
- LONGITUD OBLIGATORIA: La duración de este video debe ser de \${requestedDuration}. 
  * Si es 40 segundos o 1 Minuto: Escribe un guion corto (~150 palabras).
  * Si es 3 Minutos: Escribe un guion detallado (~450 palabras).
  * Si es 5 Minutos: Escribe un guion extenso (~750 palabras).
  * Si es 10 Minutos: Escribe un guion MUY LARGO, tipo documental (~1500 palabras). ¡Expándete muchísimo!
  * Divide equitativamente estas palabras entre tus \${count} escenas. ¡Cada escena debe ser lo suficientemente larga para cubrir su tiempo en pantalla!
- Usa pausas naturales marcadas con "..."`;

route = route.replace(
  /REGLAS DE ORO:[\s\S]*?- Usa pausas naturales marcadas con "\.\.\."/g,
  newRules
);

fs.writeFileSync(routeFile, route, 'utf-8');
console.log('Updated route.ts');
