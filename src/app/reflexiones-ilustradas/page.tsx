"use client";

import { useState } from "react";
import { 
  HeartHandshake, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  ImageIcon, 
  Mic, 
  Hash, 
  Music, 
  Wand2, 
  RefreshCw, 
  Layers, 
  Feather, 
  Compass, 
  Download,
  Share2
} from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

const CATEGORIES = [
  { id: "ciclos", label: "💔 Cerrar Ciclos y Soltar", desc: "Superar el apego, despedidas sanas y aprender a dejar ir." },
  { id: "amor_propio", label: "🌱 Amor Propio y Límites", desc: "Poner límites con amor, no mendigar atención y valor propio." },
  { id: "errores", label: "🪨 Tropiezos y Perseverancia", desc: "Aprender de los errores sin castigarse, paciencia con el proceso." },
  { id: "madurez", label: "🧭 Madurez Emocional y Claridad", desc: "Elegir las batallas, no confundir a los demás y paz mental." },
  { id: "cansancio", label: "☕ Cansancio Adulto y Calma", desc: "Aprender a descansar sin renunciar, días difíciles y desconexión." },
  { id: "gratitud", label: "✨ Gratitud y Presente", desc: "Apreciar los pequeños momentos, café caliente y calma interior." }
];

const TONES = [
  "Conmovedor y Tierno",
  "Sabio y Filosófico",
  "Directo y Revelador",
  "Poético y Calmo",
  "Esperanzador y Cálido"
];

interface GeneratedIdea {
  quote: string;
  highlight: string;
  visual_metaphor: string;
}

interface ReflectionResult {
  quote: string;
  highlight_word: string;
  metaphor_description: string;
  image_prompt: string;
  image_prompt_clean?: string;
  script_narration: string;
  soundtrack: string;
  hashtags: string[];
}

