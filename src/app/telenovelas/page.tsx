"use client";
import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Image as ImageIcon, Loader2, RefreshCw, Wand2, Type, Tv } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface TelenovelaIdea {
  title: string;
  hook: string;
  pain_point: string;
  why_it_works: string;
}

interface Scene {
  scene_number: number;
  narration: string;
  visual_concept: string;
  image_prompt: string;
  animation_prompt: string;
  duration: string;
}

interface Thumbnail {
  text: string;
  image_prompt: string;
}

interface TelenovelaData {
  title: string;
  thumbnail: Thumbnail;
  scenes: Scene[];
}

const novelaTopics = [
  "El CEO Millonario Finge ser Pobre",
  "La Venganza de la Esposa Traicionada",
  "La Suegra Tóxica y Humillante recibe Karma",
  "Romance Tóxico: El Jefe y la Empleada",
  "Descubrí el Secreto de mi Familia Rica",
  "Traición Brutal de mi Mejor Amiga",
  "Me humillaron, pero soy la dueña de todo",
  "Identidad Oculta (La heredera secreta)"
];

const novelaTones = [
  "Suspenso Extremo (Dejan con ganas de más)",
  "Venganza Dulce y Kármica",
  "Drama Tóxico y Posesivo",
  "Humillación y Superioridad (Ego)",
  "Misterio e Intriga Rápida"
];

const novelaStyles = [
  "Cine Moderno Oscuro (Estilo DramaBox/ReelShort)",
  "Lujo y Riqueza Exagerada (Mansiones modernas)",
  "Contraste Alto y Neón Nocturno",
  "Iluminación Fría y Tensa (Oficina de CEO)",
  "Estilo POV TikTok Urbano"
];

