const fs = require('fs');
let file = 'src/app/naturaleza-salvaje/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove all old constants and replace with new ones
const newConstants = `const tones = [
  "Documental Científico (Serio, NatGeo)",
  "Épico y Cinematográfico (Batalla a muerte)",
  "Dramático y Brutal (Supervivencia cruda)",
  "Gamer / e-Sports (Comentarista emocionado)"
];

export default function NaturalezaSalvajePage() {`;

content = content.replace(/const mexTopics = \[\s*[\s\S]*?export default function CasasMexicanasPage\(\) \{/m, newConstants);

// 2. Replace state definitions
const newStates = `  const [animalA, setAnimalA] = useState("");
  const [animalB, setAnimalB] = useState("");
  const [tone, setTone] = useState(tones[0]);`;

content = content.replace(/const \[topic, setTopic\] = useState[\s\S]*?const \[duration, setDuration\] = useState\([^)]+\);/m, newStates);

// 3. Replace API payloads
content = content.replace(/\{ mode: "ideas", tone, protagonist, topic, sceneCount, duration \}/g, '{ action: "ideas", tone, animalA, animalB }');
content = content.replace(/\{ mode: "script_only", selectedIdea: idea, tone, protagonist, topic, sceneCount, duration \}/g, '{ action: "script_only", selectedIdea: idea, tone }');
content = content.replace(/\{ mode: "improve_script", current_script: scriptText, instruction, tone \}/g, '{ action: "improve_script", customScript: scriptText, instruction, tone }');
content = content.replace(/\{ mode: "full_from_script", script: scriptText, tone, visualStyle \}/g, '{ action: "full_from_script", customScript: scriptText }');

// 4. Replace Header and Paso 1
const newPaso1 = `{/* HEADER */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
            <Skull className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Naturaleza Salvaje</h1>
            <p className="text-slate-400 font-medium mt-1">Batallas épicas de animales estilo Discovery Channel.</p>
          </div>
        </div>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-red-500/20 text-red-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración de la Batalla</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Animal 1 (Opcional)</label>
              <input
                type="text"
                value={animalA}
                onChange={(e) => setAnimalA(e.target.value)}
                placeholder="Ej. León Africano"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Animal 2 (Opcional)</label>
              <input
                type="text"
                value={animalB}
                onChange={(e) => setAnimalB(e.target.value)}
                placeholder="Ej. Tigre Siberiano"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Tono del Relato</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none">
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <button onClick={generateIdeas} disabled={isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando contrincantes...</> : <><Wand2 className="w-5 h-5" /> Generar Ideas de Batalla</>}
          </button>
        </div>`;

content = content.replace(/\{\/\* HEADER \*\/\}[\s\S]*?\{\/\* PASO 2 \*\/\} \r?\n?\s*\{\(ideas \?\? \[\]\)\.length > 0 && \(/m, newPaso1 + '\n\n        {/* PASO 2 */}\n        {(ideas ?? []).length > 0 && (');

// Try with alternative regex in case ideas is different
if (!content.includes('Generar Ideas de Batalla')) {
  content = content.replace(/\{\/\* HEADER \*\/\}[\s\S]*?\{\/\* PASO 2 \*\/\} \r?\n?\s*\{ideas && ideas\.length > 0 && \(/m, newPaso1 + '\n\n        {/* PASO 2 */}\n        {ideas && ideas.length > 0 && (');
}
if (!content.includes('Generar Ideas de Batalla')) {
  content = content.replace(/\{\/\* HEADER \*\/\}[\s\S]*?\{\/\* PASO 2 \*\/\} \r?\n?\s*\{\(ideas \|\| \[\]\)\.length > 0 && \(/m, newPaso1 + '\n\n        {/* PASO 2 */}\n        {(ideas || []).length > 0 && (');
}

// 5. Replace title for Paso 2
content = content.replace(/Edición del Guion Mexicano/g, "Edición del Guion de Batalla");
content = content.replace(/Generar Ideas Mexicanas/g, "Generar Batallas Épicas");

// 6. Replace buttons
const newButtons = `<div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más brutal y añade detalles sangrientos (sin romper reglas).")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><Type className="w-4 h-4" /> Más Brutal</button>
                  <button onClick={() => improveScript("Añade estadísticas científicas precisas (fuerza de mordida en PSI, peso, velocidad).")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><RefreshCw className="w-4 h-4" /> Más Científico</button>
                </div>`;
content = content.replace(/<div className="flex flex-wrap gap-3">\s*<button onClick=\{\(\) => improveScript\("Hazlo m[^>]+>\s*<button onClick=\{\(\) => improveScript\("Haz que termine en un grito[^>]+>\s*<\/div>/, newButtons);

// Final fallback in case replace fails on the buttons due to mojibake in the replace regex
content = content.replace(/<div className="flex flex-wrap gap-3">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*\{\/\* PASO 3 \*\/\}/m, newButtons + "\n              </div>\n            )}\n          </div>\n        )}\n\n        {/* PASO 3 */}");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed wildlife UI');