export default function ReflexionesIlustradasPage() {
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [tone, setTone] = useState(TONES[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [watermark, setWatermark] = useState("Chispas de Inspiración ♡");
  const [promptMode, setPromptMode] = useState<"with_text" | "clean">("with_text");
  const [showScript, setShowScript] = useState<boolean>(true);

  // Estados de generación
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<GeneratedIdea | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReflectionResult | null>(null);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { handleCopy: copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text, key);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    showToast("Copiado al portapapeles", "success");
  };

  // 1. Explorar ideas variadas
  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setResult(null);
    setGeneratedImage(null);
    try {
      const res = await aiFetch("/api/generate-illustration-reflection", {
        action: "ideas",
        category,
        customTopic,
        tone
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar ideas");
      setIdeas(data.ideas || []);
      showToast("¡Ideas frescas generadas!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al conectar", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // 2. Crear la reflexión completa (Prompt + Metáfora + Guion)
  const createReflection = async (customQuote?: string) => {
    setIsGenerating(true);
    setResult(null);
    setGeneratedImage(null);
    try {
      const res = await aiFetch("/api/generate-illustration-reflection", {
        action: "create",
        category,
        customTopic: customQuote || (selectedIdea ? selectedIdea.quote : customTopic),
        tone,
        watermarkText: watermark
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al redactar");
      setResult(data);
      showToast("¡Reflexión y metáfora visual creadas!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al generar reflexión", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Generar la imagen con IA directamente
  const generateImage = async (customP?: string) => {
    const activePrompt = customP || (promptMode === "clean" ? (result?.image_prompt_clean || result?.image_prompt) : result?.image_prompt);
    if (!activePrompt) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await aiFetch("/api/generate-image", {
        prompt: activePrompt,
        aspectRatio: "9:16"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando imagen");
      setGeneratedImage(data.imageBase64);
      showToast("¡Imagen ilustrada generada con éxito!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al generar imagen", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-pink-300 bg-clip-text text-transparent">
                Reflexiones Ilustradas
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Crea cómics y reflexiones tiernas y virales con metáforas visuales (Estilo Chispas de Inspiración).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Formato Viral TikTok / Reels
          </div>
        </div>

        {/* PASO 1: CONFIGURACIÓN Y TEMÁTICAS */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-bold text-white">1. Elige la Temática de la Reflexión</h2>
          </div>

          {/* Grid de Categorías con Metáforas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.label)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  category === cat.label
                    ? "bg-pink-500/10 border-pink-500/80 shadow-lg shadow-pink-500/10"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-sm text-white">{cat.label}</div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tono de la Reflexión
              </label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              >
                {TONES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Marca de Agua / Firma
              </label>
              <input
                type="text"
                value={watermark}
                onChange={e => setWatermark(e.target.value)}
                placeholder="Ej. Mi Página ♡"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tema Específico (Opcional)
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Ej. Dejar de stalkear al ex, amor propio..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={generateIdeas}
              disabled={isGeneratingIdeas || isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50"
            >
              {isGeneratingIdeas ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Buscando Metáforas e Ideas...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Proponer 4 Ideas Frescas</>
              )}
            </button>

            <button
              onClick={() => createReflection()}
              disabled={isGenerating || isGeneratingIdeas}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creando Reflexión Completa...</>
              ) : (
                <><Wand2 className="w-4 h-4 text-pink-400" /> Crear Directo (Sin Elegir Idea)</>
              )}
            </button>
          </div>
        </div>

        {/* PASO 2: SELECCIÓN DE IDEAS Y METÁFORAS PROPUESTAS */}
        {ideas.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Feather className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">2. Selecciona la Metáfora Visual que más te guste</h2>
              </div>
              <button
                onClick={generateIdeas}
                disabled={isGeneratingIdeas}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Otras ideas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedIdea(item);
                    createReflection(item.quote);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all text-left space-y-2.5 ${
                    selectedIdea?.quote === item.quote
                      ? "bg-pink-500/10 border-pink-500 shadow-lg shadow-pink-500/10"
                      : "bg-slate-950/80 border-slate-800 hover:border-pink-500/50"
                  }`}
                >
                  <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                    Idea #{idx + 1}
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    &quot;{item.quote}&quot;
                  </h3>
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-bold text-amber-400 block mb-0.5">🎨 Metáfora en la Imagen:</span>
                    {item.visual_metaphor}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Resaltar: <strong className="text-pink-300">{item.highlight}</strong></span>
                    <span className="text-pink-400 font-semibold group-hover:underline">Elegir y Generar →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: RESULTADO FINAL (FRASE, METÁFORA, PROMPT, GUION Y GENERADOR DE IMAGEN) */}
        {result && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Encabezado y Copiar Todo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-white">Reflexión Creada con Éxito</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy(result.script_narration, "script")}
                    className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-emerald-600/30 transition-all"
                  >
                    {copiedStates["script"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Mic className="w-3.5 h-3.5" /> Copiar Guion</>}
                  </button>
                  <button
                    onClick={() => handleCopy(result.image_prompt, "prompt")}
                    className="flex items-center gap-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-blue-600/30 transition-all"
                  >
                    {copiedStates["prompt"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><ImageIcon className="w-3.5 h-3.5" /> Copiar Prompt</>}
                  </button>
                  <button
                    onClick={() => handleCopy(result.hashtags.join(" "), "tags")}
                    className="flex items-center gap-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-purple-600/30 transition-all"
                  >
                    {copiedStates["tags"] ? <><Check className="w-3.5 h-3.5" /> Copiados</> : <><Hash className="w-3.5 h-3.5" /> Copiar Hashtags</>}
                  </button>
                </div>
              </div>

              {/* Tarjeta de la Frase Visual Principal */}
              <div className="bg-gradient-to-br from-pink-950/20 via-slate-950 to-slate-950 border-2 border-pink-500/30 rounded-2xl p-6 text-center space-y-4">
                <span className="text-[11px] font-black tracking-widest text-pink-400 uppercase block">
                  Texto para la Imagen (Parte Superior)
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-white leading-tight max-w-2xl mx-auto">
                  &quot;{result.quote}&quot;
                </p>
                <div className="inline-block bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold px-3 py-1 rounded-full">
                  Palabra resaltada con fondo pastel: <span>{result.highlight_word}</span>
                </div>
              </div>

              {/* Metáfora Visual Explicada */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Layers className="w-4 h-4" /> Metáfora Visual de la Escena
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.metaphor_description}
                </p>
              </div>

              {/* Selector de Modo: Con Frase Integrada vs Limpio sin Texto */}
              <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" /> Formato del Prompt de Imagen
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Elige si quieres que la IA escriba la frase directamente en la imagen o la cree limpia para editar en Canva/CapCut.
                    </p>
                  </div>

                  {/* Switch con o sin frase */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPromptMode("with_text")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        promptMode === "with_text"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ✨ Con Frase Integrada
                    </button>
                    <button
                      onClick={() => setPromptMode("clean")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        promptMode === "clean"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🖼️ Limpia (Sin Texto)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">
                    {promptMode === "with_text" ? "Prompt con Frase en la Imagen (Ideogram / Midjourney v6):" : "Prompt Limpio sin Letras (Espacio libre arriba):"}
                  </span>
                  <button
                    onClick={() => handleCopy(
                      promptMode === "with_text" ? result.image_prompt : (result.image_prompt_clean || result.image_prompt),
                      "active_prompt"
                    )}
                    className="text-xs text-blue-300 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                  >
                    {copiedStates["active_prompt"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Prompt {promptMode === "with_text" ? "con Frase" : "Limpio"}
                  </button>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed select-all border border-slate-800 max-h-48 overflow-y-auto">
                  {promptMode === "with_text" ? result.image_prompt : (result.image_prompt_clean || result.image_prompt)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <span>
                    {promptMode === "with_text" 
                      ? "💡 Ideal para Ideogram o DALL-E: Imprime la frase bonita en el tercio superior."
                      : "💡 Ideal para Canva, CapCut o Photoshop: Te da la imagen sin letras para poner tu propia tipografía."}
                  </span>
                  {result.image_prompt_clean && (
                    <button
                      onClick={() => handleCopy(result.image_prompt_clean!, "clean_copy")}
                      className="text-emerald-400 hover:underline"
                    >
                      {copiedStates["clean_copy"] ? "¡Copiado limpio!" : "Copiar versión limpia directa"}
                    </button>
                  )}
                </div>
              </div>

              {/* Generador de Imagen Directo con Botón */}
              <div className="border border-slate-800 rounded-2xl p-6 bg-slate-950/60 flex flex-col items-center gap-4">
                <button
                  onClick={() => generateImage()}
                  disabled={isGeneratingImage}
                  className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isGeneratingImage ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generando Ilustración con IA...</>
                  ) : (
                    <><ImageIcon className="w-5 h-5" /> Generar Ilustración Ahora ({promptMode === "with_text" ? "Con Frase" : "Limpia"})</>
                  )}
                </button>

                {generatedImage && (
                  <div className="w-full max-w-sm space-y-4 pt-4">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
                      <img
                        src={`data:image/jpeg;base64,${generatedImage}`}
                        alt="Reflexión Ilustrada"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <a
                      href={`data:image/jpeg;base64,${generatedImage}`}
                      download="reflexion_ilustrada.jpg"
                      className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 text-white flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors text-xs shadow-lg shadow-emerald-600/20"
                    >
                      <Download className="w-4 h-4" /> Descargar Imagen 9:16
                    </a>
                  </div>
                )}
              </div>

              {/* Guion de Locución para TikTok / Shorts (Plegable / Opcional) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Guion de Locución para Video Corto (20-30 seg)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowScript(!showScript)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
                    >
                      {showScript ? "Ocultar Guion" : "Mostrar Guion"}
                    </button>
                    {showScript && (
                      <button
                        onClick={() => handleCopy(result.script_narration, "script_block")}
                        className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedStates["script_block"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Guion
                      </button>
                    )}
                  </div>
                </div>

                {showScript && (
                  <>
                    <div className="bg-slate-900/90 rounded-xl p-4 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all border border-slate-800">
                      {result.script_narration}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                      <span><Music className="w-3.5 h-3.5 inline mr-1 text-amber-400" /><strong>Música recomendada:</strong> {result.soundtrack}</span>
                      <span><strong>Hashtags:</strong> {result.hashtags.join(" ")}</span>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
