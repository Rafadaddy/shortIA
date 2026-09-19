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
  "🎲 Aleatorio / Sorpréndeme",
  "🧠 Psicología Oscura y Verdades Crudas",
  "🦁 Mentes Millonarias y Estoicismo",
  "💰 Métodos para ser Millonario y Riqueza",
  "🚀 Emprendimiento y Cómo Crear un Negocio",
  "📈 Finanzas Personales y Cómo Ahorrar",
  "🔥 Seducción y Psicología del Atractivo",
  "🌀 ¿Qué Pasaría Si...? / Curiosidad Surrealista",
  "☕ Humor Sarcástico de Vida Adulta",
  "❤️ Amor Tierno y Relaciones Random",
  "💔 Desamor, Sanación y Soltar (Sad Aesthetic)",
  "✨ Espiritualidad y Ley de Atracción",
  "✏️ Escribir mi propio nicho personalizado..."
];

const QUICK_NICHES = [
  { label: "🧠 Psicología", value: "🧠 Psicología Oscura y Verdades Crudas" },
  { label: "🦁 Estoicismo", value: "🦁 Mentes Millonarias y Estoicismo" },
  { label: "💰 Finanzas", value: "📈 Finanzas Personales y Cómo Ahorrar" },
  { label: "🔥 Seducción", value: "🔥 Seducción y Psicología del Atractivo" },
  { label: "💔 Desamor", value: "💔 Desamor, Sanación y Soltar (Sad Aesthetic)" },
  { label: "🎲 Sorpréndeme", value: "🎲 Aleatorio / Sorpréndeme" },
];

const visualStylesList = [
  "🎲 Libre / Que la IA decida",
  "📖 Cuento / Fábula Moderna (Acuarela y Tinta, Infantil/Profundo)",
  "🏙️ Foto Realista Urbana / Motivacional (Luz Dorada, Pared/Calle)",
  "🎨 Pintura Artística / Sarcasmo (Óleo Digital, Expresivo, Dramático)",
  "🛋️ Minimalista / Cartoon Relatable (Blob, Webcomic, Fondo Limpio)",
  "🦁 Metáfora Cinematográfica Oscura (National Geographic, Épico)",
  "✨ Cute 3D / Pixar Vibe (Render 3D Tierno, Iluminación Suave)",
  "✏️ Escribir mi propio estilo personalizado..."
];

export default function IlustracionesPage() {
  const [selectedNicheOption, setSelectedNicheOption] = useState(illustrationNiches[0]);
  const [customNiche, setCustomNiche] = useState("");

  const [selectedStyleOption, setSelectedStyleOption] = useState(visualStylesList[0]);
  const [customStyle, setCustomStyle] = useState("");

  const [idea, setIdea] = useState("");
  const [imageFormat, setImageFormat] = useState("Vertical (9:16)");
  const [textSurface, setTextSurface] = useState("Integrado (Por Defecto)");
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titles, setTitles] = useState<string[] | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<IllustrationData | null>(null);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  const [regenerating, setRegenerating] = useState(false);

  const getEffectiveNiche = () => {
    if (selectedNicheOption === "✏️ Escribir mi propio nicho personalizado...") {
      return customNiche.trim() || "Motivación y Reflexión";
    }
    return selectedNicheOption;
  };

  const getEffectiveStyle = () => {
    if (selectedStyleOption === "✏️ Escribir mi propio estilo personalizado...") {
      return customStyle.trim() || "Cinemático";
    }
    return selectedStyleOption;
  };

  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    setTitles(null);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-illustration", { 
        niche: getEffectiveNiche(), 
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
    setIdea(selectedTitle);
    setTitles(null);

    try {
      const res = await aiFetch("/api/generate-illustration", { 
        niche: getEffectiveNiche(), 
        idea: selectedTitle, 
        format: imageFormat, 
        style: getEffectiveStyle(), 
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
        niche: getEffectiveNiche(),
        style: getEffectiveStyle(),
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
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center justify-between">
                <span>Nicho / Temática</span>
                <span className="text-xs text-pink-400/80 font-normal">Despliega para elegir</span>
              </label>
              <select
                value={selectedNicheOption}
                onChange={(e) => setSelectedNicheOption(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm font-medium"
              >
                {illustrationNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              {selectedNicheOption === "✏️ Escribir mi propio nicho personalizado..." && (
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="Escribe tu nicho o temática personalizada..."
                  className="w-full bg-slate-950/90 border border-pink-500/50 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm animate-in fade-in"
                  autoFocus
                />
              )}

              {/* Accesos rápidos */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">Rápidos:</span>
                {QUICK_NICHES.map((chip) => (
                  <button
                    type="button"
                    key={chip.label}
                    onClick={() => setSelectedNicheOption(chip.value)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      selectedNicheOption === chip.value
                        ? "bg-pink-500/20 text-pink-300 border-pink-500/50 font-bold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center justify-between">
                <span>Estilo Visual</span>
                <span className="text-xs text-pink-400/80 font-normal">Estilo del arte</span>
              </label>
              <select
                value={selectedStyleOption}
                onChange={(e) => setSelectedStyleOption(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm font-medium"
              >
                {visualStylesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {selectedStyleOption === "✏️ Escribir mi propio estilo personalizado..." && (
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="Ej. Cyberpunk vintage con luces rojas..."
                  className="w-full bg-slate-950/90 border border-pink-500/50 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm animate-in fade-in"
                  autoFocus
                />
              )}
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
                <label className="text-sm font-medium text-slate-300 ml-1">Espacio de Texto / Integración</label>
                <select
                  value={textSurface}
                  onChange={(e) => setTextSurface(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none text-sm"
                >
                  <option value="Integrado (Por Defecto)">✨ Espacio Negativo Limpio (Arriba / Lado)</option>
                  <option value="Pared Urbana / Mural">🧱 Pintado en Pared / Mural Urbano</option>
                  <option value="Letrero de Neón">💡 Letrero de Neón Luminoso</option>
                  <option value="Tiza en Pizarrón">📋 Tiza en Pizarrón / Pizarra</option>
                  <option value="Tallado en Madera">🪵 Tallado rústico en Madera</option>
                  <option value="Papel Roto / Antiguo">📜 Papel Antiguo o Roto</option>
                  <option value="Cielo / Nubes">☁️ Cielo / Nubes Flotantes</option>
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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Resultado Generado
                      </label>
                      <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-medium">
                        HD 9:16
                      </span>
                    </div>

                    {/* Contenedor de la Imagen con Superposición Tipográfica de Gancho */}
                    <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl relative bg-slate-950 aspect-[9/16] max-h-[600px] flex items-center justify-center group">
                      <img 
                        src={"data:image/jpeg;base64," + data.generated_image_base64}
                        alt={data.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Banner / Tipografía de Gancho Llamativo Superpuesto */}
                      <div className="absolute inset-x-0 top-0 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                        <p className="text-white text-center font-extrabold text-lg md:text-xl leading-tight tracking-wide drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] uppercase font-sans">
                          {data.suggested_phrase}
                        </p>
                      </div>
                    </div>

                    <a 
                      href={"data:image/jpeg;base64," + data.generated_image_base64}
                      download={"ilustracion-" + data.title.replace(/\s+/g, '-').toLowerCase() + ".jpg"}
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-center font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      Descargar Imagen HD
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
