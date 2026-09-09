"use client";

import { useState } from "react";
import { Sparkles, Hourglass, Copy, Check, User, FileText, ImageIcon, RefreshCw } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";


interface TimelineStep {
  step_name: string;
  narration: string;
  image_prompt: string;
  video_prompt: string;
}

interface TimelineData {
  title: string;
  script: string;
  reference_prompt: string;
  timeline: TimelineStep[];
}

export default function TimelinePage() {
  const [topic, setTopic] = useState("");
  const [stepCount, setStepCount] = useState(8);
  const [characterRef, setCharacterRef] = useState("");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "video" | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [data, setData] = useState<TimelineData | null>(null);
  const [currentScript, setCurrentScript] = useState("");
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setData(null);

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
    if (!finalTopic) return showToast("Ingresa un tema primero", "error");
    
    setIsGeneratingScript(true);
    setData(null);
    if (selectedTopic) setTopic(selectedTopic);

    try {
      const res = await aiFetch("/api/generate-timeline", { mode: "script", topic: finalTopic });
      if (!res.ok) throw new Error("Error");
      const generated = await res.json();
      if (generated.script) {
        setCurrentScript(generated.script);
        setData(prev => prev ? { ...prev, title: generated.title || topic, script: generated.script } : { title: generated.title || topic, script: generated.script, reference_prompt: "", timeline: [] });
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
      }));
      showToast("Prompts generados.", "success");
    } catch (error) {
      showToast("Error al generar prompts.", "error");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleRegeneratePrompt = async (idx: number, type: "image" | "video") => {
    if (!data) return;
    
    setRegeneratingIdx(idx);
    setRegeneratingType(type);

    try {
      const step = data.timeline[idx];
      const res = await aiFetch("/api/generate-timeline", { 
        mode: "single_prompt", 
        topic: topic,
        characterRef: data.script,
        step_name: step.step_name,
        narration: step.narration,
        prompt_type: type,
        existing_image_prompt: step.image_prompt,
      });
      if (!res.ok) throw new Error("Error");
      const generated = await res.json();
      
      setData(prev => {
        if (!prev) return prev;
        const newTimeline = [...prev.timeline];
        if (type === "image") {
          newTimeline[idx] = { ...newTimeline[idx], image_prompt: generated.image_prompt };
        } else {
          newTimeline[idx] = { ...newTimeline[idx], video_prompt: generated.video_prompt };
        }
        return { ...prev, timeline: newTimeline };
      });
      showToast(`Prompt de ${type === "image" ? "imagen" : "video"} regenerado.`, "success");
    } catch (error) {
      showToast("Error al regenerar prompt.", "error");
    } finally {
      setRegeneratingIdx(null);
      setRegeneratingType(null);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    let text = `TÍTULO: ${data.title}\n\nGUION:\n${data.script}\n\n--- PROMPTS DE IMAGEN ---\n`;
    data.timeline.forEach(s => {
      text += `\n${s.step_name}:\n${s.image_prompt}\n`;
    });
    text += `\n--- PROMPTS DE VIDEO ---\n`;
    data.timeline.forEach(s => {
      text += `\n${s.step_name}:\n${s.video_prompt}\n`;
    });
    handleCopy(text, 'all');
  };

  const isRegenerating = (idx: number, type: "image" | "video") => {
    return regeneratingIdx === idx && regeneratingType === type;
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Hourglass className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            Líneas Temporales
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Genera guiones completos con prompts de escenas para YouTube Shorts / TikTok.
          </p>
        </header>

        {/* Formulario */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tema del Video</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. ¿Cuánto Monster Energy puede soportar tu cuerpo?"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" /> Referencia del Personaje
              </label>
              <input
                type="text"
                value={characterRef}
                onChange={(e) => setCharacterRef(e.target.value)}
                placeholder="Ej. Hombre de 30 años, piel transparente, esqueleto visible"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Cantidad de Escenas: <span className="text-amber-400 font-bold">{stepCount}</span>
              </label>
              <input
                type="range"
                min={4}
                max={20}
                value={stepCount}
                onChange={(e) => setStepCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>4</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas || isGeneratingScript || isGeneratingImages}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-semibold transition-all border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-2 text-sm"
            >
              {isGeneratingIdeas ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
              1. Generar Ideas
            </button>
            <button
              onClick={() => handleGenerateScript()}
              disabled={isGeneratingScript || isGeneratingImages || !topic}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isGeneratingScript ? <FileText className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
              2. Generar Guion
            </button>
            <button
              onClick={handleGenerateImages}
              disabled={isGeneratingImages || !currentScript}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isGeneratingImages ? <ImageIcon className="w-4 h-4 animate-pulse" /> : <ImageIcon className="w-4 h-4" />}
              3. Generar Prompts
            </button>
          </div>
        </div>

        {/* Ideas */}
        {ideas.length > 0 && !data && (
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-amber-500/30 animate-in fade-in">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Ideas de Videos:</h3>
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
                  onClick={() => handleGenerateScript()}
                  className="flex items-center gap-2 bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 py-2 px-3 rounded-xl text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerar Guion
                </button>
                <button
                  onClick={() => handleCopy(data!.script, 'script')}
                  className="flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates['script'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                </button>
              </div>
            </div>
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{data.script}</p>
            </div>
            {data.reference_prompt && (
              <div className="mt-4 bg-slate-950/60 p-4 rounded-2xl border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase">Prompt de Personaje de Referencia</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(data!.reference_prompt, 'ref')}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-3 rounded-lg transition-colors"
                    >
                      {copiedStates['ref'] ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />} Copiar
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-2">{data.reference_prompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Prompts de Escenas */}
        {data?.timeline && data.timeline.length > 0 && (
          <div className="bg-slate-900/40 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in slide-in-from-bottom-4 relative">
            <button
              onClick={handleCopyAll}
              className="absolute top-6 right-6 flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
            >
              {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
            </button>
            <h3 className="text-xl font-bold text-white mb-6 pr-40">Prompts de Escenas</h3>

            <div className="space-y-4">
              {data.timeline.map((step, idx) => (
                <div key={idx} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-amber-500/20 text-amber-400 py-1 px-3 rounded-lg font-bold text-sm border border-amber-500/30">
                      {step.step_name}
                    </span>
                    <span className="text-xs text-slate-500">Escena {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prompt Imagen */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-orange-400 uppercase">📷 Prompt Imagen</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRegeneratePrompt(idx, "image")}
                            disabled={isRegenerating(idx, "image")}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                            title="Regenerar prompt"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRegenerating(idx, "image") ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleCopy(step.image_prompt, `img_${idx}`)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                          >
                            {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{step.image_prompt}</p>
                    </div>

                    {/* Prompt Video */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-cyan-400 uppercase">🎬 Prompt Video</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRegeneratePrompt(idx, "video")}
                            disabled={isRegenerating(idx, "video")}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                            title="Regenerar prompt"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRegenerating(idx, "video") ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleCopy(step.video_prompt, `vid_${idx}`)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                          >
                            {copiedStates[`vid_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
    </main>
  );
}
