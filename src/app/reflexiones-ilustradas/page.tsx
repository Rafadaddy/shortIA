"use client";

import { useState, useRef } from "react";
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
  Share2,
  ArrowDown,
  MessageSquareQuote,
  Film,
  Users2,
  PlaySquare
} from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

// Modos principales de la pantalla (Pestañas de expansión)
const MODES = [
  { id: "single", label: "🌟 Reflexión Individual", desc: "1 Imagen + Frase profunda + Guion narrado" },
  { id: "dialogue", label: "💬 Diálogo / Chat entre 2 Blobs", desc: "Conversación tierna entre 2 monigotes o mente vs corazón" },
  { id: "multiscene", label: "🎬 Reel Multiescena (Historia)", desc: "Secuencia de 3-4 escenas consecutivas para video/carrusel" }
];

const CATEGORIES = [
  { id: "ciclos", label: "💔 Cerrar Ciclos y Soltar", desc: "Superar el apego, despedidas sanas y aprender a dejar ir." },
  { id: "amor_propio", label: "🌱 Amor Propio y Límites", desc: "Poner límites con amor, no mendigar atención y valor propio." },
  { id: "errores", label: "🪨 Tropiezos y Perseverancia", desc: "Aprender de los errores sin castigarse, paciencia con el proceso." },
  { id: "madurez", label: "🧭 Madurez Emocional y Claridad", desc: "Elegir las batallas, no confundir a los demás y paz mental." },
  { id: "cansancio", label: "☕ Cansancio Adulto y Calma", desc: "Aprender a descansar sin renunciar, días difíciles y desconexión." },
  { id: "gratitud", label: "✨ Gratitud y Presente", desc: "Apreciar los pequeños momentos, café caliente y calma interior." }
];

