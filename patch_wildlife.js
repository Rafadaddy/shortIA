const fs = require('fs');
let content = fs.readFileSync('src/app/naturaleza-salvaje/page.tsx', 'utf8');

// 1. Reemplazar imports
content = content.replace(
  'import { Sparkles, Copy, Check, Image as ImageIcon, Loader2, RefreshCw, Wand2, Type, Skull } from "lucide-react";',
  'import { Sparkles, Copy, Check, Image as ImageIcon, Loader2, RefreshCw, Wand2, Type, Skull, Swords } from "lucide-react";'
);

// 2. Add animal inputs to state
content = content.replace(
  'const [selectedIdea, setSelectedIdea] = useState<any>(null);',
  \const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [animalA, setAnimalA] = useState("");
  const [animalB, setAnimalB] = useState("");
  const [tone, setTone] = useState("Épico / Discovery Channel");\
);

// 3. Fix payload for ideas
content = content.replace(
  /const res = await aiFetch\("\/api\/generate-wildlife", \{\s*action: "ideas"\s*\}\);/,
  'const res = await aiFetch("/api/generate-wildlife", { action: "ideas", tone, animalA, animalB });'
);

// 4. Update Header UI
content = content.replace(
  /<div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">[^]*?<\/div>/m,
  \<div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
            <Swords className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Naturaleza Salvaje (Showdowns)</h1>
            <p className="text-red-400/80 font-medium mt-1">Generador de batallas animales estilo Discovery Channel para YouTube Shorts.</p>
          </div>
        </div>\
);

// 5. Update Paso 1 UI
const paso1UI = \
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-red-500/20 text-red-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configurar el Combate</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Combatiente 1 (Opcional)</label>
              <input value={animalA} onChange={e => setAnimalA(e.target.value)} placeholder="Ej. Hipopótamo, Gorila..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Combatiente 2 (Opcional)</label>
              <input value={animalB} onChange={e => setAnimalB(e.target.value)} placeholder="Ej. Cocodrilo, Oso Grizzly..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
          </div>
          <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-slate-400">Tono del Narrador</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                <option value="Épico / Discovery Channel">Épico / Narrador de Tráiler</option>
                <option value="Casual / Sarcástico / Hood Nature">Casual / Sarcástico (Hood Nature)</option>
                <option value="Gamer / RPG Stats">Gamer / TierZoo (Stats, DPS, Tanque)</option>
              </select>
          </div>
          
          <button 
            onClick={generateIdeas} 
            disabled={isGeneratingIdeas}
            className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando rivales...</> : <><Sparkles className="w-5 h-5" /> Generar Matchups Virales</>}
          </button>
        </div>
\;

content = content.replace(
  /<div className="bg-slate-900\/50 p-6 md:p-8 rounded-3xl border border-slate-800\/60 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<button\s*onClick=\{generateIdeas\}[\s\S]*?<\/button>\s*<\/div>/,
  paso1UI
);

// 6. Fix backend payload for scripts
content = content.replace(
  'action: "script_only", selectedIdea',
  'action: "script_only", tone, selectedIdea'
);

fs.writeFileSync('src/app/naturaleza-salvaje/page.tsx', content);
