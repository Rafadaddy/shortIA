"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, Image as ImageIcon, Loader2, RefreshCw, Wand2, Type, Skull, Swords } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface WildlifeIdea {
  title: string;
  description: string;
}

interface Scene {
  scene_number: number;
  timestamp: string;
  narration: string;
  text_overlay: string;
  visual_concept: string;
  camera_movement: string;
  audio_cues: string;
  image_prompt: string;
  animation_prompt: string;
}

interface WildlifeData {
  title: string;
  music: string;
  hashtags: string[];
  winner_stats: string;
  cta: string;
  scenes: Scene[];
}

const animalsList = [
  "León Africano",
  "Tigre Siberiano",
  "Oso Grizzly",
  "Oso Polar",
  "Gorila Espalda Plateada",
  "Hipopótamo",
  "Rinoceronte Negro",
  "Cocodrilo del Nilo",
  "Anaconda Verde",
  "Dragón de Komodo",
  "Jaguar",
  "Lobo Gris (Alfa)",
  "Hiena Manchada",
  "Tiburón Blanco",
  "Orca (Ballena Asesina)",
  "Águila Harpía",
  "Mamba Negra",
  "Elefante Africano",
  "Búfalo del Cabo",
  "Medusa Avispa de Mar"
];

const tones = [
  "Documental Científico (Serio, NatGeo)",
  "Épico y Cinematográfico (Batalla a muerte)",
  "Dramático y Brutal (Supervivencia cruda)",
  "Gamer / e-Sports (Comentarista emocionado)"
];

