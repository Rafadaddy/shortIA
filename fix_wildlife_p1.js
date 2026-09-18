const fs = require('fs');
let file = 'src/app/naturaleza-salvaje/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace generateIdeas
content = content.replace(/const generateIdeas = async \(\) => \{[\s\S]*?const selectIdeaAndGenerateScript = async/m, 
`const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);
    try {
      const res = await aiFetch("/api/generate-wildlife", { action: "ideas", tone, animalA, animalB });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      showToast("Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async`);

// Fix Paso 1 rendering
content = content.replace(/\{\/\* PASO 1 \*\/\}[\s\S]*?\{\/\* PASO 2 \*\/\}/m, 
`{/* PASO 1 */}
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
        </div>

        {/* PASO 2 */}`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Paso 1 and Ideas API payload');
