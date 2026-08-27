"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Copy, Check, Search, Quote } from "lucide-react";

interface IllustrationData {
  title: string;
  suggested_phrase: string;
  image_prompt: string;
  caption: string;
}

const illustrationNiches = [
  "Psicología Oscura y Verdades Crudas",
  "Mentes Millonarias y Estoicismo",
  "Métodos para ser Millonario y Riqueza",
  "Emprendimiento y Cómo Crear un Negocio",
  "Finanzas Personales y Cómo Ahorrar",
  "¿Qué Pasaría Si...? / Curiosidad Surrealista",
  "Humor Sarcástico de Vida Adulta",
  "Amor Tierno y Relaciones Random",
  "Desamor, Sanación y Soltar (Sad Aesthetic)",
  "Espiritualidad y Ley de Atracción"
];

export default function IlustracionesPage() {
  const [niche, setNiche] = useState(illustrationNiches[0]);
  const [idea, setIdea] = useState("");
  const [imageFormat, setImageFormat] = useState("Vertical (9:16)");
  const [visualStyle, setVisualStyle] = useState("Cinemático Oscuro (Motivación)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<IllustrationData | null>(null);
  
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setData(null);

    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, idea, format: imageFormat, style: visualStyle }),
      });
      if (!res.ok) throw new Error("Error en la solicitud");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar el prompt de ilustración.");
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

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-pink-400" />
            Imágenes con Frases Virales
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Crea prompts para imágenes con textos impactantes integrados. Desde ilustraciones tiernas hasta fotos oscuras de motivación.
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Nicho / Temática
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
              >
                {illustrationNiches.map(n => (
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
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
              >
                <option value="Cinemático Oscuro (Motivación)">Cinemático Oscuro (Motivación)</option>
                <option value="Aesthetic Tierno (Dibujo a mano)">Aesthetic Tierno (Dibujo)</option>
                <option value="Minimalista Elegante">Minimalista Elegante</option>
                <option value="3D Pixar/Disney">3D Pixar/Disney</option>
                <option value="Arte Callejero / Urbano">Arte Callejero / Urbano</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Formato de Imagen
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
              >
                <option value="Vertical (3:4)">Vertical 3:4 (Pinterest/IG Portrait)</option>
                <option value="Vertical (9:16)">Vertical 9:16 (Stories/TikTok)</option>
                <option value="Cuadrado (1:1)">Cuadrado 1:1 (IG Post)</option>
                <option value="Horizontal (16:9)">Horizontal 16:9 (YouTube)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              ¿Alguna idea específica? (Opcional)
            </label>
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej. Una niña arrastrando a otra de las trenzas, o una montaña de pasos..."
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(244,114,182,0.4)]"
          >
            {isGenerating ? (
              <><Sparkles className="w-5 h-5 animate-pulse" /> Diseñando Ilustración...</>
            ) : (
              <><ImageIcon className="w-5 h-5" /> Generar Idea y Prompt Visual</>
            )}
          </button>
        </div>

        {/* Resultados */}
        {data && (
          <div className="bg-slate-900/40 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {data.title}
            </h2>

            <div className="space-y-6">
              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-4 h-4" /> Frase Sugerida en la Imagen
                  </span>
                </div>
                <p className="text-slate-200 text-xl font-medium leading-relaxed italic text-center">
                  "{data.suggested_phrase}"
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-sm font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Prompt para DALL-E 3 / Midjourney v6
                  </span>
                  <button
                    onClick={() => handleCopy(data.image_prompt, 'prompt')}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {copiedStates['prompt'] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar Prompt</>}
                  </button>
                </div>
                <p className="text-sm text-slate-300 font-mono leading-relaxed bg-slate-950/50 p-4 rounded-lg">
                  {data.image_prompt}
                </p>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Tip: Pega este texto en DALL-E 3 o Midjourney v6 para generar la imagen con el texto integrado.
                </p>
              </div>

              {/* Nueva Caja: Caption para redes sociales */}
              <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-4 h-4" /> Texto para Pie de Foto (Caption)
                  </span>
                  <button
                    onClick={() => handleCopy(data.caption, 'caption')}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {copiedStates['caption'] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar Texto</>}
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-lg whitespace-pre-wrap">
                  {data.caption}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
