"use client";
import { useState, useRef, useEffect } from "react";
import { Flame, Loader2, Play, Check, Copy, RefreshCw, Wand2, ArrowRight, Type, Image as ImageIcon, Sparkles } from "lucide-react";

interface Scene {
  scene_number: number;
  narration: string;
  visual_concept: string;
  image_prompt: string;
  animation_prompt: string;
  duration: string;
}

interface VideoData {
  title: string;
  full_narration: string;
  scenes: Scene[];
  caption: string;
  music_recommendation: string;
  hashtags: string[];
}

interface MotivationalIdea {
  title: string;
  hook: string;
  focus: string;
}

const motivationalNiches = [
  "Desarrollo personal y superación", "Disciplina y hábitos diarios", "Superar el miedo al fracaso",
  "Salud mental y autoestima", "Éxito financiero y mentalidad", "Relaciones y amor propio",
  "Productividad y enfoque", "Cambios de vida y transformation", "Resiliencia después del dolor",
  "Propósito de vida y significado", "Estudios y aprendizaje", "Fitness y fuerza mental",
  "Soledad y fortaleza interior", "Tiempo y arrepentimiento",
];

const toneOptions = [
  "Emotivo y Profundo", "Crudo y Directo (Verdades incómodas)", "Épico y Heroico",
  "Reflexivo y Filosófico", "Agresivo y Desafiante (Estilo Gym)",
];

const styleOptions = [
  "Cinemático Oscuro", "Paisajes Épicos", "Urbano / Calle", "Minimalista", 
  "Natural / Bosque", "Noir / B&W", "Colorido / Vibrante", "IA decida el mejor estilo"
];

const durationOptions = ["5 Segundos", "10 Segundos", "15 Segundos", "20 Segundos"];

