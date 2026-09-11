"use client";
import { aiFetch } from "@/lib/ai-fetch";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Copy, Check, Quote, RefreshCw, List } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

interface IllustrationData {
  title: string;
  suggested_phrase: string;
  image_prompt: string;
  caption: string;
  generated_image_base64?: string;
}

const illustrationNiches = [
  "Psicología Oscura y Verdades Crudas",
  "Mentes Millonarias y Estoicismo",
  "Métodos para ser Millonario y Riqueza",
  "Emprendimiento y Cómo Crear un Negocio",
  "Finanzas Personales y Cómo Ahorrar",
  "Seducción y Psicología del Atractivo",
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
  const [textSurface, setTextSurface] = useState("Integrado (Por Defecto)");
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titles, setTitles] = useState<string[] | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<IllustrationData | null>(null);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  const [regenerating, setRegenerating] = useState(false);

  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    setTitles(null);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-illustration", { 
        niche, 
        idea, 
        mode: "titles" 
      });
      if (!res.ok) throw new Error("Error obteniendo títulos");
      
      const generated = await res.json();
      if (generated.titles) {
        setTitles(generated.titles);
      }
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar las ideas de imágenes.", "error");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateIllustration = async (selectedTitle: string) => {
    setIsGenerating(true);
    setData(null);
    setIdea(selectedTitle); // La idea seleccionada se convierte en el tema
    setTitles(null); // Ocultar títulos

    try {
      const res = await aiFetch("/api/generate-illustration", { 
        niche, 
        idea: selectedTitle, 
        format: imageFormat, 
        style: visualStyle, 
        textSurface,
        mode: "image"
      });
      if (!res.ok) throw new Error("Error en la solicitud");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar la ilustración.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImagePrompt = async () => {
    if (!data || regenerating) return;
    setRegenerating(true);
    try {
      const res = await aiFetch("/api/generate-illustration", {
        mode: "single_prompt",
        niche,
        style: visualStyle,
        format: imageFormat,
        textSurface,
        suggested_phrase: data.suggested_phrase,
        existing_prompt: data.image_prompt,
      });
      if (!res.ok) throw new Error("Error al regenerar");
      const newData = await res.json();
      setData({ ...data, image_prompt: newData.image_prompt });
      showToast("Prompt regenerado exitosamente", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al regenerar el prompt.", "error");
    } finally {
      setRegenerating(false);
    }
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
            Crea prompts e imágenes con textos impactantes integrados. Genera ideas y elige tu favorita.
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nicho / Temática</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
              >
                {illustrationNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Estilo Visual</label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
              >
                <option value="Cinemático Oscuro (Motivación)">Cinemático Oscuro (Motivación)</option>
                <option value="Elegante B&W (Mafia/Luxury)">Elegante B&W (Mafia/Luxury)</option>
                <option value="Personaje 3D Gracioso">Personaje 3D Gracioso (Animales/Memes)</option>
                <option value="3D Pixar">3D Pixar (Emotivo/Lindo)</option>
                <option value="Aesthetic Tierno (Lofi/Pastel)">Aesthetic Tierno (Lofi/Pastel)</option>
                <option value="Minimalista Elegante">Minimalista Elegante</option>
                <option value="Animación 2D (Retro)">Animación 2D (Retro)</option>
                <option value="Lápiz (Sketch Tradicional)">Lápiz (Sketch Tradicional)</option>
                <option value="Mural Urbano (Street Art)">Mural Urbano (Street Art)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">¿De qué quieres hablar? (Opcional)</label>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ej. 'Disciplina', 'Ruptura amorosa'..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Formato</label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-sm"
                >
                  <option value="Vertical (9:16)">📱 Vertical (9:16)</option>
                  <option value="Cuadrado (1:1)">⬜ Cuadrado (1:1)</option>
                  <option value="Horizontal (16:9)">📺 Horizontal (16:9)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Superficie Texto</label>
                <select
                  value={textSurface}
                  onChange={(e) => setTextSurface(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-sm"
                >
                  <option value="Integrado (Por Defecto)">Integrado en entorno</option>
                  <option value="Letrero de Neón">Letrero de Neón</option>
                  <option value="Tiza en Pizarrón">Tiza en Pizarrón</option>
                  <option value="Tallado en Madera">Tallado en Madera</option>
                  <option value="Papel Roto / Antiguo">Papel Roto / Antiguo</option>
                  <option value="Cielo / Nubes">Cielo / Nubes</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles || isGenerating}
            className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]"
          >
            {isGeneratingTitles ? (
              <><RefreshCw className="w-6 h-6 animate-spin" /> Pensando ideas creativas...</>
            ) : (
              <><List className="w-6 h-6 group-hover:scale-110 transition-transform" /> Generar 10 Ideas de Imágenes</>
            )}
          </button>
        </div>

        {/* Zona de Selección de Títulos */}
        {titles && titles.length > 0 && (
          <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Selecciona la idea que más te guste:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {titles.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateIllustration(t)}
                  className="text-left bg-slate-950/60 hover:bg-pink-900/30 hover:border-pink-500/50 border border-slate-800 p-4 rounded-xl transition-all duration-200 group"
                >
                  <span className="flex items-start gap-3">
                    <span className="text-pink-500 font-bold mt-1">{idx + 1}.</span>
                    <span className="text-slate-300 group-hover:text-pink-200 leading-relaxed font-medium">{t}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cargando la imagen/prompt */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 animate-pulse">
            <ImageIcon className="w-10 h-10 animate-pulse text-pink-500 mb-4" />
            <p className="text-lg font-medium">Creando ilustración y prompt de Midjourney...</p>
          </div>
        )}

        {/* Results */}
        {data && !isGenerating && (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full"></div>
              
              {/* Contenedor Flex: Texto vs Imagen Generada */}
              <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                
                {/* Columna Izquierda: Textos y Prompts */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
                      <Quote className="w-4 h-4" />
                      Frase a integrar
                    </div>
                    <p className="mt-3 text-xl md:text-2xl font-medium text-slate-200 italic border-l-4 border-indigo-500 pl-4 py-1">
                      "{data.suggested_phrase}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Image Prompt (Inglés)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRegenerateImagePrompt}
                          disabled={regenerating}
                          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                        >
                          <RefreshCw className={"w-3.5 h-3.5 " + (regenerating ? "animate-spin" : "")} />
                          Regenerar
                        </button>
                        <button
                          onClick={() => handleCopy(data.image_prompt, 'image_prompt')}
                          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                        >
                          {copiedStates['image_prompt'] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {data.image_prompt}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                        Pie de Foto (Caption)
                      </label>
                      <button
                        onClick={() => handleCopy(data.caption, 'caption')}
                        className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                      >
                        {copiedStates['caption'] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                      </button>
                    </div>
                    <p className="text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                      {data.caption}
                    </p>
                  </div>
                </div>

                {/* Columna Derecha: Imagen Generada (Si existe) */}
                {data.generated_image_base64 && (
                  <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4">
                    <label className="text-sm font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Resultado Generado
                    </label>
                    <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl relative bg-slate-950 aspect-[9/16] max-h-[600px] flex items-center justify-center">
                      <img 
                        src={"data:image/jpeg;base64," + data.generated_image_base64}
                        alt={data.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <a 
                      href={"data:image/jpeg;base64," + data.generated_image_base64}
                      download={"ilustracion-" + data.title.replace(/\s+/g, '-').toLowerCase() + ".jpg"}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-center font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      Descargar Imagen
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
