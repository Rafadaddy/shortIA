"use client";

import { useState } from "react";
import { 
  Flame, Loader2, Play, Check, Copy, RefreshCw, Wand2, 
  Type, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp,
  Sliders, Music, Hash, Video, Eye, Film
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface Scene {
  scene_number: number;
  narration: string;
  visual_concept: string;
  image_prompt: string;
  animation_prompt: string;
  duration: string;
}

interface VideoData {
  title: string;
  full_narration: string;
  scenes: Scene[];
  caption: string;
  music_recommendation: string;
  hashtags: string[];
}

interface MotivationalIdea {
  title: string;
  hook: string;
  focus: string;
}

const motivationalNiches = [
  "🎲 Aleatorio / Sorpréndeme",
  "🦁 Desarrollo Personal y Mente Imparable",
  "⚡ Disciplina y Hábitos Diarios (Modo Guerra)",
  "🧗 Superar el Miedo al Fracaso y Resiliencia",
  "🧠 Salud Mental, Ansiedad y Autoestima",
  "💰 Mentalidad de Riqueza y Enfoque Financiero",
  "💔 Desamor, Sanación y Amor Propio",
  "🎯 Productividad, Cero Excusas y Enfoque Láser",
  "🔥 Soledad, Fortaleza Interior y Silencio",
  "⏳ El Tiempo, Arrepentimiento y Urgencia de Vivir",
  "✝️ Reflexión Cristiana, Fe y Oración",
  "📖 Sabiduría Bíblica y Propósito Espiritual",
  "✏️ Escribir mi propio nicho personalizado..."
];

const QUICK_NICHES = [
  { label: "🦁 Disciplina", value: "⚡ Disciplina y Hábitos Diarios (Modo Guerra)" },
  { label: "🧠 Mentalidad", value: "🦁 Desarrollo Personal y Mente Imparable" },
  { label: "💰 Riqueza", value: "💰 Mentalidad de Riqueza y Enfoque Financiero" },
  { label: "💔 Amor Propio", value: "💔 Desamor, Sanación y Amor Propio" },
  { label: "✝️ Fe Cristiana", value: "✝️ Reflexión Cristiana, Fe y Oración" },
  { label: "🎲 Sorpréndeme", value: "🎲 Aleatorio / Sorpréndeme" }
];

const toneOptions = [
  "Emotivo y Profundo (Inspiracional)",
  "Crudo y Directo (Verdades incómodas sin filtro)",
  "Épico y Heroico (Cinematográfico)",
  "Reflexivo y Filosófico (Estoicismo)",
  "Agresivo y Desafiante (Estilo Gym / Disciplina)",
  "Esperanzador y Espiritual (Fe y Paz)"
];

const styleOptions = [
  "Cinemático Oscuro (Sombras dramáticas, luz dorada)",
  "Paisajes Épicos (Naturaleza majestuosa, vistas aéreas)",
  "Urbano / Calle (Luces de noche, asfalto, estética callejera)",
  "Minimalista (Elegante, fondos limpios, sujeto centrado)",
  "Natural / Bosque (Niebla, rayos de sol entre árboles)",
  "Noir / Blanco y Negro (Alto contraste, elegante)",
  "Colorido / Vibrante (Tonos vivos, energizante)",
  "Que la IA decida el mejor estilo"
];

const durationOptions = ["5 Segundos", "10 Segundos", "15 Segundos", "20 Segundos"];

export default function MotivationalVideos() {
  const [selectedNicheOption, setSelectedNicheOption] = useState(motivationalNiches[0]);
  const [customNiche, setCustomNiche] = useState("");

  const [tone, setTone] = useState(toneOptions[0]);
  const [style, setStyle] = useState(styleOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [sceneCount, setSceneCount] = useState<number>(5);

  const [ideas, setIdeas] = useState<MotivationalIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<MotivationalIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<VideoData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Escena activa o colapsada en acordeón
  const [activeSceneTab, setActiveSceneTab] = useState<number | null>(null);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const getEffectiveNiche = () => {
    if (selectedNicheOption === "✏️ Escribir mi propio nicho personalizado...") {
      return customNiche.trim() || "Desarrollo personal y motivación";
    }
    if (selectedNicheOption.startsWith("🎲")) {
      return "Desarrollo personal, disciplina y lecciones de vida";
    }
    return selectedNicheOption;
  };

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);

    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ideas", niche: getEffectiveNiche() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar ideas");
      }
      const json = await res.json();
      setIdeas(json.ideas);
      showToast("¡Ideas virales generadas con éxito!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al conectar con la IA", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: MotivationalIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "script_only",
          niche: getEffectiveNiche(),
          idea: idea.hook,
          tone,
          sceneCount
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar el guion");
      }
      const json = await res.json();
      setScriptText(json.script);
      showToast("Guion narrativo generado. Puedes afinarlo a tu gusto.", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al conectar con la IA", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "improve_script",
          current_script: scriptText,
          instruction
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al modificar el guion");
      }
      const json = await res.json();
      setScriptText(json.script);
      showToast("Guion actualizado.", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al conectar con la IA", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    setData(null);

    try {
      const res = await fetch("/api/generate-motivational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full_from_script",
          current_script: scriptText,
          style,
          duration,
          sceneCount
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al generar escenas");
      }
      const json = await res.json();
      setData(json);
      showToast("¡Escenas y prompts generados!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al conectar con la IA", "error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    let text = `🎬 TÍTULO: ${data.title}\n\n`;
    text += `🗣️ NARRACIÓN COMPLETA:\n${data.full_narration}\n\n`;
    text += `------------------------------------\n\n`;
    data.scenes.forEach((s) => {
      text += `🎞️ ESCENA ${s.scene_number} (${s.duration})\n`;
      text += `🎙️ Voz: ${s.narration}\n`;
      text += `👁️ Visual: ${s.visual_concept}\n`;
      text += `🎨 Prompt Imagen: ${s.image_prompt}\n`;
      text += `✨ Prompt Video/Cámara: ${s.animation_prompt}\n\n`;
    });
    text += `📝 Caption: ${data.caption}\n`;
    text += `🎵 Música sugerida: ${data.music_recommendation}\n`;
    text += `# Hashtags: ${data.hashtags?.join(" ") || ""}`;
    handleCopy(text, "all");
    showToast("Guion técnico completo copiado al portapapeles.", "success");
  };

  const handleCopyMetadata = () => {
    if (!data) return;
    let text = `🎵 Música recomendada: ${data.music_recommendation}\n\n`;
    text += `${data.caption}\n\n`;
    text += data.hashtags ? data.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(" ") : "";
    handleCopy(text, "metadata");
    showToast("Caption y música copiados.", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        {/* HEADER */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" /> Flujo Profesional Paso a Paso
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            Videos Motivacionales Virales
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            1. Elige una temática e idea. 2. Afina tu guion narrativo. 3. Genera escenas y prompts limpios para Midjourney, Runway o Kling.
          </p>
        </header>

        {/* PASO 1: CONFIGURACIÓN E IDEAS */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-amber-500/30">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Configuración del Nicho y Formato</h2>
                <p className="text-xs text-slate-400">Elige la temática y el tono para conectar con tu audiencia</p>
              </div>
            </div>
            <Sliders className="w-5 h-5 text-amber-400/80" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nicho / Temática */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Nicho / Temática</span>
                <span className="text-[11px] text-amber-400/80 font-normal">Despliega para elegir</span>
              </label>
              <select
                value={selectedNicheOption}
                onChange={(e) => setSelectedNicheOption(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm font-medium"
              >
                {motivationalNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              {selectedNicheOption === "✏️ Escribir mi propio nicho personalizado..." && (
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="Ej. Estoicismo para jóvenes emprendedores..."
                  className="w-full bg-slate-950 border border-amber-500/60 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
                  autoFocus
                />
              )}

              {/* Accesos rápidos */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">Rápidos:</span>
                {QUICK_NICHES.map((chip) => (
                  <button
                    type="button"
                    key={chip.label}
                    onClick={() => setSelectedNicheOption(chip.value)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      selectedNicheOption === chip.value
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tono Emocional */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Tono Emocional</label>
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)} 
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm font-medium"
              >
                {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Duración por escena */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Ritmo / Duración por Escena</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm font-medium"
              >
                {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Número de Escenas */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Número de Escenas ({sceneCount * (parseInt(duration) || 10)} seg aprox.)
                </label>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {sceneCount} Escenas
                </span>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-700/60 rounded-xl px-4 py-3">
                <input 
                  type="range" 
                  min="3" 
                  max="10" 
                  value={sceneCount} 
                  onChange={(e) => setSceneCount(parseInt(e.target.value))} 
                  className="w-full accent-amber-500 cursor-pointer" 
                />
              </div>
            </div>

          </div>

          <button 
            onClick={generateIdeas} 
            disabled={isGeneratingIdeas} 
            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 text-base"
          >
            {isGeneratingIdeas ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creando 8 ideas potentes...</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Generar 8 Ideas Virales de Alto Impacto</>
            )}
          </button>

          {/* DESPLIEGUE ELEGANTE DE LAS 8 IDEAS VIRALES */}
          {ideas && ideas.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Selecciona la idea que más te guste:
                </h3>
                <span className="text-xs text-slate-400">Toca una opción para redactar el guion</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ideas.map((idea, idx) => {
                  const isSelected = selectedIdea?.title === idea.title;
                  return (
                    <button 
                      key={idx} 
                      onClick={() => selectIdeaAndGenerateScript(idea)} 
                      disabled={isGeneratingScript} 
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 group relative flex flex-col justify-between ${
                        isSelected 
                          ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10" 
                          : "bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90"
                      } disabled:opacity-50`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                            Opción {idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-500 group-hover:text-amber-400/80 transition-colors">
                            Seleccionar →
                          </span>
                        </div>
                        <p className="font-bold text-white group-hover:text-amber-200 text-sm leading-snug mb-1.5">
                          {idea.title}
                        </p>
                        <p className="text-xs text-slate-300 italic mb-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                          &quot;{idea.hook}&quot;
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Enfoque:</strong> {idea.focus}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PASO 2: GUION NARRATIVO */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-slate-950 w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-amber-500/30">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Guion Narrativo Completo</h2>
                  <p className="text-xs text-slate-400">Edítalo libremente o usa los botones de mejora rápida</p>
                </div>
              </div>
              <Type className="w-5 h-5 text-amber-400/80" />
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-sm font-medium">Escribiendo un guion directo y envolvente...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-56 bg-slate-950/80 border border-slate-700/60 rounded-2xl p-4 text-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none resize-none leading-relaxed text-sm font-medium"
                />
                
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => improveScript("Hazlo más largo, profundo y detallado")} 
                    disabled={isGeneratingScript} 
                    className="flex-1 min-w-[140px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Type className="w-3.5 h-3.5 text-amber-400" />} Más largo y profundo
                  </button>
                  <button 
                    onClick={() => improveScript("Hazlo más corto, contundente y ve directo al punto")} 
                    disabled={isGeneratingScript} 
                    className="flex-1 min-w-[140px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Type className="w-3.5 h-3.5 text-amber-400" />} Más corto y directo
                  </button>
                  <button 
                    onClick={() => improveScript("Reescríbelo con un giro provocador y diferente pero manteniendo el mensaje")} 
                    disabled={isGeneratingScript} 
                    className="flex-1 min-w-[140px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-amber-400" />} Cambiar Enfoque
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: CONFIGURACIÓN DE ESTILO Y PROMPTS */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-slate-950 w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-amber-500/30">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Generar Escenas y Prompts</h2>
                  <p className="text-xs text-slate-400">Divide el guion en tomas cinematográficas con prompts listos</p>
                </div>
              </div>
              <Film className="w-5 h-5 text-amber-400/80" />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Estilo Visual Cinematográfico</label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)} 
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm font-medium"
              >
                {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button 
              onClick={generateFullVideo} 
              disabled={isGeneratingVideo} 
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 text-base"
            >
              {isGeneratingVideo ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Diseñando tomas y prompts limpios...</>
              ) : (
                <><ImageIcon className="w-5 h-5" /> Dividir Guion y Generar Prompts</>
              )}
            </button>
          </div>
        )}

        {/* PASO 4: RESULTADO FINAL (LISTA DESPLEGABLE Y LIMPIA) */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
              
              {/* Encabezado del resultado */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-white mb-1.5">{data.title}</h2>
                  <p className="text-slate-400 text-xs flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-amber-500" /> {data.scenes.length} escenas estructuradas con prompts limpios
                  </p>
                </div>
                <button 
                  onClick={handleCopyAll} 
                  className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 py-2.5 px-4 rounded-xl text-xs font-bold transition-all"
                >
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> ¡Todo Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Guion Completo</>}
                </button>
              </div>

              {/* LISTA ORDENADA DE ESCENAS (DESPLIEGUE MODERNO) */}
              <div className="space-y-4">
                {data.scenes.map((scene, idx) => {
                  const isOpen = activeSceneTab === idx || activeSceneTab === null;
                  return (
                    <div 
                      key={scene.scene_number} 
                      className="bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden transition-all duration-200"
                    >
                      {/* Barra superior de la escena (Clicable para colapsar/expandir) */}
                      <div 
                        onClick={() => setActiveSceneTab(activeSceneTab === idx ? -1 : idx)}
                        className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                            Escena {scene.scene_number}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            ⏱️ {scene.duration}
                          </span>
                          <p className="hidden md:block text-xs text-slate-300 font-medium max-w-md truncate italic">
                            &quot;{scene.narration}&quot;
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {isOpen ? "Ocultar" : "Ver detalles"}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Contenido expandible de la escena */}
                      {isOpen && (
                        <div className="px-4 pb-5 md:px-5 space-y-4 border-t border-slate-800/60 pt-4">
                          
                          {/* Narración */}
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                🎙️ Voz en Off / Narración:
                              </span>
                              <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                                &quot;{scene.narration}&quot;
                              </p>
                            </div>
                            <button 
                              onClick={() => handleCopy(scene.narration, `narration_${idx}`)} 
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg shrink-0 transition-colors"
                              title="Copiar narración"
                            >
                              {copiedStates[`narration_${idx}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Concepto visual en pantalla */}
                          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-purple-400" /> Acción en Pantalla:
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {scene.visual_concept}
                            </p>
                          </div>

                          {/* Grid de Prompts para IA (Limpio y legible) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                            
                            {/* Prompt de Imagen */}
                            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5" /> Prompt Imagen (Midjourney / DALL-E)
                                </span>
                                <button 
                                  onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)} 
                                  className="text-xs bg-slate-800 hover:bg-slate-700 text-pink-300 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                                >
                                  {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedStates[`img_${idx}`] ? "Copiado" : "Copiar"}</span>
                                </button>
                              </div>
                              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 select-all">
                                {scene.image_prompt}
                              </p>
                            </div>

                            {/* Prompt de Animación */}
                            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5" /> Prompt Video (Runway / Kling / Luma)
                                </span>
                                <button 
                                  onClick={() => handleCopy(scene.animation_prompt, `anim_${idx}`)} 
                                  className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                                >
                                  {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedStates[`anim_${idx}`] ? "Copiado" : "Copiar"}</span>
                                </button>
                              </div>
                              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 select-all">
                                {scene.animation_prompt}
                              </p>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* METADATA PARA REDES SOCIALES */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Datos de Publicación Listos
                  </h3>
                  <button 
                    onClick={handleCopyMetadata} 
                    className="text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                  >
                    {copiedStates['metadata'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Caption + Música</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" /> Música Sugerida
                    </span>
                    <p className="text-xs text-slate-300 italic">{data.music_recommendation}</p>
                  </div>
                  <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 space-y-1.5">
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Caption / Pie de Foto
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{data.caption}</p>
                  </div>
                  <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 space-y-1.5">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" /> Hashtags
                    </span>
                    <p className="text-xs text-slate-300 font-medium">{data.hashtags?.join(" ")}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
