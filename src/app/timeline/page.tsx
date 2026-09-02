"use client";

import { useState } from "react";
import { Sparkles, Hourglass, Copy, Check, User } from "lucide-react";

interface TimelineStep {
  step_name: string;
  narration: string;
  image_prompt: string;
}

interface TimelineData {
  title: string;
  timeline: TimelineStep[];
}

export default function TimelinePage() {
  const [topic, setTopic] = useState("");
  const [stepCount, setStepCount] = useState("8");
  const [characterRef, setCharacterRef] = useState("Un esqueleto animado clásico (puedes especificar si lleva playera, traje, o nada)");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([
    "¿Quéé pasa si dejas de consumir azúcar por 30 días?",
    "¿Quéé pasaría si la gravedad de la Tierra se duplica de golpe?",
    "¿Quéé pasa en tu cuerpo si no duermes durante 7 días seguidos?",
    "¿Quéé pasa si solo bebes refresco en lugar de agua por un año?",
    "¿Quéé pasaría si te quedías encerrado en un supermercado 5 años?"
  ]);
  const [data, setData] = useState<TimelineData | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setData(null);

    try {
      const res = await fetch("/api/generate-timeline", {
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

  const handleGenerateTimeline = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic) return alert("Ingresa un tema primero");
    
    setIsGeneratingTimeline(true);
    setData(null);
    if (selectedTopic) setTopic(selectedTopic);

    try {
      const res = await fetch("/api/generate-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "timeline", topic: finalTopic, characterRef, stepCount: parseInt(stepCount) }),
      });
      if (!res.ok) throw new Error("Error fetching timeline");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      alert("Hubo un error al generar la línea temporal.");
    } finally {
      setIsGeneratingTimeline(false);
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
    const fullText = data.timeline.map(step => `${step.step_name}:\n${step.narration}`).join("\n\n");
    handleCopy(fullText, 'full_script');
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Hourglass className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            Líneas Temporales &quot;¿Qué pasaría si...?&quot;
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Genera guiones y prompts consistentes para videos de progresión temporal (Ej: Qué pasaría si no duermes en 7 días).
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Tema de la Línea Temporal
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. Qué pasaría si solo comes comida basura durante 7 días?"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" /> Referencia del Personaje Principal (Para consistencia visual)
              </label>
              <input
                type="text"
                value={characterRef}
                onChange={(e) => setCharacterRef(e.target.value)}
                placeholder="Ej. Un esqueleto animado clásico"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Cantidad de Pasos / Escenas
              </label>
              <select
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
              >
                {[...Array(16)].map((_, i) => {
                  const num = i + 5;
                  return <option key={num} value={num}>{num} Pasos</option>;
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerateIdeas()}
              disabled={isGeneratingIdeas || isGeneratingTimeline}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-semibold transition-all border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-2"
            >
              {isGeneratingIdeas ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
              Sugerir 10 Ideas
            </button>
            <button
              onClick={() => handleGenerateTimeline()}
              disabled={isGeneratingTimeline || !topic}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingTimeline ? <Hourglass className="w-5 h-5 animate-spin" /> : <Hourglass className="w-5 h-5" />}
              Generar Guion Completo
            </button>
          </div>
        </div>

        {ideas.length > 0 && !data && (
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-amber-500/30 animate-in fade-in">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Ideas Generadías:</h3>
            <ul className="space-y-2">
              {ideas.map((ideaItem, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => handleGenerateTimeline(ideaItem)}
                    className="w-full text-left bg-slate-950/50 hover:bg-amber-900/20 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl text-slate-200 transition-all flex items-center gap-3"
                  >
                    <span className="text-amber-500 font-bold">{idx + 1}.</span> {ideaItem}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data && (
          <div className="bg-slate-900/40 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in slide-in-from-bottom-4 relative">
            <button
              onClick={handleCopyFullScript}
              className="absolute top-6 right-6 flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
            >
              {copiedStates['full_script'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Guion Completo</>}
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 pr-48 text-amber-400">
              {data.title}
            </h2>

            <div className="space-y-6">
              {data.timeline.map((step, idx) => (
                <div key={idx} className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-amber-500/20 text-amber-400 py-1 px-3 rounded-lg font-bold text-sm border border-amber-500/30">
                      {step.step_name}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-slate-200 text-lg font-medium leading-relaxed italic border-l-4 border-amber-500/50 pl-4 py-1">
                      &quot;{step.narration}&quot;
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                        Prompt Visual
                      </span>
                      <button
                        onClick={() => handleCopy(step.image_prompt, `prompt_${idx}`)}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                      >
                        {copiedStates[`prompt_${idx}`] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 font-mono leading-relaxed">
                      {step.image_prompt}
                    </p>
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
