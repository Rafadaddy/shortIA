"use client";
import { aiFetch } from "@/lib/ai-fetch";
import { useState } from "react";
import { Sparkles, Hourglass, Copy, Check, User, FileText, ImageIcon, RefreshCw, Type, Wand2, Music } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

interface TimelineStep {
  step_name: string;
  narration?: string; // Optional since earlier versions might not have saved it
  image_prompt: string;
  video_prompt: string;
}

interface TimelineData {
  title: string;
  script: string;
  reference_prompt: string;
  timeline: TimelineStep[];
  caption?: string;
  music_recommendation?: string;
  hashtags?: string[];
}

export default function TimelinePage() {
  const [topic, setTopic] = useState("");
  const [stepCount, setStepCount] = useState(8);
  
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  
  const [currentScript, setCurrentScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  const [data, setData] = useState<TimelineData | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setData(null);
    setCurrentScript("");

    try {
      const res = await aiFetch("/api/generate-timeline", { mode: "ideas" });
      if (!res.ok) throw new Error("Error");
      const generated = await res.json();
      if (generated.ideas) setIdeas(generated.ideas);
    } catch (error) {
      showToast("Error al generar ideas.", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleGenerateScript = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    // if (!finalTopic) return showToast("Ingresa un tema primero", "error");
    
    setIsGeneratingScript(true);
    setData(null);
    if (selectedTopic) setTopic(selectedTopic);

    try {
      const res = await aiFetch("/api/generate-timeline", { mode: "script", topic: finalTopic, stepCount });
      if (!res.ok) throw new Error("Error");
      const generated = await res.json();
      if (generated.script) {
        setCurrentScript(generated.script);
        setData({ title: generated.title || topic, script: generated.script, reference_prompt: "", timeline: [] });
      }
      showToast("Guion generado. Ahora genera los prompts.", "success");
    } catch (error) {
      showToast("Error al generar guion.", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!currentScript && !data?.script) return showToast("Primero genera el guion", "error");
    
    setIsGeneratingImages(true);

    try {
      const res = await aiFetch("/api/generate-timeline", { 
        mode: "images", 
        topic: topic,
        characterRef: currentScript || data?.script || "",
        stepCount 
      });
      if (!res.ok) throw new Error("Error");
      const generated = await res.json();
      setData(prev => ({
        title: prev?.title || topic,
        script: prev?.script || currentScript,
        reference_prompt: generated.reference_prompt || "",
        timeline: generated.timeline || [],
        caption: generated.caption,
        hashtags: generated.hashtags,
        music_recommendation: generated.music_recommendation
      }));
      showToast("Prompts y Metadata generados.", "success");
    } catch (error) {
      showToast("Error al generar prompts.", "error");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "video" | null>(null);

  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "video") => {
    if (!data || regeneratingScene !== null) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const scene = data.timeline[sceneIndex];
      const res = await aiFetch("/api/generate-timeline", {
        mode: "single_prompt",
        prompt_type: promptType,
        step_name: scene.step_name,
        narration: currentScript, // We pass the whole script to give it context of what happens
        existing_image_prompt: promptType === "image" ? scene.image_prompt : scene.video_prompt,
      });
      
      if (!res.ok) throw new Error("Error regenerando");
      const generated = await res.json();
      
      const newData = { ...data };
      if (promptType === "image") {
        newData.timeline[sceneIndex].image_prompt = generated.image_prompt;
      } else {
        newData.timeline[sceneIndex].video_prompt = generated.video_prompt;
      }
      setData(newData);
      showToast("Prompt regenerado exitosamente", "success");
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
    if (data.caption) text += `📝 CAPTION:\n${data.caption}\n\n`;
    if (data.hashtags) text += `#️⃣ HASHTAGS: ${data.hashtags.join(' ')}\n\n`;
    if (data.music_recommendation) text += `🎵 MÚSICA RECOMENDADA: ${data.music_recommendation}\n\n`;
    
    text += `🎨 PROMPT PERSONAJE REFERENCIA:\n${data.reference_prompt}\n\n---\n\n`;
    data.timeline.forEach((s) => {
      text += `🎬 ${s.step_name}\n`;
      text += `🖼️ Imagen: ${s.image_prompt}\n`;
      text += `✨ Video: ${s.video_prompt}\n\n`;
    });
    handleCopy(text, "all");
    showToast("Guion, metadata y prompts copiados", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Hourglass className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            Líneas Temporales 3D
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Videos hiper-virales sobre deterioro del cuerpo en situaciones extremas (Ej: Cuánta azúcar acabaría contigo).
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tema (o elige una idea abajo)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Cuánta sal puede matarte..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas || isGeneratingScript || isGeneratingImages}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-semibold transition-all border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-2 text-sm"
              >
                {isGeneratingIdeas ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Wand2 className="w-4 h-4" />}
                1. Generar Ideas
              </button>
              <button
                onClick={() => handleGenerateScript()}
                disabled={isGeneratingScript || isGeneratingImages}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {isGeneratingScript ? <FileText className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
                2. Escribir Guion
              </button>
              <button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || !currentScript}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {isGeneratingImages ? <ImageIcon className="w-4 h-4 animate-pulse" /> : <ImageIcon className="w-4 h-4" />}
                3. Crear Prompts
              </button>
            </div>
          </div>

          {/* Ideas */}
          {ideas.length > 0 && !data?.timeline?.length && (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-amber-500/30 animate-in fade-in">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Ideas Altamente Clicables:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ideas.map((ideaItem, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setTopic(ideaItem); handleGenerateScript(ideaItem); }}
                    className="text-left bg-slate-950/50 hover:bg-amber-900/20 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl text-slate-200 transition-all text-sm"
                  >
                    <span className="text-amber-500 font-bold">{idx + 1}.</span> {ideaItem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guion */}
          {data?.script && (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400">{data.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(data!.script, 'script')}
                    className="flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {copiedStates['script'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                  </button>
                </div>
              </div>
              <textarea
                value={currentScript}
                onChange={(e) => setCurrentScript(e.target.value)}
                className="w-full h-64 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-slate-300 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
              />
            </div>
          )}
          
          {/* Metadata */}
          {data?.caption && data?.timeline?.length > 0 && (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 animate-in slide-in-from-bottom-4 space-y-4">
               <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2"><Sparkles className="w-5 h-5"/> Datos de Publicación</h3>
               <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold mb-1">Caption</p>
                   <p className="text-sm text-slate-300">{data.caption}</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold mb-1">Música</p>
                   <p className="text-sm text-slate-300 flex items-center gap-1"><Music className="w-4 h-4"/> {data.music_recommendation}</p>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 uppercase font-bold mb-1">Hashtags</p>
                   <p className="text-sm text-blue-400 font-medium">{data.hashtags?.join(" ")}</p>
                 </div>
               </div>
            </div>
          )}

          {/* Prompts */}
          {data?.timeline && data.timeline.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 mt-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Línea de Tiempo (Prompts)</h3>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 py-2 px-4 rounded-xl text-sm font-bold transition-colors"
                >
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado Todo</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              {data.reference_prompt && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-purple-400 flex items-center gap-2"><User className="w-4 h-4"/> Personaje de Referencia</span>
                    <button
                      onClick={() => handleCopy(data.reference_prompt, 'reference')}
                      className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {copiedStates['reference'] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{data.reference_prompt}</p>
                </div>
              )}

              <div className="space-y-4">
                {data.timeline.map((step, idx) => (
                  <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
                        {step.step_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-400 uppercase">Image Prompt</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "image")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300 disabled:opacity-50"
                            >
                              {regeneratingScene === idx && regeneratingType === "image" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(step.image_prompt, `img_${idx}`)}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300"
                            >
                              {copiedStates[`img_${idx}`] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{step.image_prompt}</p>
                      </div>

                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-400 uppercase">Video Prompt</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "video")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300 disabled:opacity-50"
                            >
                              {regeneratingScene === idx && regeneratingType === "video" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(step.video_prompt, `vid_${idx}`)}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300"
                            >
                              {copiedStates[`vid_${idx}`] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{step.video_prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
