"use client";

import { useState } from "react";
import { Sparkles, PlaySquare, Copy, Check, Palette, Image as ImageIcon, Play, Loader2 } from "lucide-react";

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
  const [sceneCount, setSceneCount] = useState("8");
  const [bodyColor, setBodyColor] = useState("yellow");
  const [shortsColor, setShortsColor] = useState("black");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [ideas, setIdeas] = useState<FacelessIdea[]>([
    {
      title: "Transforma tu Cuerpo en 30 Días con Calistenia",
      hook: "No necesitas un gimnasio para ponerte fuerte, solo necesitas tu propio peso.",
      pain_point: "Falta de dinero o tiempo para ir al gimnasio.",
      why_it_works: "Apunta a principiantes que quieren resultados rápidos en casa."
    },
    {
      title: "El Error que Destruye tus Hombros en las Flexiones",
      hook: "Si sientes dolor al hacer flexiones, estás cometiendo este grave error.",
      pain_point: "Dolor en articulaciones y estancamiento muscular.",
      why_it_works: "Genera miedo a lesionarse y curiosidad por arreglarlo."
    }
  ]);
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
        body: JSON.stringify({ mode: "full", topic: finalTopic, bodyColor, shortsColor, sceneCount: parseInt(sceneCount) }),
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

  const handleCopyFullScript = () => {
    if (!data) return;
    const { hook, development, climax, ending } = data.script_sections as any;
    let fullText = "";
    if (hook) fullText += `INICIO:\n${hook}\n\n`;
    if (development) fullText += `DESARROLLO:\n${development}\n\n`;
    if (climax) fullText += `CLÍMAX:\n${climax}\n\n`;
    if (ending) fullText += `FINAL:\n${ending}\n\n`;
    
    fullText += `--- ESCENAS ---\n`;
    data.scenes.forEach(s => {
      fullText += `Escena ${s.scene_number}: ${s.narration}\n`;
    });
    
    handleCopy(fullText, 'full_script');
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
            Genera guiones completos, escenas, animaciones y miniaturas para videos largos de YouTube (Estilo Animación Cartoon).
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Tema del Video (Calistenia, Musculación, Reflexiones, etc.)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. Cómo hacer tu primera dominada (Pull-up) paso a paso"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Cantidad de Escenas
              </label>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none"
              >
                {[...Array(12)].map((_, i) => {
                  const num = i + 4;
                  return <option key={num} value={num}>{num} Escenas</option>;
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas || isGeneratingFull}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-slate-700"
            >
              {isGeneratingIdeas ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              Sugerir 5 Ideas
            </button>
            <button
              onClick={() => handleGenerateVideo()}
              disabled={isGeneratingIdeas || isGeneratingFull || !topic}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-cyan-900/20"
            >
              {isGeneratingFull ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
              Generar Guion Completo
            </button>
          </div>
        </div>

        {/* Ideas Generadas */}
        {ideas.length > 0 && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            {ideas.map((idea, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
                onClick={() => handleGenerateVideo(idea.title)}
              >
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">{idea.title}</h3>
                <p className="text-sm text-slate-400 mb-4 border-l-2 border-cyan-500/30 pl-3 italic">
                  &quot;{idea.hook}&quot;
                </p>
                <div className="space-y-2">
                  <div className="text-xs bg-slate-950 p-2 rounded text-slate-300">
                    <span className="text-rose-400 font-semibold">Dolor:</span> {idea.pain_point}
                  </div>
                  <div className="text-xs bg-slate-950 p-2 rounded text-slate-300">
                    <span className="text-emerald-400 font-semibold">Por qué funciona:</span> {idea.why_it_works}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Completo Generado */}
        {data && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8">
            
            {/* Título Principal */}
            <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl text-center">
              <h2 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {data.title}
              </h2>
            </div>

            {/* Thumbnail */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <ImageIcon className="w-5 h-5 text-cyan-500" /> Miniatura (Thumbnail)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  <p className="text-2xl font-black text-white text-center uppercase tracking-tighter" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    {data.thumbnail.text}
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-cyan-500 uppercase">Prompt para Imagen (16:9)</span>
                  <p className="text-sm text-slate-400 font-mono">{data.thumbnail.image_prompt}</p>
                </div>
              </div>
            </div>

            {/* Guion Estructural */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl relative">
              <button
                onClick={handleCopyFullScript}
                className="absolute top-6 right-6 flex items-center gap-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                {copiedStates['full_script'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Guion Completo</>}
              </button>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">📜 Guion Narrativo (Historia)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">1. Inicio (Gancho y Contexto)</span>
                  <p className="text-sm text-slate-300 italic">&quot;{(data.script_sections as any).hook || data.script_sections.hook}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">2. Desarrollo (Progresión)</span>
                  <p className="text-sm text-slate-300 italic">&quot;{(data.script_sections as any).development}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">3. Clímax (Mayor Tensión)</span>
                  <p className="text-sm text-slate-300 italic">&quot;{(data.script_sections as any).climax}&quot;</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-xs font-bold text-cyan-500 uppercase block mb-1">4. Final (Desenlace y Moraleja)</span>
                  <p className="text-sm text-slate-300 italic">&quot;{(data.script_sections as any).ending}&quot;</p>
                </div>
              </div>
            </div>

            {/* Escenas Detalladas */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">🎬 Desglose de Escenas</h3>
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1 rounded-full text-sm">
                        Escena {scene.scene_number}
                      </span>
                      <span className="text-slate-500 text-xs">Duración: {scene.duration}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Narración</span>
                        <p className="text-slate-200 text-sm font-medium mt-1">&quot;{scene.narration}&quot;</p>
                      </div>
                      <div className="border-l-2 border-purple-500/50 pl-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase">En Pantalla</span>
                        <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 relative">
                        <span className="text-xs font-semibold text-pink-400 uppercase block mb-2">Prompt de Imagen</span>
                        <button onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)} className="absolute top-2 right-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300">
                          {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                        </button>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed pr-6">{scene.image_prompt}</p>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 relative">
                        <span className="text-xs font-semibold text-emerald-400 uppercase block mb-2">Prompt de Animación (Veo 3/Runway)</span>
                        <button onClick={() => handleCopy(scene.animation_prompt, `anim_${idx}`)} className="absolute top-2 right-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300">
                          {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
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
