"use client";

import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Palette } from "lucide-react";

interface FacelessIdea {
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

interface FacelessData {
  title: string;
  thumbnail: {
    text: string;
    image_prompt: string;
  };
  script_sections: {
    hook: string;
    promise: string;
    step_by_step: string;
    mistakes: string;
    action_plan: string;
    cta: string;
  };
  scenes: Scene[];
}

export default function FacelessYouTubePage() {
  const [topic, setTopic] = useState("");
  const [bodyColor, setBodyColor] = useState("yellow");
  const [shortsColor, setShortsColor] = useState("black");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [ideas, setIdeas] = useState<FacelessIdea[]>([]);
  const [data, setData] = useState<FacelessData | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setData(null);

    try {
      const res = await fetch("/api/generate-faceless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ideas" }),
      });
      if (!res.ok) throw new Error("Error fetching ideas");
      const generated = await res.json();
      if (generated.ideas) {
        setIdeas(generated.ideas);
      }
    } catch (error) {
      alert("Hubo un error al generar ideas.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleGenerateVideo = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic) return alert("Ingresa un tema primero");
    
    setIsGeneratingVideo(true);
    setData(null);
    if (selectedTopic) setTopic(selectedTopic);

    try {
      const res = await fetch("/api/generate-faceless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "full", topic: finalTopic, bodyColor, shortsColor }),
      });
      if (!res.ok) throw new Error("Error fetching video data");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      alert("Hubo un error al generar el paquete del video.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-cyan-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <PlaySquare className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            Faceless Fitness (YouTube)
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Genera guiones completos, escenas, animaciones y miniaturas para videos largos de YouTube (Estilo Animación Cartoon Fitness).
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Tema del Video (Calistenia, Musculación, etc.)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. Cómo hacer tu primera dominada (Pull-up) paso a paso"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" /> Color de Piel del Personaje
              </label>
              <input
                type="text"
                value={bodyColor}
                onChange={(e) => setBodyColor(e.target.value)}
                placeholder="Ej. yellow, white, blue"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" /> Color de Pantalones / Shorts
              </label>
              <input
                type="text"
                value={shortsColor}
                onChange={(e) => setShortsColor(e.target.value)}
                placeholder="Ej. black, red, green"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerateIdeas()}
              disabled={isGeneratingIdeas || isGeneratingVideo}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-semibold transition-all border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2"
            >
              {isGeneratingIdeas ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
              Sugerir 5 Ideas Virales
            </button>
            <button
              onClick={() => handleGenerateVideo()}
              disabled={isGeneratingVideo || !topic}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingVideo ? <PlaySquare className="w-5 h-5 animate-spin" /> : <PlaySquare className="w-5 h-5" />}
              Generar Pack de Video Completo
            </button>
          </div>
        </div>

        {ideas.length > 0 && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            {ideas.map((ideaItem, idx) => (
              <button 
                key={idx}
                onClick={() => handleGenerateVideo(ideaItem.title)}
                className="text-left bg-slate-900/40 hover:bg-cyan-900/20 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl text-slate-200 transition-all"
              >
                <h3 className="font-bold text-cyan-400 text-lg mb-2">{ideaItem.title}</h3>
                <p className="text-sm text-slate-300 italic mb-2">&quot;{ideaItem.hook}&quot;</p>
                <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <span className="font-semibold text-slate-300">Resuelve:</span> {ideaItem.pain_point}
                </div>
              </button>
            ))}
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            
            {/* Título Principal */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-cyan-500/30 text-center">
              <h2 className="text-3xl font-extrabold text-white text-cyan-400">
                {data.title}
              </h2>
            </div>

            {/* Miniatura */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">??? Miniatura del Video</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase">Texto en la Imagen</span>
                  <p className="text-2xl font-black text-white mt-1 uppercase italic tracking-tight">{data.thumbnail.text}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                  <button onClick={() => handleCopy(data.thumbnail.image_prompt, 'thumb_prompt')} className="absolute top-2 right-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-cyan-300">
                    {copiedStates['thumb_prompt'] ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                  </button>
                  <span className="text-xs font-semibold text-cyan-400 uppercase block mb-2">Prompt Visual (16:9)</span>
                  <p className="text-sm text-slate-400 font-mono">{data.thumbnail.image_prompt}</p>
                </div>
              </div>
            </div>

            {/* Guion Estructural */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">?? Guion (Secciones Clave)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">1. Hook</span>
                  <p className="text-sm text-slate-300 italic">&quot;{data.script_sections.hook}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">2. Promesa</span>
                  <p className="text-sm text-slate-300 italic">&quot;{data.script_sections.promise}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 md:col-span-2">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">3. Paso a Paso</span>
                  <p className="text-sm text-slate-300 italic">&quot;{data.script_sections.step_by_step}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">4. Errores Comunes</span>
                  <p className="text-sm text-slate-300 italic">&quot;{data.script_sections.mistakes}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">5. Plan 7 Días / CTA</span>
                  <p className="text-sm text-slate-300 italic">&quot;{data.script_sections.action_plan}&quot; <br/> &quot;{data.script_sections.cta}&quot;</p>
                </div>
              </div>
            </div>

            {/* Escenas Detalladas */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">?? Desglose por Escenas</h3>
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-cyan-500/20 text-cyan-400 py-1 px-3 rounded-lg font-bold text-sm border border-cyan-500/30">
                        Escena {scene.scene_number}
                      </span>
                      <span className="text-slate-500 text-xs">Duración: {scene.duration}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div className="lg:col-span-1 border-l-2 border-cyan-500/50 pl-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Narración</span>
                        <p className="text-slate-200 text-sm font-medium mt-1">&quot;{scene.narration}&quot;</p>
                      </div>
                      <div className="lg:col-span-2 border-l-2 border-purple-500/50 pl-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase">En Pantalla</span>
                        <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 relative">
                        <span className="text-xs font-semibold text-pink-400 uppercase block mb-2">Prompt de Imagen</span>
                        <button onClick={() => handleCopy(scene.image_prompt, \img_\\)} className="absolute top-2 right-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300">
                          {copiedStates[\img_\\] ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                        </button>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed pr-6">{scene.image_prompt}</p>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 relative">
                        <span className="text-xs font-semibold text-emerald-400 uppercase block mb-2">Prompt de Animación (Veo 3/Runway)</span>
                        <button onClick={() => handleCopy(scene.animation_prompt, \nim_\\)} className="absolute top-2 right-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300">
                          {copiedStates[\nim_\\] ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                        </button>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed pr-6">{scene.animation_prompt}</p>
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