const DIALOGUE_DYNAMICS = [
  { id: "amigos", label: "🤝 Amigos Incondicionales", desc: "Uno admite sentirse abrumado o triste y el otro lo reconforta con sabiduría." },
  { id: "pareja", label: "❤️ Pareja / Vínculo Sano", desc: "Momentos de vulnerabilidad mutua, afirmaciones de amor sincero y paz." },
  { id: "vocecita", label: "🧠 Monigote vs Vocecita Interior", desc: "El personaje hablando con su calma interior sobre no exigirse tanto." },
  { id: "tiempo", label: "⏳ Yo del Presente vs Yo del Pasado", desc: "Agradecerle al yo del pasado por haber resistido las tormentas." }
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

interface DialogueResult {
  title: string;
  dialogue_lines: Array<{ speaker: string; text: string }>;
  dialogue_text: string;
  metaphor_description: string;
  image_prompt: string;
  image_prompt_clean?: string;
  script_narration: string;
  soundtrack: string;
  hashtags: string[];
}

interface SceneItem {
  scene_number: number;
  slide_text: string;
  narration_snippet: string;
  image_prompt: string;
  image_prompt_clean?: string;
}

interface MultiSceneResult {
  title: string;
  scenes: SceneItem[];
  full_script: string;
  soundtrack: string;
  hashtags: string[];
}

export default function ReflexionesIlustradasPage() {
  const [activeTab, setActiveTab] = useState<"single" | "dialogue" | "multiscene">("single");

  // Configuración general
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [dialogueDynamic, setDialogueDynamic] = useState(DIALOGUE_DYNAMICS[0].label);
  const [sceneCount, setSceneCount] = useState<number>(3);
  const [tone, setTone] = useState(TONES[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [watermark, setWatermark] = useState("Chispas de Inspiración ♡");
  const [promptMode, setPromptMode] = useState<"with_text" | "clean">("with_text");
  const [showScript, setShowScript] = useState<boolean>(true);

  // Estados MODO 1: Individual
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<GeneratedIdea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReflectionResult | null>(null);

  // Estados MODO 2: Diálogo
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [dialogueResult, setDialogueResult] = useState<DialogueResult | null>(null);

  // Estados MODO 3: Multiescena
  const [isGeneratingMultiScene, setIsGeneratingMultiScene] = useState(false);
  const [multiSceneResult, setMultiSceneResult] = useState<MultiSceneResult | null>(null);

  // Estados de imágenes generadas con IA directa
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [multiSceneImages, setMultiSceneImages] = useState<Record<number, string>>({});
  const [generatingSceneIdx, setGeneratingSceneIdx] = useState<number | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { handleCopy: copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text, key);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    showToast("Copiado al portapapeles", "success");
  };

  // 1. MODO INDIVIDUAL: Explorar ideas
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

  // 2. MODO INDIVIDUAL: Crear reflexión
  const createReflection = async (customQuote?: string) => {
    setIsGenerating(true);
    setResult(null);
    setGeneratedImage(null);
    showToast("Creando reflexión, prompt y guion...");
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
      showToast("¡Reflexión creada con éxito!", "success");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e: any) {
      showToast(e.message || "Error al generar reflexión", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. MODO DIÁLOGO: Crear diálogo de 2 personajes
  const createDialogue = async () => {
    setIsGeneratingDialogue(true);
    setDialogueResult(null);
    setGeneratedImage(null);
    showToast("Creando diálogo entre personajes...");
    try {
      const res = await aiFetch("/api/generate-illustration-reflection", {
        action: "dialogue",
        dialogueDynamic,
        customTopic,
        tone,
        watermarkText: watermark
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al redactar diálogo");
      setDialogueResult(data);
      showToast("¡Diálogo y escena creados!", "success");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e: any) {
      showToast(e.message || "Error al crear diálogo", "error");
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  // 4. MODO MULTIESCENA: Crear historia/carrusel de 3-4 escenas
  const createMultiScene = async () => {
    setIsGeneratingMultiScene(true);
    setMultiSceneResult(null);
    setMultiSceneImages({});
    showToast("Creando historia secuencial multiescena...");
    try {
      const res = await aiFetch("/api/generate-illustration-reflection", {
        action: "multiscene",
        category,
        customTopic,
        tone,
        sceneCount,
        watermarkText: watermark
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al redactar escenas");
      setMultiSceneResult(data);
      showToast("¡Reel multiescena creado con éxito!", "success");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e: any) {
      showToast(e.message || "Error al crear multiescena", "error");
    } finally {
      setIsGeneratingMultiScene(false);
    }
  };

  // Generador de imagen individual
  const generateImage = async (customP?: string) => {
    const activePrompt = customP || (promptMode === "clean" 
      ? (activeTab === "dialogue" ? dialogueResult?.image_prompt_clean : result?.image_prompt_clean) 
      : (activeTab === "dialogue" ? dialogueResult?.image_prompt : result?.image_prompt));
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
      showToast("¡Ilustración generada con éxito!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al generar imagen", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generador de imagen para una escena específica del reel
  const generateSceneImage = async (prompt: string, sceneNum: number) => {
    if (!prompt) return;
    setGeneratingSceneIdx(sceneNum);
    try {
      const res = await aiFetch("/api/generate-image", {
        prompt,
        aspectRatio: "9:16"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando imagen");
      setMultiSceneImages(prev => ({ ...prev, [sceneNum]: data.imageBase64 }));
      showToast(`¡Escena #${sceneNum} generada!`, "success");
    } catch (e: any) {
      showToast(e.message || "Error al generar imagen", "error");
    } finally {
      setGeneratingSceneIdx(null);
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
                Cómics y reflexiones con el mismo personaje tierno minimalista (SAME CHARACTER LOCKED).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Formato Viral TikTok / Reels
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS / SUBMÓDULOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
          {MODES.map(m => {
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveTab(m.id as any);
                  setGeneratedImage(null);
                }}
                className={`p-3.5 rounded-xl text-left transition-all relative ${
                  isActive
                    ? "bg-gradient-to-r from-pink-600/30 to-rose-600/20 border border-pink-500/60 shadow-lg shadow-pink-600/10"
                    : "hover:bg-slate-900/60 text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <div className={`font-bold text-sm flex items-center gap-2 ${isActive ? "text-pink-300" : "text-slate-300"}`}>
                  {m.id === "single" && <HeartHandshake className="w-4 h-4 text-pink-400" />}
                  {m.id === "dialogue" && <Users2 className="w-4 h-4 text-amber-400" />}
                  {m.id === "multiscene" && <Film className="w-4 h-4 text-blue-400" />}
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* PESTAÑA 1: MODO REFLEXIÓN INDIVIDUAL (ORIGINAL INTACTO)   */}
        {/* ======================================================== */}
        {activeTab === "single" && (
          <>
            {/* CONFIGURACIÓN MODO 1 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Compass className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">1. Elige la Temática de la Reflexión</h2>
              </div>

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

            {/* SELECCIÓN DE IDEAS MODO 1 */}
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
                  {ideas.map((item, idx) => {
                    const isThisSelectedAndLoading = isGenerating && selectedIdea?.quote === item.quote;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isGenerating) return;
                          setSelectedIdea(item);
                          createReflection(item.quote);
                        }}
                        className={`cursor-pointer p-5 rounded-2xl border transition-all text-left space-y-2.5 relative overflow-hidden ${
                          selectedIdea?.quote === item.quote
                            ? "bg-pink-500/10 border-pink-500 shadow-lg shadow-pink-500/20 ring-2 ring-pink-500/30"
                            : "bg-slate-950/80 border-slate-800 hover:border-pink-500/50"
                        } ${isGenerating && selectedIdea?.quote !== item.quote ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                            Idea #{idx + 1}
                          </div>
                          {isThisSelectedAndLoading && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 bg-pink-500/20 px-2.5 py-1 rounded-full animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redactando...
                            </div>
                          )}
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
                          <span className={`font-semibold flex items-center gap-1 ${isThisSelectedAndLoading ? "text-pink-300" : "text-pink-400 group-hover:underline"}`}>
                            {isThisSelectedAndLoading ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Creando prompt y guion...</>
                            ) : (
                              <>Elegir y Generar →</>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BANNER DE CARGA */}
            {isGenerating && (
              <div className="bg-gradient-to-r from-pink-950/40 via-slate-900 to-indigo-950/40 border border-pink-500/40 rounded-3xl p-8 text-center space-y-3 animate-pulse shadow-2xl">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Creando tu Reflexión Ilustrada...
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Diseñando el prompt con el personaje blanco bloqueado, enmarcado elegante con contraste y guion de locución.
                </p>
              </div>
            )}

            {/* RESULTADO MODO 1 */}
            {result && (
              <div ref={resultRef} className="space-y-6 scroll-mt-24">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                  
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

                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Layers className="w-4 h-4" /> Metáfora Visual de la Escena
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {result.metaphor_description}
                    </p>
                  </div>

                  {/* Switch con o sin frase */}
                  <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-400" /> Formato del Prompt de Imagen
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Elige si quieres que la IA escriba la frase directamente en la imagen o la cree limpia.
                        </p>
                      </div>

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
                        {promptMode === "with_text" ? "Prompt con Frase Bicolor (Ideogram / Midjourney v6):" : "Prompt Limpio sin Letras:"}
                      </span>
                      <button
                        onClick={() => handleCopy(
                          promptMode === "with_text" ? result.image_prompt : (result.image_prompt_clean || result.image_prompt),
                          "active_prompt"
                        )}
                        className="text-xs text-blue-300 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                      >
                        {copiedStates["active_prompt"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Prompt
                      </button>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed select-all border border-slate-800 max-h-48 overflow-y-auto">
                      {promptMode === "with_text" ? result.image_prompt : (result.image_prompt_clean || result.image_prompt)}
                    </div>
                  </div>

                  {/* Generador de Imagen Directo */}
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

                  {/* Guion de Locución Opcional */}
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
                          <span><Music className="w-3.5 h-3.5 inline mr-1 text-amber-400" /><strong>Música:</strong> {result.soundtrack}</span>
                          <span><strong>Hashtags:</strong> {result.hashtags.join(" ")}</span>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: MODO DIÁLOGO / CHAT ENTRE 2 PERSONAJES BLOB   */}
        {/* ======================================================== */}
        {activeTab === "dialogue" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Users2 className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Configura el Diálogo entre 2 Personajes</h2>
              </div>

              {/* Dinámicas de diálogo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIALOGUE_DYNAMICS.map(dyn => (
                  <button
                    key={dyn.id}
                    onClick={() => setDialogueDynamic(dyn.label)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      dialogueDynamic === dyn.label
                        ? "bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{dyn.label}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{dyn.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tono de la Conversación
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {TONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tema o Dilema Específico (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    placeholder="Ej. Sentir que no encajas, miedo al futuro..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={createDialogue}
                disabled={isGeneratingDialogue}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                {isGeneratingDialogue ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Escribiendo diálogo y escena...</>
                ) : (
                  <><MessageSquareQuote className="w-4 h-4" /> Generar Diálogo Ilustrado de 2 Personajes</>
                )}
              </button>
            </div>

            {/* RESULTADO DIÁLOGO */}
            {dialogueResult && (
              <div ref={resultRef} className="space-y-6 scroll-mt-24">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                        💬 Conversación Tierna Ilustrada
                      </span>
                      <h2 className="text-xl font-bold text-white">{dialogueResult.title}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopy(dialogueResult.dialogue_text, "dial_text")}
                        className="flex items-center gap-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-amber-600/30 transition-all"
                      >
                        {copiedStates["dial_text"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar Diálogo</>}
                      </button>
                      <button
                        onClick={() => handleCopy(dialogueResult.script_narration, "dial_script")}
                        className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-emerald-600/30 transition-all"
                      >
                        {copiedStates["dial_script"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Mic className="w-3.5 h-3.5" /> Copiar Guion</>}
                      </button>
                      <button
                        onClick={() => handleCopy(dialogueResult.image_prompt, "dial_prompt")}
                        className="flex items-center gap-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-blue-600/30 transition-all"
                      >
                        {copiedStates["dial_prompt"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><ImageIcon className="w-3.5 h-3.5" /> Copiar Prompt</>}
                      </button>
                      <button
                        onClick={() => handleCopy(dialogueResult.hashtags.join(" "), "dial_tags")}
                        className="flex items-center gap-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-purple-600/30 transition-all"
                      >
                        {copiedStates["dial_tags"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Hash className="w-3.5 h-3.5" /> Copiar Hashtags</>}
                      </button>
                    </div>
                  </div>

                  {/* Líneas de chat visual */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Líneas del Diálogo
                    </span>
                    <div className="space-y-2.5">
                      {dialogueResult.dialogue_lines.map((dl, idx) => (
                        <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${idx % 2 === 0 ? "bg-slate-900/80 border border-slate-800" : "bg-amber-950/20 border border-amber-500/20"}`}>
                          <span className="text-xs font-bold text-amber-400 shrink-0 mt-0.5">
                            {dl.speaker}:
                          </span>
                          <span className="text-sm text-slate-200 font-medium">
                            &quot;{dl.text}&quot;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metáfora Visual de la escena */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Layers className="w-4 h-4" /> Interacción Visual de Ambos Personajes
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {dialogueResult.metaphor_description}
                    </p>
                  </div>

                  {/* Switch con o sin texto integrado en Diálogo */}
                  <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-400" /> Formato del Prompt de Imagen
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {promptMode === "clean" 
                            ? "✨ Ideal para reels con guion narrado: Imagen limpia y cinematográfica sin textos." 
                            : "Incluye el texto del diálogo renderizado directamente en la imagen."}
                        </p>
                      </div>

                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setPromptMode("clean")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            promptMode === "clean"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          🖼️ Limpia (Sin Texto / Para Guion)
                        </button>
                        <button
                          onClick={() => setPromptMode("with_text")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            promptMode === "with_text"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          💬 Con Texto Integrado
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300">
                        {promptMode === "clean" ? "Prompt Limpio sin Letras (Perfecto para narración):" : "Prompt con Diálogo Integrado:"}
                      </span>
                      <button
                        onClick={() => handleCopy(
                          promptMode === "clean" ? (dialogueResult.image_prompt_clean || dialogueResult.image_prompt) : dialogueResult.image_prompt,
                          "dial_prompt_code"
                        )}
                        className="text-xs text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedStates["dial_prompt_code"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Prompt {promptMode === "clean" ? "Limpio" : "con Texto"}
                      </button>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed select-all border border-slate-800 max-h-48 overflow-y-auto">
                      {promptMode === "clean" ? (dialogueResult.image_prompt_clean || dialogueResult.image_prompt) : dialogueResult.image_prompt}
                    </div>
                  </div>

                  {/* Guion y Audio sugerido para el Diálogo */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Guion de Locución / Actuación de Voces
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCopy(dialogueResult.script_narration, "dial_script_footer")}
                        className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedStates["dial_script_footer"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Guion
                      </button>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-4 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all border border-slate-800">
                      {dialogueResult.script_narration}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                      <span><Music className="w-3.5 h-3.5 inline mr-1 text-amber-400" /><strong>Música sugerida:</strong> {dialogueResult.soundtrack}</span>
                      <div className="flex items-center gap-2">
                        <span><strong>Hashtags:</strong> {dialogueResult.hashtags.join(" ")}</span>
                        <button
                          onClick={() => handleCopy(dialogueResult.hashtags.join(" "), "dial_tags_footer")}
                          className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 ml-1"
                        >
                          {copiedStates["dial_tags_footer"] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Generar Imagen */}
                  <div className="border border-slate-800 rounded-2xl p-6 bg-slate-950/60 flex flex-col items-center gap-4">
                    <button
                      onClick={() => generateImage(dialogueResult.image_prompt)}
                      disabled={isGeneratingImage}
                      className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 hover:from-amber-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Generando Ilustración con IA...</>
                      ) : (
                        <><ImageIcon className="w-5 h-5" /> Generar Ilustración de los 2 Personajes (9:16)</>
                      )}
                    </button>

                    {generatedImage && (
                      <div className="w-full max-w-sm space-y-4 pt-4">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
                          <img
                            src={`data:image/jpeg;base64,${generatedImage}`}
                            alt="Diálogo Ilustrado"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                        <a
                          href={`data:image/jpeg;base64,${generatedImage}`}
                          download="dialogo_ilustrado.jpg"
                          className="w-full py-2.5 rounded-xl font-bold bg-amber-600 text-white flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors text-xs shadow-lg shadow-amber-600/20"
                        >
                          <Download className="w-4 h-4" /> Descargar Imagen 9:16
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: MODO REEL MULTIESCENA / MINI HISTORIA         */}
        {/* ======================================================== */}
        {activeTab === "multiscene" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Film className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Configura el Reel Multiescena (Historia en Secuencia)</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Cantidad de Escenas
                    </label>
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      {sceneCount} prompts & imágenes
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1.5">
                    {[3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSceneCount(num)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 ${
                          sceneCount === num
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <span className="text-sm font-black">{num}</span>
                        <span className="text-[9px] opacity-80">esc</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tono del Reel
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {TONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tema o Viaje Emocional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    placeholder="Ej. Dejar de sobrepensar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={createMultiScene}
                disabled={isGeneratingMultiScene}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isGeneratingMultiScene ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Escribiendo secuencia de {sceneCount} escenas...</>
                ) : (
                  <><PlaySquare className="w-4 h-4" /> Generar Reel de {sceneCount} Escenas Consecutivas ({sceneCount} Prompts)</>
                )}
              </button>
            </div>

            {/* RESULTADO MULTIESCENA */}
            {multiSceneResult && (
              <div ref={resultRef} className="space-y-6 scroll-mt-24">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                        🎬 Historia en Secuencia ({multiSceneResult.scenes.length} Escenas Generadas)
                      </span>
                      <h2 className="text-xl font-bold text-white">{multiSceneResult.title}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopy(multiSceneResult.full_script, "multi_script")}
                        className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-emerald-600/30 transition-all"
                      >
                        {copiedStates["multi_script"] ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Mic className="w-3.5 h-3.5" /> Copiar Guion</>}
                      </button>
                      <button
                        onClick={() => {
                          const allPrompts = multiSceneResult.scenes.map(s => {
                            const p = promptMode === "clean" ? (s.image_prompt_clean || s.image_prompt) : s.image_prompt;
                            return `--- ESCENA #${s.scene_number} (${promptMode === "clean" ? "LIMPIO SIN TEXTO" : "CON TEXTO"}) ---\n${p}`;
                          }).join("\n\n");
                          handleCopy(allPrompts, "all_scene_prompts");
                        }}
                        className="flex items-center gap-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-blue-600/30 transition-all"
                      >
                        {copiedStates["all_scene_prompts"] ? <><Check className="w-3.5 h-3.5" /> Copiados</> : <><ImageIcon className="w-3.5 h-3.5" /> Copiar Todos los Prompts ({promptMode === "clean" ? "Limpios" : "Con Texto"})</>}
                      </button>
                      <button
                        onClick={() => handleCopy(multiSceneResult.hashtags.join(" "), "multi_tags")}
                        className="flex items-center gap-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold py-2 px-3 rounded-xl hover:bg-purple-600/30 transition-all"
                      >
                        {copiedStates["multi_tags"] ? <><Check className="w-3.5 h-3.5" /> Copiados</> : <><Hash className="w-3.5 h-3.5" /> Copiar Hashtags</>}
                      </button>
                    </div>
                  </div>

                  {/* Selector de modo de prompt: Limpio (sin letras para guion) vs Con Texto */}
                  <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        Estilo de las Imágenes para el Reel
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {promptMode === "clean"
                          ? "✨ Recomendado: Imágenes 100% limpias sin letras ni tipografía, donde la fuerza y emoción recaen en el guion de voz."
                          : "Imágenes con la frase/subtítulo renderizada en la parte superior."}
                      </p>
                    </div>

                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        onClick={() => setPromptMode("clean")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          promptMode === "clean"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🖼️ Limpias (Sin Letras / Para Guion)
                      </button>
                      <button
                        onClick={() => setPromptMode("with_text")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          promptMode === "with_text"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        📝 Con Texto Integrado
                      </button>
                    </div>
                  </div>

                  {/* Grid de Escenas Consecutivas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {multiSceneResult.scenes.map((scene) => {
                      const activeScenePrompt = promptMode === "clean" ? (scene.image_prompt_clean || scene.image_prompt) : scene.image_prompt;

                      return (
                        <div key={scene.scene_number} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                Escena #{scene.scene_number}
                              </span>
                              <button
                                onClick={() => handleCopy(activeScenePrompt, `scene_prompt_${scene.scene_number}`)}
                                className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1"
                              >
                                {copiedStates[`scene_prompt_${scene.scene_number}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Prompt {promptMode === "clean" ? "Limpio" : ""}
                              </button>
                            </div>

                            <div className="text-xs text-slate-200 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase block tracking-wider">
                                🗣️ Narración de esta escena:
                              </span>
                              <p className="font-medium italic leading-relaxed">
                                &quot;{scene.narration_snippet}&quot;
                              </p>
                            </div>

                            {promptMode === "with_text" && (
                              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Texto en Imagen:</span>
                                <p className="text-xs font-bold text-white leading-snug">
                                  &quot;{scene.slide_text}&quot;
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Generador individual de esta escena */}
                          <div className="pt-2 border-t border-slate-800 space-y-3">
                            <button
                              onClick={() => generateSceneImage(activeScenePrompt, scene.scene_number)}
                              disabled={generatingSceneIdx === scene.scene_number}
                              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                            >
                              {generatingSceneIdx === scene.scene_number ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                              ) : (
                                <><ImageIcon className="w-3.5 h-3.5" /> Generar #{scene.scene_number} ({promptMode === "clean" ? "Limpia" : "con Texto"})</>
                              )}
                            </button>

                          {multiSceneImages[scene.scene_number] && (
                            <div className="space-y-2">
                              <img
                                src={`data:image/jpeg;base64,${multiSceneImages[scene.scene_number]}`}
                                alt={`Escena ${scene.scene_number}`}
                                className="w-full h-auto rounded-xl border border-slate-700 shadow-lg"
                              />
                              <a
                                href={`data:image/jpeg;base64,${multiSceneImages[scene.scene_number]}`}
                                download={`escena_${scene.scene_number}.jpg`}
                                className="w-full py-1.5 rounded-lg font-bold bg-emerald-600 text-white flex items-center justify-center gap-1 text-[11px]"
                              >
                                <Download className="w-3.5 h-3.5" /> Descargar #{scene.scene_number}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Guion completo */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Guion Completo para Narración Continua del Reel
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCopy(multiSceneResult.full_script, "multi_script_btn")}
                        className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedStates["multi_script_btn"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copiar Guion
                      </button>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-4 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all border border-slate-800">
                      {multiSceneResult.full_script}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                      <span><Music className="w-3.5 h-3.5 inline mr-1 text-amber-400" /><strong>Música sugerida:</strong> {multiSceneResult.soundtrack}</span>
                      <div className="flex items-center gap-2">
                        <span><strong>Hashtags:</strong> {multiSceneResult.hashtags.join(" ")}</span>
                        <button
                          onClick={() => handleCopy(multiSceneResult.hashtags.join(" "), "multi_tags_footer")}
                          className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 ml-1"
                        >
                          {copiedStates["multi_tags_footer"] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