export default function NaturalezaSalvajePage() {
    const [animalA, setAnimalA] = useState("");
  const [animalB, setAnimalB] = useState("");
  const [tone, setTone] = useState(tones[0]);

  const [ideas, setIdeas] = useState<WildlifeIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<WildlifeIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<WildlifeData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);

  const generateIdeas = async () => {
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

  const selectIdeaAndGenerateScript = async (idea: WildlifeIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-wildlife", { action: "script_only", selectedIdea: idea, tone });
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
      const res = await aiFetch("/api/generate-wildlife", { action: "improve_script", customScript: scriptText, instruction, tone });
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
      const res = await aiFetch("/api/generate-wildlife", { action: "full_from_script", customScript: scriptText });
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
      const res = await aiFetch("/api/generate-wildlife", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        narration: scene.narration,
        visual_concept: scene.visual_concept,
        existing_image_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt
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

  
  
  const handleGenerateImage = async (sceneIndex: number, prompt: string) => {
    if (generatingImageFor !== null) return;
    setGeneratingImageFor(sceneIndex);
    try {
      let clientApiKey = "";
      try {
        const saved = localStorage.getItem("ai-studio-settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          const google = parsed.providers?.find((p: { id: string; apiKey?: string }) => p.id === "google");
          if (google && google.apiKey) {
            clientApiKey = google.apiKey;
          }
        }
      } catch (e) {}

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16", clientApiKey })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generating image");
      
      setGeneratedImages(prev => ({ ...prev, [sceneIndex]: json.imageBase64 }));
      showToast("Imagen generada con ÒÂ©xito", "success");
    } catch (error: unknown) {
      console.error(error);
      showToast((error instanceof Error ? error.message : "Error al generar la imagen"), "error");
    } finally {
      setGeneratingImageFor(null);
    }
  };
const handleCopyAll = () => {
    if (!data) return;
    let text = `🎬 TÍTULO: ${data.title}\n`;
    text += `🏆 VEREDICTO: ${data.winner_stats}\n`;
    text += `🎵 MÚSICA: ${data.music}\n\n`;
    data.scenes.forEach((s) => {
      text += `⏱️ [${s.timestamp}] ESCENA ${s.scene_number}\n`;
      text += `🎙️ Narración: ${s.narration}\n`;
      text += `🔤 Texto: ${s.text_overlay}\n`;
      text += `🎥 Cámara: ${s.camera_movement}\n`;
      text += `🔊 Sonido: ${s.audio_cues}\n`;
      text += `👁️ Visual: ${s.visual_concept}\n`;
      text += `📸 Prompt Imagen: ${s.image_prompt}\n\n`;
    });
    text += `\n📌 CTA: ${data.cta}\n`;
    if (data.hashtags) text += `🏷️ Hashtags: ${data.hashtags.join(" ")}\n`;
    handleCopy(text, "all");
    showToast("Guion completo copiado", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Skull className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            Naturaleza Salvaje
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Cosas que SOLO pasan en una casa mexicana. Desde las tandas y terrenos hasta el VapoRub y la chancla.
          </p>
        </header>

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
                placeholder="Elige de la lista o escribe el tuyo"
                list="animals-list"
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Animal 2 (Opcional)</label>
              <input
                type="text"
                value={animalB}
                onChange={(e) => setAnimalB(e.target.value)}
                placeholder="Elige de la lista o escribe el tuyo"
                list="animals-list"
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />
              <datalist id="animals-list">
                {animalsList.map(a => <option key={a} value={a} />)}
              </datalist>
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

        {/* IDEAS */}
        {ideas && ideas.length > 0 && !scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-500" />
              Selecciona una Batalla Épica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ideas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => selectIdeaAndGenerateScript(idea)}
                  className="text-left bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-red-500/50 hover:bg-slate-900 transition-all group"
                >
                  <h3 className="text-red-400 font-black text-lg mb-2 group-hover:text-red-300">{idea.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-red-500/20 text-red-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Edición del Guion Salvaje</h2>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="animate-pulse">Calculando mordidas y redactando batalla...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)} className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-red-500 outline-none resize-none leading-relaxed" />
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más brutal y añade detalles sangrientos (sin romper reglas).")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><Type className="w-4 h-4" /> Más Brutal</button>
                  <button onClick={() => improveScript("Añade estadísticas científicas precisas (fuerza de mordida en PSI, peso, velocidad).")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"><RefreshCw className="w-4 h-4" /> Más Científico</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3 */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-red-500/20 text-red-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas Visuales</h2>
            </div>
            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all">
              {isGeneratingVideo ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparando chanclas...</> : <><ImageIcon className="w-5 h-5" /> Generar Prompts Visuales</>}
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
                  <p className="text-red-400 text-sm font-semibold">Guion listo para grabar</p>
                </div>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-red-600/40 transition-colors">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              {/* Scenes */}
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-red-500/50 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-red-900/40 text-red-300 border border-red-800/50 font-bold px-3 py-1 rounded-full text-sm">Escena {scene.scene_number}</span>
                      {scene.timestamp && <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-mono">{scene.timestamp}</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="relative pr-12">
                          <span className="text-xs font-semibold text-slate-500 uppercase">🎙️ Narración</span>
                          <p className="text-red-200/90 text-sm mt-1 italic leading-relaxed">&quot;{scene.narration}&quot;</p>
                          <button onClick={() => handleCopy(scene.narration, `vo_${idx}`)} className="absolute right-0 top-0 text-xs bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-red-300 transition-colors">
                            {copiedStates[`vo_${idx}`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🔤 Texto en Pantalla</span>
                          <p className="text-yellow-400 font-black text-sm mt-1 tracking-wide">{scene.text_overlay}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🎥 Cámara y Movimiento</span>
                          <p className="text-slate-300 text-sm mt-1 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">{scene.camera_movement}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🔊 Diseño Sonoro</span>
                          <p className="text-blue-300 text-sm mt-1 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">{scene.audio_cues}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">👁️ Visual Concept</span>
                      <p className="text-slate-400 text-sm mt-1">{scene.visual_concept}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative flex flex-col">
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
                        <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">{scene.image_prompt}</p>
                        
                        {/* GENERATED IMAGE SECTION */}
                        <div className="mt-auto pt-4 border-t border-slate-800">
                          {generatedImages[idx] ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-950 flex items-center justify-center">
                              <img src={`data:image/jpeg;base64,${generatedImages[idx]}`} alt="Generated scene" className="w-full h-full object-cover" />
                              <a href={`data:image/jpeg;base64,${generatedImages[idx]}`} download={`escena_${scene.scene_number}.jpg`} className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white p-2 rounded-lg hover:bg-black transition-colors text-xs font-bold">Descargar</a>
                            </div>
                          ) : (
                            <button onClick={() => handleGenerateImage(idx, scene.image_prompt)} disabled={generatingImageFor !== null} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                              {generatingImageFor === idx ? <><Loader2 className="w-4 h-4 animate-spin" /> Dibujando...</> : <><ImageIcon className="w-4 h-4" /> Generar Imagen con Google</>}
                            </button>
                          )}
                        </div>
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





