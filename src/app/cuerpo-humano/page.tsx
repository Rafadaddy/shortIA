"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, Image as ImageIcon, Loader2, RefreshCw, Wand2, Type, Activity, Dna } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface Idea {
  title: string;
  hook: string;
  focus: string;
}

interface Scene {
  scene_number: number;
  narration: string;
  visual_concept: string;
  image_prompt: string;
  animation_prompt: string;
}

interface Thumbnail {
  text: string;
  image_prompt: string;
}

interface CuerpoData {
  title: string;
  thumbnail: Thumbnail;
  scenes: Scene[];
  caption: string;
  hashtags: string[];
}

const defaultTopics = [
  "Lo que pasa en tu cuerpo si dejas el azúcar 30 días",
  "10 cosas increíbles que tu cerebro hace mientras duermes",
  "Así funciona tu sistema digestivo en 60 segundos",
  "El verdadero impacto del café en tus neuronas",
  "¿Por qué tu corazón no se cansa nunca?",
  "La guerra microscópica: Glóbulos blancos vs Virus"
];

export default function CuerpoHumanoPage() {
  const [topic, setTopic] = useState("");
  const [sceneCount, setSceneCount] = useState<number>(6);

  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<CuerpoData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);

    try {
      const res = await aiFetch("/api/generate-cuerpo", { mode: "ideas", topic });
      if (!res.ok) throw new Error("Error al generar ideas");
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      console.error(error);
      showToast("Error al conectar con la IA", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: Idea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-cuerpo", {
        mode: "script_only",
        idea: idea.hook,
        sceneCount
      });
      if (!res.ok) throw new Error("Error al generar el guion");
      const json = await res.json();
      setScriptText(JSON.stringify(json.script, null, 2));
    } catch (error) {
      console.error(error);
      showToast("Error al generar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await aiFetch("/api/generate-cuerpo", {
        mode: "improve_script",
        current_script: scriptText,
        instruction
      });
      if (!res.ok) throw new Error("Error al modificar el guion");
      const json = await res.json();
      setScriptText(JSON.stringify(json.script, null, 2));
    } catch (error) {
      console.error(error);
      showToast("Error al modificar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-cuerpo", {
        mode: "full_from_script",
        current_script: scriptText,
        sceneCount
      });
      if (!res.ok) throw new Error("Error al generar escenas");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      showToast("Error al generar video", "error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const scene = data.scenes[sceneIndex];
      const res = await aiFetch("/api/generate-cuerpo", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        narration: scene.narration,
        existing_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt
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
      showToast("Error al regenerar el prompt", "error");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const handleCopyBulk = (type: "all" | "images" | "animations" | "text") => {
    if (!data) return;
    let text = "";
    
    if (type === "all") {
      text = `🎬 TÍTULO: ${data.title}\n\n`;
      text += `🖼️ IDEA DE MINIATURA:\nTexto: ${data.thumbnail.text}\nPrompt: ${data.thumbnail.image_prompt}\n\n---\n\n`;
      data.scenes.forEach((s) => {
        text += `⏱️ ESCENA ${s.scene_number}\n🗣️ Voz: ${s.narration}\n👀 Concepto: ${s.visual_concept}\n🎨 Image: ${s.image_prompt}\n✨ Anim: ${s.animation_prompt}\n\n`;
      });
      text += `📝 CAPTION:\n${data.caption}\n${data.hashtags?.join(" ") || ""}`;
    } else if (type === "images") {
      text = `Miniatura:\n${data.thumbnail.image_prompt}\n\n`;
      data.scenes.forEach(s => text += `Escena ${s.scene_number}:\n${s.image_prompt}\n\n`);
    } else if (type === "animations") {
      data.scenes.forEach(s => text += `Escena ${s.scene_number}:\n${s.animation_prompt}\n\n`);
    } else if (type === "text") {
      text = `TÍTULO: ${data.title}\n\nVOZ EN OFF:\n`;
      data.scenes.forEach(s => text += `[${s.scene_number}] ${s.narration}\n`);
      text += `\nCAPTION:\n${data.caption}\n${data.hashtags?.join(" ") || ""}`;
    }
    
    handleCopy(text, `bulk_${type}`);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            Cuerpo Humano + Ciencia Visual
            <Dna className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Genera guiones altamente virales y prompts microscópicos hiperrealistas (estilo documental médico) basados en el asombro y el aprendizaje.
          </p>
        </header>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-red-500/20 text-red-500 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración del Nicho Médio/Anatómico</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nicho / Temática de Ciencia</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Qué pasa si dejas el azúcar, Escribe el tuyo..."
                list="topic-list"
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none transition-all"
              />
              <datalist id="topic-list">
                <option value="🎲 Aleatorio / Sorpréndeme con un tema fascinante" />
                <option value="✨ Tema Libre (Borra esto y escribe el tuyo)" />
                {defaultTopics.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Número de Escenas (Duración)</label>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <input type="range" min="3" max="15" value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))} className="w-full accent-red-500" />
                <span className="text-red-400 font-bold min-w-[2ch]">{sceneCount}</span>
              </div>
            </div>
          </div>

          <button onClick={generateIdeas} disabled={isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando descubrimientos virales...</> : <><Wand2 className="w-5 h-5" /> Generar 8 Ideas Virales de Ciencia</>}
          </button>

          {ideas && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-white mb-4">Selecciona un ángulo para tu video:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <button key={idx} onClick={() => selectIdeaAndGenerateScript(idea)} disabled={isGeneratingScript} className="text-left bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-red-500/50 hover:bg-slate-900 transition group disabled:opacity-50 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/0 group-hover:bg-red-500 transition-colors"></div>
                    <p className="font-bold text-slate-200 group-hover:text-red-400 transition-colors text-sm mb-2">{idea.title}</p>
                    <p className="text-xs text-slate-400 mb-2 italic">"{idea.hook}"</p>
                    <p className="text-xs text-slate-500 border-t border-slate-800 pt-2 mt-2">🔬 Visual: {idea.focus}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2 */}
        {scriptText && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-red-500/20 text-red-500 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
                <h2 className="text-xl font-bold text-white">Edición del Guion Científico</h2>
              </div>
              <button onClick={() => handleCopy(scriptText, 'script')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                {copiedStates['script'] ? <><Check className="w-4 h-4 text-emerald-400" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Guion</>}
              </button>
            </div>
            
            {isGeneratingScript ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="animate-pulse">Sintetizando información médica y creando estructura viral...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)} className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-red-500 outline-none resize-none leading-relaxed font-mono text-sm" />
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más largo y detallado médicamente")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><Type className="w-4 h-4" /> Más detalles médicos</button>
                  <button onClick={() => improveScript("Hazlo más crudo, directo y enfocado en el asombro/terror")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><RefreshCw className="w-4 h-4" /> Más Crudo/Impactante</button>
                  <button onClick={() => improveScript("Usa palabras más visuales para la animación 3D")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><ImageIcon className="w-4 h-4" /> Más Visual</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3 */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-red-500/20 text-red-500 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas 3D y Radiografías</h2>
            </div>
            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all">
              {isGeneratingVideo ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando prompts hiperrealistas...</> : <><ImageIcon className="w-5 h-5" /> Generar Prompts Médicos</>}
            </button>
          </div>
        )}

        {/* RESULTADO FINAL */}
        {isGeneratingVideo ? (
           <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-900/30 rounded-3xl border border-slate-800/50">
             <Activity className="w-16 h-16 animate-pulse text-red-500 mb-6" />
             <p className="text-xl font-medium animate-pulse">Renderizando células y vasos sanguíneos...</p>
             <p className="text-sm mt-2 opacity-60">Esto tomará unos segundos...</p>
           </div>
        ) : data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800/60 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                  <p className="text-red-400 text-sm font-semibold">Tema listo para animar</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleCopyBulk('text')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_text'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Type className="w-3.5 h-3.5" />} Textos
                  </button>
                  <button onClick={() => handleCopyBulk('images')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_images'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5" />} Img Prompts
                  </button>
                  <button onClick={() => handleCopyBulk('animations')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_animations'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />} Anim Prompts
                  </button>
                  <button onClick={() => handleCopyBulk('all')} className="flex items-center gap-2 bg-red-600/20 text-red-400 py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-600/40 transition-colors">
                    {copiedStates['bulk_all'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Todo
                  </button>
                </div>
              </div>

              {/* MINIATURA */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-red-500/30 mb-8 relative">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-red-500" /> Idea de Miniatura Anatómica</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase">Texto Sugerido:</span>
                    <p className="text-white font-bold text-lg mt-1">{data.thumbnail.text}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase">Prompt Visual:</span>
                    <p className="text-slate-300 font-mono text-sm mt-1">{data.thumbnail.image_prompt}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-red-500/50 transition-colors"></div>
                    <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full text-sm mb-4 inline-block">Escena {scene.scene_number}</span>
                    
                    <div className="mb-4 relative pr-12">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Narración Cautivadora</span>
                      <p className="text-red-200/90 text-sm mt-1 italic leading-relaxed">"{scene.narration}"</p>
                      <button onClick={() => handleCopy(scene.narration, `vo_${idx}`)} className="absolute right-0 top-0 text-xs bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-red-300 transition-colors">
                        {copiedStates[`vo_${idx}`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Concepto Visual</span>
                      <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-blue-400 uppercase flex items-center gap-1 font-bold"><ImageIcon className="w-3.5 h-3.5" /> Midjourney Prompt</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRegeneratePrompt(idx, "image")} disabled={regeneratingScene !== null} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300 disabled:opacity-50">
                              {regeneratingScene === idx && regeneratingType === "image" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300">
                              {copiedStates[`img_${idx}`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{scene.image_prompt}</p>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-green-400 uppercase flex items-center gap-1 font-bold"><Sparkles className="w-3.5 h-3.5" /> Kling / Runway Prompt</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRegeneratePrompt(idx, "animation")} disabled={regeneratingScene !== null} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-green-300 disabled:opacity-50">
                              {regeneratingScene === idx && regeneratingType === "animation" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleCopy(scene.animation_prompt, `ani_${idx}`)} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-green-300">
                              {copiedStates[`ani_${idx}`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
          </div>
        )}
      </div>
    </main>
  );
}
