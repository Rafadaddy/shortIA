"use client";
import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Image as ImageIcon, Play, Loader2, RefreshCw, Wand2, Type, DollarSign } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface DuckIdea {
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

interface DuckData {
  title: string;
  thumbnail: Thumbnail;
  scenes: Scene[];
}

export default function PatoFinancieroPage() {
  const [topic, setTopic] = useState("");
  const [sceneCount, setSceneCount] = useState<number>(8);
  const [duration, setDuration] = useState("10 Segundos");

  const [ideas, setIdeas] = useState<DuckIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<DuckIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<DuckData | null>(null);
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
      const res = await aiFetch("/api/generate-duck", { mode: "ideas", topic });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      setIdeas(json.ideas);
    } catch (error) {
      showToast("Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: DuckIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-duck", { mode: "script_only", idea: idea.hook, sceneCount, duration });
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
      const res = await aiFetch("/api/generate-duck", { mode: "improve_script", current_script: scriptText, instruction });
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
      const res = await aiFetch("/api/generate-duck", { mode: "full_from_script", current_script: scriptText, sceneCount, duration });
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
      const res = await aiFetch("/api/generate-duck", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        narration: scene.narration,
        visual_concept: scene.visual_concept,
        existing_image_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt,
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
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
            Pato Financiero
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Generador de guiones y prompts visuales exclusivos para tu canal de finanzas con el Pato Millonario.
          </p>
        </header>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Ideas de Finanzas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-slate-300">Tema Financiero</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej. Ahorro, Inversiones, Trading..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Duración/Escena</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200">
                <option value="5 Segundos">5 Segundos</option>
                <option value="10 Segundos">10 Segundos</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Escenas</label>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <input type="range" min="3" max="15" value={sceneCount} onChange={(e) => setSceneCount(parseInt(e.target.value))} className="w-full accent-emerald-500" />
                <span className="text-emerald-400 font-bold min-w-[2ch]">{sceneCount}</span>
              </div>
            </div>
          </div>

          <button onClick={generateIdeas} disabled={!topic || isGeneratingIdeas} className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2">
            {isGeneratingIdeas ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} Generar Ideas de Finanzas
          </button>

          {ideas && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <button key={idx} onClick={() => selectIdeaAndGenerateScript(idea)} disabled={isGeneratingScript} className="text-left bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-emerald-500/50 hover:bg-slate-900 transition group disabled:opacity-50">
                    <p className="font-bold text-emerald-400 mb-1">{idea.title}</p>
                    <p className="text-sm text-slate-300 mb-2 italic">&quot;{idea.hook}&quot;</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2 */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Guion del Pato Millonario</h2>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" /></div>
            ) : (
              <div className="space-y-4">
                <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)} className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-emerald-500 outline-none resize-none" />
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => improveScript("Hazlo más largo y detallado")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-lg flex justify-center"><Type className="w-4 h-4 mr-2" /> Más largo</button>
                  <button onClick={() => improveScript("Más agresivo mentalidad de tiburón")} disabled={isGeneratingScript} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-lg flex justify-center"><RefreshCw className="w-4 h-4 mr-2" /> Más tiburón</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3 */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Generar Escenas Visuales</h2>
            </div>
            <button onClick={generateFullVideo} disabled={isGeneratingVideo} className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2">
              {isGeneratingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />} Generar Prompts del Pato
            </button>
          </div>
        )}

        {/* PASO 4 */}
        {data && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800/60 pb-6">
                <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 py-2 px-4 rounded-xl text-sm font-semibold">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative">
                    <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full text-sm mb-4 inline-block">Escena {scene.scene_number}</span>
                    <div className="mb-4">
                      <span className="text-xs text-slate-500 uppercase">Narración</span>
                      <p className="text-emerald-200/90 text-sm mt-1">"{scene.narration}"</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <span className="text-xs text-blue-400 uppercase flex items-center gap-1 mb-2"><ImageIcon className="w-3.5 h-3.5" /> Image Prompt</span>
                        <p className="text-xs text-slate-400 font-mono">{scene.image_prompt}</p>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <span className="text-xs text-green-400 uppercase flex items-center gap-1 mb-2"><Sparkles className="w-3.5 h-3.5" /> Animation Prompt</span>
                        <p className="text-xs text-slate-400 font-mono">{scene.animation_prompt}</p>
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
