"use client";
import { aiFetch } from "@/lib/ai-fetch";

import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Palette, Image as ImageIcon, Play, Loader2, RefreshCw } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

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

export default function StickmanVideoPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<StickmanData | null>(null);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-stickman", { mode: "full", topic });
      if (!res.ok) throw new Error("Error fetching video data");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar el guion del video.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data || regeneratingScene !== null) return;
    
    const scene = data.scenes[sceneIndex];
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const res = await aiFetch("/api/generate-stickman", {
        mode: "single_prompt",
        prompt_type: promptType,
        scene_number: scene.scene_number,
        topic: data.title,
        scene_context: scene.voiceover,
        base_prompt: data.base_prompt,
        existing_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt,
      });
      
      if (!res.ok) throw new Error("Error regenerando prompt");
      const newData = await res.json();
      
      const newScenes = [...data.scenes];
      if (promptType === "image") {
        newScenes[sceneIndex].image_prompt = newData.image_prompt;
      } else {
        newScenes[sceneIndex].animation_prompt = newData.animation_prompt;
      }
      
      setData({ ...data, scenes: newScenes });
      showToast("Prompt regenerado con éxito", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al regenerar el prompt.", "error");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const copyAllVoiceovers = () => {
    if (!data) return;
    
    let allText = `TÍTULO: ${data.title}\n\n`;
    allText += `=== PROMPT BASE DEL PERSONAJE ===\n${data.base_prompt}\n\n`;
    allText += `=== GUION Y ESCENAS ===\n\n`;
    
    data.scenes.forEach(s => {
      allText += `[ ESCENA ${s.scene_number} ]\n`;
      allText += `VOICEOVER: ${s.voiceover}\n`;
      allText += `IMAGE PROMPT: ${s.image_prompt}\n`;
      allText += `ANIMATION PROMPT: ${s.animation_prompt}\n\n`;
    });
    
    handleCopy(allText.trim(), "all-voiceovers");
    showToast("Guion completo copiado", "success");
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <PlaySquare className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Stickman YouTube</h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg">
            Genera guiones completos de ~59 segundos para videos de Stickman, optimizados para YouTube Shorts o TikTok. Incluye Voiceover y prompts detallados para generar imágenes y animaciones.
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Tema del Video
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. La psicología de por qué le tememos al éxito... (O déjalo vacío para una idea al azar)"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-4 px-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600 min-h-[100px] resize-y"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generando Video Completo...</>
              ) : (
                <><PlaySquare className="w-5 h-5" /> Generar Video Stickman</>
              )}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {data && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                {data.title}
              </h2>
              
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 mb-8">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Prompt Base (Personaje Stickman)
                  </span>
                  <button
                    onClick={() => handleCopy(data.base_prompt, "base-prompt")}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {copiedStates["base-prompt"] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </button>
                </div>
                <p className="text-sm text-slate-300 font-mono leading-relaxed bg-slate-900/50 p-4 rounded-lg">
                  {data.base_prompt}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-200">Guion del Video (10 Escenas)</h3>
                <button
                  onClick={copyAllVoiceovers}
                  className="flex items-center gap-2 text-sm bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 py-2 px-4 rounded-xl transition-colors border border-indigo-500/30"
                >
                  {copiedStates["all-voiceovers"] ? <><Check className="w-4 h-4" /> Todo Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo el Guion</>}
                </button>
              </div>

              <div className="space-y-6">
                {data.scenes.map((scene, index) => (
                  <div key={index} className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
                    {/* Header Escena */}
                    <div className="bg-slate-900/60 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {scene.scene_number}
                        </span>
                        Escena {scene.scene_number}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Voiceover */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            🎤 Voiceover / Narración
                          </label>
                          <button
                            onClick={() => handleCopy(scene.voiceover, `vo-${index}`)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                          >
                            {copiedStates[`vo-${index}`] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-slate-200 text-lg leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                          {scene.voiceover}
                        </p>
                      </div>

                      {/* Prompts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Image Prompt */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                              <ImageIcon className="w-3 h-3" /> Image Prompt
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRegeneratePrompt(index, "image")}
                                disabled={regeneratingScene !== null}
                                className="p-1.5 text-slate-500 hover:text-slate-300 bg-slate-800 rounded-md transition-colors disabled:opacity-50"
                                title="Regenerar Prompt"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingScene === index && regeneratingType === 'image' ? 'animate-spin text-emerald-400' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleCopy(scene.image_prompt, `img-${index}`)}
                                className="p-1.5 text-slate-500 hover:text-slate-300 bg-slate-800 rounded-md transition-colors"
                              >
                                {copiedStates[`img-${index}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-mono leading-relaxed">
                            {scene.image_prompt}
                          </p>
                        </div>

                        {/* Animation Prompt */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <Play className="w-3 h-3" /> Animation Prompt
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRegeneratePrompt(index, "animation")}
                                disabled={regeneratingScene !== null}
                                className="p-1.5 text-slate-500 hover:text-slate-300 bg-slate-800 rounded-md transition-colors disabled:opacity-50"
                                title="Regenerar Prompt"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingScene === index && regeneratingType === 'animation' ? 'animate-spin text-emerald-400' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleCopy(scene.animation_prompt, `anim-${index}`)}
                                className="p-1.5 text-slate-500 hover:text-slate-300 bg-slate-800 rounded-md transition-colors"
                              >
                                {copiedStates[`anim-${index}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-mono leading-relaxed">
                            {scene.animation_prompt}
                          </p>
                        </div>
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
