"use client";
import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Palette, Image as ImageIcon, Play, Loader2, RefreshCw, Wand2, Type } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface StickmanScene {
  scene_number: number;
  voiceover: string;
  image_prompt: string;
  animation_prompt: string;
}

interface StickmanData {
  title: string;
  base_prompt: string;
  scenes: StickmanScene[];
}

interface Idea {
  title: string;
  hook: string;
  focus: string;
}

export default function StickmanVideoPage() {
  const [topic, setTopic] = useState("");
  const [sceneCount, setSceneCount] = useState<number>(10);

  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<StickmanData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);

  const generateIdeas = async () => {
    if (!topic) return;
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);
    try {
      const res = await aiFetch("/api/generate-stickman", { mode: "ideas", topic });
      if (!res.ok) throw new Error("Error al generar ideas");
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      console.error(error);
      showToast("Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: Idea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-stickman", {
        mode: "script_only",
        idea: idea.hook,
        sceneCount
      });
      if (!res.ok) throw new Error("Error al generar el guion");
      const json = await res.json();
      setScriptText(json.script);
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
      const res = await aiFetch("/api/generate-stickman", {
        mode: "improve_script",
        current_script: scriptText,
        instruction
      });
      if (!res.ok) throw new Error("Error al modificar el guion");
      const json = await res.json();
      setScriptText(json.script);
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
    try {
      const res = await aiFetch("/api/generate-stickman", {
        mode: "full_from_script",
        current_script: scriptText,
        sceneCount
      });
      if (!res.ok) throw new Error("Error al generar escenas");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      showToast("Error al generar escenas", "error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data || regeneratingScene !== null) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const scene = data.scenes[sceneIndex];
      const res = await aiFetch("/api/generate-stickman", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        scene_context: scene.voiceover,
        existing_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt,
        base_prompt: data.base_prompt
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

  const handleCopyAll = () => {
    if (!data) return;
    let text = `🎥 TÍTULO: ${data.title}\n\n`;
    text += `🎨 PROMPT BASE PERSONAJE:\n${data.base_prompt}\n\n---\n\n`;
    data.scenes.forEach((s) => {
      text += `🎬 ESCENA ${s.scene_number}\n`;
      text += `🗣️ Voz: ${s.voiceover}\n`;
      text += `🎨 Imagen: ${s.image_prompt}\n`;
      text += `✨ Animación: ${s.animation_prompt}\n\n`;
    });
    handleCopy(text, "all");
    showToast("Guion completo copiado", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <PlaySquare className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            Stickman YouTube (Wizard)
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Crea videos animados explicativos paso a paso con máxima retención.
          </p>
        </header>

        {/* PASO 1: IDEAS */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración e Ideas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tema del Video</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Por qué procrastinamos, Cómo funciona la dopamina..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Número de Escenas (Define el largo del guion)</label>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <input type="range" min="3" max="15" value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))} className="w-full accent-purple-500" />
                <span className="text-purple-400 font-bold min-w-[2ch]">{sceneCount}</span>
              </div>
            </div>
          </div>

          <button onClick={generateIdeas} disabled={!topic || isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Pensando ideas...</> : <><Wand2 className="w-5 h-5" /> Generar 8 Ideas Virales</>}
          </button>

          {ideas && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Selecciona una idea para escribir el guion:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <button key={idx} onClick={() => selectIdeaAndGenerateScript(idea)} disabled={isGeneratingScript} className="text-left bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-purple-500/50 hover:bg-slate-900 transition group disabled:opacity-50">
                    <p className="font-bold text-purple-400 mb-1">{idea.title}</p>
                    <p className="text-sm text-slate-300 mb-2 italic">&quot;{idea.hook}&quot;</p>
                    <p className="text-xs text-slate-500">{idea.focus}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2: GUION */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Edición del Guion</h2>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p>Escribiendo un guion educativo y dinámico...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none leading-relaxed"
                />
                
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más largo y detallado")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Más largo
                  </button>
                  <button onClick={() => improveScript("Hazlo más corto y ve directo al grano")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Más corto
                  </button>
                  <button onClick={() => improveScript("Hazlo más gracioso y casual")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Hacerlo casual
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
              <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas Visuales</h2>
            </div>

            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isGeneratingVideo ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando Escenas y Prompts...</> : <><ImageIcon className="w-5 h-5" /> Dividir Guion y Generar Prompts Visuales</>}
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
                  <p className="text-slate-400 flex items-center gap-2"><Play className="w-4 h-4 text-purple-500" /> Listo para producir</p>
                </div>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Guion Completo</>}
                </button>
              </div>

              {/* Character Base Prompt Section */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/30 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" /> Character Base Prompt
                  </h3>
                  <button
                    onClick={() => { handleCopy(data.base_prompt, 'base_prompt'); showToast("Base prompt copiado", "success"); }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedStates['base_prompt'] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar
                  </button>
                </div>
                <p className="text-sm text-slate-300 font-mono leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  {data.base_prompt}
                </p>
              </div>

              {/* Scenes */}
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-purple-500/50 transition-colors duration-300"></div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full text-sm">
                        Escena {scene.scene_number}
                      </span>
                    </div>

                    <div className="mb-4 relative">
                      <div className="flex justify-between items-start">
                        <div className="pr-12">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Voiceover</span>
                          <p className="text-purple-200/90 text-sm font-medium mt-1 italic leading-relaxed">
                            "{scene.voiceover}"
                          </p>
                        </div>
                        <button
                          onClick={() => { handleCopy(scene.voiceover, `vo_${idx}`); showToast("Voz copiada", "success"); }}
                          className="absolute right-0 top-0 text-xs bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-purple-300 transition-colors"
                        >
                          {copiedStates[`vo_${idx}`] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Prompt */}
                      <div className="bg-slate-900 rounded-xl border border-slate-800/80 p-4 relative group/prompt">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Image Prompt
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "image")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300 transition-colors disabled:opacity-50"
                              title="Regenerar prompt"
                            >
                              {regeneratingScene === idx && regeneratingType === "image" ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => { handleCopy(scene.image_prompt, `img_${idx}`); showToast("Prompt copiado", "success"); }}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300 transition-colors"
                              title="Copiar prompt"
                            >
                              {copiedStates[`img_${idx}`] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          {scene.image_prompt}
                        </p>
                      </div>

                      {/* Animation Prompt */}
                      <div className="bg-slate-900 rounded-xl border border-slate-800/80 p-4 relative group/prompt">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Animation Prompt
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "animation")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300 transition-colors disabled:opacity-50"
                              title="Regenerar prompt"
                            >
                              {regeneratingScene === idx && regeneratingType === "animation" ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => { handleCopy(scene.animation_prompt, `anim_${idx}`); showToast("Prompt copiado", "success"); }}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300 transition-colors"
                              title="Copiar prompt"
                            >
                              {copiedStates[`anim_${idx}`] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          {scene.animation_prompt}
                        </p>
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