export default function MotivationalVideos() {
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState(toneOptions[0]);
  const [style, setStyle] = useState(styleOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [sceneCount, setSceneCount] = useState<number>(5);

  const [ideas, setIdeas] = useState<MotivationalIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<MotivationalIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<VideoData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [id]: true });
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const generateIdeas = async () => {
    if (!niche) return;
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);

    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ideas", niche }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar ideas");
      }
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al conectar con la IA");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: MotivationalIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "script_only",
          niche,
          idea: idea.hook,
          tone,
          sceneCount
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar el guion");
      }
      const json = await res.json();
      setScriptText(json.script);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al conectar con la IA");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "improve_script",
          current_script: scriptText,
          instruction
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al modificar el guion");
      }
      const json = await res.json();
      setScriptText(json.script);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al conectar con la IA");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    setData(null);

    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full_from_script",
          current_script: scriptText,
          style,
          duration,
          sceneCount
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar escenas");
      }
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al conectar con la IA");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegenerateScenePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const scene = data.scenes[sceneIndex];
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single_prompt",
          prompt_type: promptType,
          niche,
          style,
          scene_number: scene.scene_number,
          narration: scene.narration,
          existing_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt
        }),
      });
      
      if (!res.ok) throw new Error("Error al regenerar");
      
      const json = await res.json();
      const newData = { ...data };
      if (promptType === "image") {
        newData.scenes[sceneIndex].image_prompt = json.image_prompt;
      } else {
        newData.scenes[sceneIndex].animation_prompt = json.animation_prompt;
      }
      setData(newData);
    } catch (error) {
      console.error(error);
      alert("Error al regenerar el prompt");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    let text = `🎥 TÍTULO: ${data.title}\n\n`;
    text += `🗣️ NARRACIÓN COMPLETA:\n${data.full_narration}\n\n`;
    text += `---\n\n`;
    data.scenes.forEach((s) => {
      text += `🎬 ESCENA ${s.scene_number} (${s.duration})\n`;
      text += `🗣️ Voz: ${s.narration}\n`;
      text += `👁️ Visual: ${s.visual_concept}\n`;
      text += `🎨 Imagen: ${s.image_prompt}\n`;
      text += `✨ Video: ${s.animation_prompt}\n\n`;
    });
    text += `📝 Caption: ${data.caption}\n`;
    text += `🎵 Música: ${data.music_recommendation}\n`;
    text += `# ${data.hashtags?.join(" ") || ""}`;
    handleCopy(text, "all");
  };

  const handleCopyMetadata = () => {
    if (!data) return;
    let text = `🎵 Música: ${data.music_recommendation}\n\n`;
    text += `${data.caption}\n\n`;
    text += data.hashtags ? data.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(" ") : "";
    handleCopy(text, "metadata");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            Generador Avanzado (Paso a Paso)
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            1. Elige una idea. 2. Perfecciona tu guion. 3. Genera escenas y prompts.
          </p>
        </header>

        {/* PASO 1: CONFIGURACIÓN E IDEAS */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-amber-500/20 text-amber-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración e Ideas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nicho / Temática</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                <option value="">Selecciona un nicho...</option>
                {motivationalNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tono Emocional</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Duración por Escena</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Número de Escenas (Define el largo del guion)</label>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <input type="range" min="3" max="12" value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))} className="w-full accent-amber-500" />
                <span className="text-amber-400 font-bold min-w-[2ch]">{sceneCount}</span>
              </div>
            </div>
          </div>

          <button onClick={generateIdeas} disabled={!niche || isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Generando ideas...</> : <><Wand2 className="w-5 h-5" /> Generar 8 Ideas Virales</>}
          </button>

          {ideas && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Selecciona una idea para escribir el guion:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <button key={idx} onClick={() => selectIdeaAndGenerateScript(idea)} disabled={isGeneratingScript} className="text-left bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-amber-500/50 hover:bg-slate-900 transition group disabled:opacity-50">
                    <p className="font-bold text-amber-400 mb-1">{idea.title}</p>
                    <p className="text-sm text-slate-300 mb-2 italic">&quot;{idea.hook}&quot;</p>
                    <p className="text-xs text-slate-500">{idea.focus}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2: GUION NARRATIVO */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-amber-500/20 text-amber-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Edición del Guion</h2>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                <p>Escribiendo un guion poderoso...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-2">Puedes editar el texto a mano o pedirle a la IA que lo mejore.</p>
                <textarea 
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none leading-relaxed"
                />
                
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más largo y detallado")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Más largo
                  </button>
                  <button onClick={() => improveScript("Hazlo más corto y ve directo al grano")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Más corto
                  </button>
                  <button onClick={() => improveScript("Reescríbelo con un enfoque totalmente distinto pero manteniendo el tema")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Cambiar Enfoque
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: ESCENAS Y PROMPTS */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-amber-500/20 text-amber-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas Visuales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Estilo Visual</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                  {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isGeneratingVideo ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando Escenas y Prompts...</> : <><ImageIcon className="w-5 h-5" /> Dividir Guion y Generar Prompts</>}
            </button>
          </div>
        )}

        {/* PASO 4: RESULTADO FINAL */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/60 pb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{data.title}</h2>
                  <p className="text-slate-400 flex items-center gap-2"><Play className="w-4 h-4 text-amber-500" /> Listo para producir</p>
                </div>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 py-2 px-4 rounded-xl text-sm font-semibold transition-colors">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-sm">Escena {scene.scene_number}</span>
                      <span className="text-slate-500 text-xs">{scene.duration}</span>
                    </div>
                    <div className="mb-4 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Narración de esta escena</span>
                          <p className="text-amber-200/90 text-sm font-medium mt-1 italic">&quot;{scene.narration}&quot;</p>
                        </div>
                        <button onClick={() => handleCopy(scene.narration, `narration_${idx}`)} className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-amber-300 ml-2 shrink-0">
                          {copiedStates[`narration_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="border-l-2 border-purple-500/50 pl-3 mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">En Pantalla</span>
                      <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-pink-400 uppercase">Prompt Imagen</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)} className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300">
                              {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{scene.image_prompt}</p>
                      </div>
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-400 uppercase">Prompt Animación</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleCopy(scene.animation_prompt, `anim_${idx}`)} className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300">
                              {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{scene.animation_prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 mt-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Datos de Publicación</h3>
              <button onClick={handleCopyMetadata} className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors">
                {copiedStates['metadata'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Textos (Caption + Música)</>}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 block">🎵 Música Sugerida</span>
                <p className="text-sm text-slate-300 italic">&quot;{data.music_recommendation}&quot;</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 block">📝 Caption</span>
                <p className="text-slate-300 text-sm">{data.caption}</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block"># Hashtags</span>
                <p className="text-slate-300 text-sm">{data.hashtags?.join(" ")}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
