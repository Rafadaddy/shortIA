"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Copy, Check, Search, MessageCircle } from "lucide-react";

interface ComicPanel {
  panel_number: number;
  scene_role: "GANCHO" | "DESARROLLO" | "CLIMAX" | "DESENLACE";
  dialogue: string;
  image_prompt: string;
}

interface ComicData {
  title: string;
  panels: ComicPanel[];
  caption: string;
  music_recommendation: string;
}

const comicNiches = [
  "Ese momento en que te conviertes en tu papá o tu mamá sin darte cuenta",
  "Cuando alguien que querías se convirtió en un completo extraño",
  "El precio silencioso de querer caerle bien a todos",
  "La trampa de comparar tu vida con lo que ves en redes sociales",
  "Crecer y darte cuenta de que los adultos tampoco saben qué están haciendo",
  "Amor que llegó en el momento equivocado (o con la persona equivocada)",
  "Ese trabajo que te quitó la energía pero te enseñó quién eres",
  "La soledad que sientes rodeado de gente que te quiere",
  "Cuando tu mayor enemigo resultó ser tu propio cerebro",
  "El día que decidiste dejar de esperar que las cosas cambiaran solas",
  "Amistades que duran para siempre… hasta que no duran",
  "Fracasar en algo que amabas y volver a intentarlo de todas formas",
];

export default function HistorietasPage() {
  const [niche, setNiche] = useState(comicNiches[0]);
  const [idea, setIdea] = useState("");
  const [characterDesc, setCharacterDesc] = useState("");
  const [panelCount, setPanelCount] = useState("4");
  const [visualStyle, setVisualStyle] = useState("Estilo CÃ³mic Web / Webtoon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ComicData | null>(null);
  
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setData(null);

    try {
      const res = await fetch("/api/generate-comic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, idea, panels: parseInt(panelCount), style: visualStyle, characterDesc }),
      });
      if (!res.ok) throw new Error("Error en la solicitud");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar la historieta.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleCopyAll = () => {
    if (!data) return;
    const allText = data.panels.map(p => `ViÃ±eta ${p.panel_number}:\nDiÃ¡logo: "${p.dialogue}"\nPrompt: ${p.image_prompt}\n`).join("\n");
    handleCopy(allText, 'all');
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            Historietas y CÃ³mics
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Crea secuencias de imÃ¡genes (carruseles) tipo historieta con diÃ¡logos integrados. Ideal para Instagram y TikTok.
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                TemÃ¡tica
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                {comicNiches.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Estilo Visual
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                <option value="Estilo CÃ³mic Web / Webtoon">Estilo CÃ³mic / Webtoon</option>
                <option value="Stickman Minimalista (Estilo Palitos)">Stickman Minimalista (Palitos)</option>
                <option value="Anime / Manga">Anime / Manga</option>
                <option value="Dibujo Tierno Aesthetic">Dibujo Tierno Aesthetic</option>
                <option value="IlustraciÃ³n 3D (Pixar)">IlustraciÃ³n 3D (Pixar)</option>
                <option value="AnimaciÃ³n 2D ClÃ¡sica (Cartoon)">AnimaciÃ³n 2D ClÃ¡sica (Cartoon)</option>
                <option value="Dibujo a LÃ¡piz (Sketch Tradicional)">Dibujo a LÃ¡piz (Sketch Tradicional)</option>
                <option value="Arte Noir (Blanco y Negro)">Arte Noir (Blanco y Negro)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Cantidad de ViÃ±etas
              </label>
              <select
                value={panelCount}
                onChange={(e) => setPanelCount(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                {[...Array(18)].map((_, i) => {
                  const num = i + 3;
                  return (
                    <option key={num} value={num}>
                      {num} ViÃ±etas {num === 4 ? "(ClÃ¡sico)" : num > 10 ? "(TardarÃ¡ mÃ¡s)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Â¿De quÃ© trata la historia? (Opcional)
              </label>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ej. Un perro que cree que su dueÃ±o es una mascota..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Apariencia del Personaje Principal
              </label>
              <input
                type="text"
                value={characterDesc}
                onChange={(e) => setCharacterDesc(e.target.value)}
                placeholder="Ej. Un chico de 20 aÃ±os con pelo rojo alborotado y chaqueta amarilla..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
          >
            {isGenerating ? (
              <><Sparkles className="w-5 h-5 animate-pulse" /> Escribiendo Guion...</>
            ) : (
              <><MessageCircle className="w-5 h-5" /> Generar Historieta</>
            )}
          </button>
        </div>

        {/* Resultados */}
        {data && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-2xl font-bold text-white flex-1">{data.title}</h2>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
              </button>
            </div>

            <div className="space-y-4">
              {data.panels.map((panel, idx) => {
                const roleConfig: Record<string, { label: string; color: string }> = {
                  GANCHO:    { label: "🎣 Gancho",    color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                  DESARROLLO:{ label: "🔥 Desarrollo", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                  CLIMAX:    { label: "⚡ Clímax",    color: "bg-red-500/20 text-red-400 border-red-500/30" },
                  DESENLACE: { label: "✨ Desenlace",  color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                };
                const role = roleConfig[panel.scene_role] ?? { label: panel.scene_role, color: "bg-slate-700/30 text-slate-400 border-slate-600/30" };

                return (
                  <div key={idx} className="bg-slate-900/40 rounded-2xl border border-slate-800/60 p-5 shadow-lg flex flex-col md:flex-row gap-6">

                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-400 font-black text-xl">
                        {panel.panel_number}
                      </div>
                      {panel.scene_role && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${role.color} whitespace-nowrap`}>
                          {role.label}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Diálogo / Texto en la imagen</span>
                        <p className="text-slate-200 font-medium text-lg italic">&quot;{panel.dialogue}&quot;</p>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt de Generación (DALL-E 3)</span>
                          <button
                            onClick={() => handleCopy(panel.image_prompt, `prompt_${idx}`)}
                            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                          >
                            {copiedStates[`prompt_${idx}`] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar Prompt</>}
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 font-mono leading-relaxed">{panel.image_prompt}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block">🎵 Sugerencia de Música / Audio</span>
                <p className="text-sm text-slate-300 italic">&quot;{data.music_recommendation}&quot;</p>
              </div>

              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">Caption para Instagram/TikTok</span>
                <p className="text-slate-300">{data.caption}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