export default function TelenovelasPage() {
  const [topic, setTopic] = useState(novelaTopics[0]);
  const [tone, setTone] = useState(novelaTones[0]);
  const [visualStyle, setVisualStyle] = useState(novelaStyles[0]);
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [duration, setDuration] = useState("10 Segundos");

  const [ideas, setIdeas] = useState<TelenovelaIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<TelenovelaIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<TelenovelaData | null>(null);
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
      const res = await aiFetch("/api/generate-telenovela", { mode: "ideas", topic, tone });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      showToast("Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: TelenovelaIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-telenovela", { mode: "script_only", idea: idea.hook, tone, sceneCount, duration });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setScriptText(json.script);
    } catch (error) {
      showToast("Error al generar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await aiFetch("/api/generate-telenovela", { mode: "improve_script", current_script: scriptText, instruction, tone });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setScriptText(json.script);
    } catch (error) {
      showToast("Error al modificar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    try {
      const res = await aiFetch("/api/generate-telenovela", { mode: "full_from_script", current_script: scriptText, visualStyle, sceneCount, duration });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setData(json);
    } catch (error) {
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
      const res = await aiFetch("/api/generate-telenovela", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        narration: scene.narration,
        visual_concept: scene.visual_concept,
        existing_image_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt,
        visualStyle
      });
      
      const json = await res.json();
      const newData = { ...data };
      if (promptType === "image") {
        newData.scenes[sceneIndex].image_prompt = json.image_prompt;
      } else {
        newData.scenes[sceneIndex].animation_prompt = json.animation_prompt;
      }
      setData(newData);
    } catch (error) {
      showToast("Error al regenerar el prompt", "error");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    let text = `🎥 TÍTULO: ${data.title}\n\n`;
    text += `🖼️ MINIATURA:\nTexto: ${data.thumbnail.text}\nPrompt: ${data.thumbnail.image_prompt}\n\n---\n\n`;
    data.scenes.forEach((s) => {
      text += `🎬 ESCENA ${s.scene_number}\n`;
      text += `🗣️ Narración: ${s.narration}\n`;
      text += `👁️ Visual: ${s.visual_concept}\n`;
      text += `🎨 Prompt Imagen: ${s.image_prompt}\n`;
      text += `✨ Prompt Animación: ${s.animation_prompt}\n\n`;
    });
    handleCopy(text, "all");
    showToast("Guion completo copiado", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Tv className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
            Mini-Dramas TikTok
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Generador de contenido viral estilo DramaBox / ReelShort: venganzas, CEOs encubiertos y suegras malvadas.
          </p>
        </header>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración del Drama Moderno</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nicho / Tropo</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-purple-500 outline-none">
                {novelaTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tono del Drama</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-purple-500 outline-none">
                {novelaTones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Estética Visual</label>
              <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-purple-500 outline-none">
                {novelaStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium text-slate-300">Duración/Escena</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                <option value="5 Segundos">5 Segundos</option>
                <option value="10 Segundos">10 Segundos</option>
                <option value="15 Segundos">15 Segundos</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-slate-300">Cantidad de Escenas (Paneles)</label>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <input type="range" min="3" max="15" value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))} className="w-full accent-purple-500" />
                <span className="text-purple-400 font-bold min-w-[2ch]">{sceneCount}</span>
              </div>
            </div>
          </div>

          <button onClick={generateIdeas} disabled={!topic || isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
            {isGeneratingIdeas ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} Generar Ideas de "{topic}"
          </button>

          {ideas && (
            <div className="mt-8 space-y-4 animate-in fade-in">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Selecciona el drama a desarrollar:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <button key={idx} onClick={() => selectIdeaAndGenerateScript(idea)} disabled={isGeneratingScript} className="text-left bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-purple-500/50 hover:bg-slate-900 transition group disabled:opacity-50">
                    <p className="font-bold text-purple-400 mb-1">{idea.title}</p>
                    <p className="text-sm text-slate-300 mb-2 italic">&quot;{idea.hook}&quot;</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2 */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Edición del Guion Dramático</h2>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="animate-pulse">Escribiendo traiciones y secretos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)} className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-purple-500 outline-none resize-none leading-relaxed" />
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más intenso, sube el nivel de traición o venganza")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><Type className="w-4 h-4" /> Más Venganza</button>
                  <button onClick={() => improveScript("Déjalo en un cliffhanger enorme (final abierto)")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><RefreshCw className="w-4 h-4" /> Final de Suspenso</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3 */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas Visuales</h2>
            </div>
            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 transition-all">
              {isGeneratingVideo ? <><Loader2 className="w-5 h-5 animate-spin" /> Rodando escena...</> : <><ImageIcon className="w-5 h-5" /> Generar Prompts Visuales</>}
            </button>
          </div>
        )}

        {/* PASO 4 */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/60 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                  <p className="text-purple-400 text-sm font-semibold">Mini-Serie lista</p>
                </div>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-purple-600/20 text-purple-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-purple-600/40 transition-colors">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              {/* Thumbnail */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/30 mb-8 relative">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-purple-400" /> Idea de Miniatura</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase">Texto Sugerido:</span>
                    <p className="text-white font-bold text-lg mt-1">{data.thumbnail.text}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase">Prompt de Imagen:</span>
                    <p className="text-slate-300 font-mono text-sm mt-1">{data.thumbnail.image_prompt}</p>
                  </div>
                </div>
              </div>

              {/* Scenes */}
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-purple-500/50 transition-colors"></div>
                    <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full text-sm mb-4 inline-block">Escena {scene.scene_number}</span>
                    <div className="mb-4 relative pr-12">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Narración</span>
                      <p className="text-purple-200/90 text-sm mt-1 italic leading-relaxed">"{scene.narration}"</p>
                      <button onClick={() => handleCopy(scene.narration, `vo_${idx}`)} className="absolute right-0 top-0 text-xs bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-purple-300 transition-colors">
                        {copiedStates[`vo_${idx}`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Visual</span>
                      <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-blue-400 uppercase flex items-center gap-1 font-bold"><ImageIcon className="w-3.5 h-3.5" /> Image Prompt</span>
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
                          <span className="text-xs text-green-400 uppercase flex items-center gap-1 font-bold"><Sparkles className="w-3.5 h-3.5" /> Animation Prompt</span>
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
