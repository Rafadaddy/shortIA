"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Play, 
  Loader2, 
  Wand2, 
  TrendingUp, 
  Video, 
  Mic, 
  Layers, 
  Download,
  Volume2,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";
import { saveMediaItem } from "@/lib/db";
import { saveHistoryItem } from "@/lib/history-storage";

interface TigerIdea {
  title: string;
  hook: string;
  pain_point: string;
  why_it_works: string;
}

interface TigerImagePrompt {
  step?: string;
  version: string;
  metaphor?: string;
  prompt: string;
}

interface TigerVideoPrompt {
  step?: string;
  version: string;
  camera: string;
  motion: string;
  particles: string;
  prompt: string;
}

interface TigerCombination {
  format?: string;
  structure?: string;
  hook_formula?: string;
  palette?: string;
  scene_environments?: string[];
}

interface TigerData {
  title: string;
  theme: string;
  style: string;
  combination?: TigerCombination;
  image_prompts: TigerImagePrompt[];
  video_prompts: TigerVideoPrompt[];
  script_audio: {
    hook_3s: string;
    problem_15s: string;
    solution_20s: string;
    cta_final: string;
    full_speech: string;
    overlays: string[];
  };
}

const TIGER_TOPICS = [
  "¿Por qué no te alcanza la quincena aunque ganas bien?",
  "La trampa mortal de pagar solo el mínimo de la tarjeta",
  "Gastos hormiga que te roban $3,000 pesos cada mes",
  "La diferencia psicológica entre ser rico y verse rico",
  "Cómo ahorrar tu primer fondo de paz mental de $10,000",
  "El error de ahorrar en el banco en vez de invertir en CETES",
  "Compras emocionales: por qué compras cosas que no necesitas"
];

const TIGER_STYLES = [
  { id: "Motivacional", label: "🔥 Motivacional", desc: "Directo, energético, tú puedes y mentalidad de logro." },
  { id: "Educativo", label: "📚 Educativo", desc: "Paso a paso, datos concretos y explicación clara." },
  { id: "Polémico", label: "⚡ Polémico", desc: "Te mintieron, nadie te dijo esto y romper mitos." },
  { id: "Historia Personal", label: "🤝 Historia Personal", desc: "A mí me pasó, yo también cometí ese error." }
];

export const TIGER_VOICE_OPTIONS = [
  { id: "es-MX", label: "🇲🇽 Jorge / Rafa Daddy (México)", desc: "Español de México, ideal para el Tigre Financiero" },
  { id: "es-US", label: "🇺🇸 Neutro / Internacional", desc: "Español neutro sin acento regional marcado" },
  { id: "es-ES", label: "🇪🇸 Peninsular (España)", desc: "Castellano europeo" },
];

export default function TigreFinancieroPage() {
  const [topic, setTopic] = useState("¿Por qué no te alcanza la quincena aunque ganas bien?");
  const [style, setStyle] = useState("Motivacional");
  const [selectedVoice, setSelectedVoice] = useState("es-MX");
  
  const [ideas, setIdeas] = useState<TigerIdea[] | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [data, setData] = useState<TigerData | null>(null);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);

  // Estados de audio
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  // 1. Proponer ideas
  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setData(null);
    setAudioBase64(null);
    try {
      const res = await aiFetch("/api/generate-tiger", { mode: "ideas", topic, tone: style });
      if (!res.ok) throw new Error("Error generando ideas");
      const json = await res.json();
      setIdeas(json.ideas);
      showToast("¡5 Ideas con gancho listas!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // 2. Generar el pack completo V3 (5 prompts imagen + 5 prompts video + guion V3)
  const generateFullPack = async (customTopic?: string) => {
    setIsGeneratingFull(true);
    setData(null);
    setAudioBase64(null);
    const activeTopic = customTopic || topic;
    showToast("Generando 5 Prompts de Imagen, 5 de Video y Guion V3...");
    try {
      const res = await aiFetch("/api/generate-tiger", {
        mode: "generate_full_v3",
        topic: activeTopic,
        tone: style
      });
      if (!res.ok) throw new Error("Error en la generación");
      const json: TigerData = await res.json();
      setData(json);
      showToast("¡Pack completo de Rafa Daddy generado con éxito!", "success");

      // Auto-guardado en memoria local IndexedDB y Borradores
      try {
        saveMediaItem({
          type: "general",
          title: `Rafa Daddy: ${json.title}`,
          category: "Tigre Financiero",
          quote: json.script_audio.hook_3s,
          scriptNarration: json.script_audio.full_speech,
          imagePrompt: json.image_prompts[0]?.prompt
        });
        saveHistoryItem({
          category: "Tigre Financiero",
          title: json.title,
          script: json.script_audio.full_speech,
          prompts: json.image_prompts.map((p, i) => ({
            scene_number: i + 1,
            title: p.version,
            image_prompt: p.prompt,
            animation_prompt: json.video_prompts[i]?.prompt
          }))
        });
      } catch (err) {
        console.warn("Error guardando en memoria:", err);
      }
    } catch (e: any) {
      showToast(e.message || "Error al generar pack", "error");
    } finally {
      setIsGeneratingFull(false);
    }
  };

  // Generar audio de la locución
  const generateSpeech = async (text: string, voiceChoice?: string) => {
    if (!text) return;
    setIsGeneratingAudio(true);
    const chosenVoice = voiceChoice || selectedVoice;
    try {
      const res = await aiFetch("/api/generate-speech", { text, voice: chosenVoice, lang: chosenVoice });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error sintetizando voz");
      setAudioBase64(json.audioBase64);
      showToast("¡Audio de locución generado!", "success");
    } catch (e: any) {
      showToast(e.message || "Error al sintetizar voz", "error");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090A] pt-16 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-amber-500/30">
      
      {/* Resplandor ambiental de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[8%] left-[20%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl" />
        <div className="absolute bottom-[10%] right-[15%] w-[550px] h-[550px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER DE RAFA DADDY - TIGRE FINANCIERO V4 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 text-2xl font-black">
              🐯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight [text-wrap:balance]">
                  Rafa Daddy — Tigre Financiero V4
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                  Personaje Idéntico & Variedad Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 [text-wrap:pretty]">
                Personaje bloqueado 100% idéntico ([CHARACTER] inmutable + NEGATIVE). Arco SHOCK → PROBLEMA → EXPLICACIÓN → SOLUCIÓN → VICTORIA con 5 escenas, ángulos e iluminación únicos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#111216] text-amber-300 border border-white/10 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Viral Finance Hub V4
          </div>
        </div>

        {/* PANEL DE CONFIGURACIÓN PRINCIPAL */}
        <div className="bg-[#0F1013] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Configuración del Video Financiero
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">Personaliza el tema y estilo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TEMA FINANCIERO */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Tema del Video
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Ej. Por qué no te alcanza la quincena..."
                list="tiger-topic-list"
                className="w-full bg-[#090A0C] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <datalist id="tiger-topic-list">
                {TIGER_TOPICS.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            {/* SELECTOR DE ESTILO / TONO */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Estilo / Tono de Voz
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIGER_STYLES.map(s => {
                  const isSelected = style === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-xl border text-left transition-[background-color,border-color,transform] active:scale-[0.98] ${
                        isSelected
                          ? "bg-amber-500/[0.1] border-amber-500/70 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                          : "bg-[#090A0C]/90 border-white/[0.07] text-slate-400 hover:text-white hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="font-bold text-xs">{s.label}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => generateFullPack()}
              disabled={isGeneratingFull || isGeneratingIdeas}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-black font-black py-3.5 px-7 rounded-xl transition-[transform,background-color] active:scale-[0.98] shadow-xl shadow-amber-500/25 disabled:opacity-50 text-sm"
            >
              {isGeneratingFull ? (
                <><Loader2 className="w-4 h-4 animate-spin text-black" /> Creando Pack Completo V3…</>
              ) : (
                <><Wand2 className="w-4 h-4 text-black" /> Generar Pack Completo V3 Directo</>
              )}
            </button>

            <button
              onClick={generateIdeas}
              disabled={isGeneratingIdeas || isGeneratingFull}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#121419] hover:bg-[#1A1C22] text-slate-200 border border-white/10 font-bold py-3.5 px-6 rounded-xl transition-[transform,background-color] active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {isGeneratingIdeas ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Buscando Ganchos…</>
              ) : (
                <><Sparkles className="w-4 h-4 text-amber-400" /> Proponer 5 Ideas con Gancho</>
              )}
            </button>
          </div>
        </div>

        {/* IDEAS PROPUESTAS */}
        {ideas && ideas.length > 0 && (
          <div className="bg-[#0F1013] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Selecciona la Idea que Prefieras
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ideas.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => generateFullPack(`${item.title}: ${item.hook}`)}
                  className="cursor-pointer p-5 rounded-2xl border bg-[#090A0C]/90 border-white/[0.07] hover:border-amber-500/50 hover:bg-[#121317] transition-all space-y-2.5 active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Idea #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                      Elegir y Generar →
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white [text-wrap:balance]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-amber-200/90 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    "{item.hook}"
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Dolor:</strong> {item.pain_point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADO COMPLETO RAFA DADDY V4 */}
        {data && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* CARD DE COMBINACIÓN USADA (VARIEDAD V4) */}
            {data.combination && (
              <div className="bg-[#090A0D] border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    🎲 Combinación de Variedad Única (V4)
                  </span>
                  <span className="text-[11px] text-slate-400">Arco: SHOCK → PROBLEMA → EXPLICACIÓN → SOLUCIÓN → VICTORIA</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Formato</span>
                    <span className="text-white font-medium">{data.combination.format || "El Tigre Mentor"}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Estructura</span>
                    <span className="text-white font-medium">{data.combination.structure || "Problema-Agitación-Solución"}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Fórmula Gancho</span>
                    <span className="text-amber-300 font-medium">{data.combination.hook_formula || "Dato / Pregunta incómoda"}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Paleta</span>
                    <span className="text-emerald-400 font-medium">{data.combination.palette || "Navy & Gold"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* GUION DE AUDIO V4 */}
            <div className="bg-[#0F1013] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase">
                      Guion V4 Estructurado
                    </span>
                    <span className="text-xs text-slate-400">Branding solo al final</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {data.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Selector de Voz para Tigre Financiero */}
                  <div className="flex items-center gap-1.5 bg-[#121419] border border-white/10 rounded-xl px-2.5 py-1.5 shadow-sm">
                    <span className="text-[11px] text-slate-400 font-medium">Voz:</span>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      {TIGER_VOICE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id} className="bg-[#121419] text-white">
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      handleCopy(data.script_audio.full_speech, "full_script");
                      showToast("Guion completo copiado", "success");
                    }}
                    className="bg-[#121419] hover:bg-[#1A1C22] text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedStates["full_script"] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar Guion
                  </button>

                  <button
                    onClick={() => generateSpeech(data.script_audio.full_speech, selectedVoice)}
                    disabled={isGeneratingAudio}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isGeneratingAudio ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sintetizando…</>
                    ) : (
                      <><Volume2 className="w-3.5 h-3.5" /> Generar Audio MP3</>
                    )}
                  </button>
                </div>
              </div>

              {/* Reproductor de Audio si ya fue generado */}
              {audioBase64 && (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Locución de Rafa Daddy Lista:
                  </div>
                  <audio controls src={`data:audio/mp3;base64,${audioBase64}`} className="w-full sm:w-64 h-8" />
                  <a
                    href={`data:audio/mp3;base64,${audioBase64}`}
                    download="locucion_tigre_financiero.mp3"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Bajar MP3
                  </a>
                </div>
              )}

              {/* BLOQUES DEL GUION V4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    ⚡ Gancho 3s (Fórmula Viral)
                  </span>
                  <p className="text-xs font-medium text-white leading-relaxed">
                    "{data.script_audio.hook_3s}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    🔍 Problema 15s (1-2 Ejemplos MX)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{data.script_audio.problem_15s}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🛠️ Solución 20s (Sistema + Frase)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{data.script_audio.solution_20s}"
                  </p>
                </div>
              </div>

              {/* CTA Y TEXTOS OVERLAY */}
              <div className="p-4 rounded-2xl bg-[#050607] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    📢 CTA Final Obligatorio:
                  </span>
                  <span className="text-xs font-bold text-white bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                    "{data.script_audio.cta_final}"
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    📱 5 Overlays para Pantalla (Máximo 5 palabras estilo viral):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.script_audio.overlays.map((ov, oi) => (
                      <span key={oi} className="text-xs font-semibold bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-lg text-slate-200">
                        {oi + 1}. {ov}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: 5 PROMPTS DE IMAGEN (4:3) PARA FLUX / MIDJOURNEY / LEONARDO */}
            <div className="bg-[#0F1013] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    1) 5 Prompts de Imagen (Formato 4:3 con [CHARACTER] Inmutable + NEGATIVE)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Pixar x Realismo --ar 4:3 --style raw</span>
              </div>

              <div className="space-y-3">
                {data.image_prompts.map((img, idx) => (
                  <div key={idx} className="bg-[#090A0C] border border-white/[0.06] p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {img.step && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {img.step}
                          </span>
                        )}
                        <span className="text-xs font-bold text-amber-400">
                          {img.version}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy(img.prompt, `img_${idx}`);
                          showToast("Prompt de imagen copiado", "success");
                        }}
                        className="text-xs bg-[#14151B] hover:bg-[#1D1E26] text-slate-300 hover:text-white px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1 transition-colors"
                      >
                        {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar Prompt
                      </button>
                    </div>
                    {img.metaphor && (
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-amber-400/90">Metáfora Visual:</strong> {img.metaphor}
                      </div>
                    )}
                    <p className="text-xs font-mono text-slate-300 select-all leading-relaxed bg-[#050607] p-3 rounded-xl border border-white/[0.04] whitespace-pre-wrap">
                      {img.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: 5 PROMPTS DE VIDEO (9:16) PARA KLING / RUNWAY / LUMA / PIKA */}
            <div className="bg-[#0F1013] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    2) 5 Prompts de Video (Vertical 9:16 para Kling / Runway / Luma / Pika)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Cámara + Movimiento + Partículas (5-8s)</span>
              </div>

              <div className="space-y-3">
                {data.video_prompts.map((vid, idx) => (
                  <div key={idx} className="bg-[#090A0C] border border-white/[0.06] p-4 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {vid.step && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {vid.step}
                          </span>
                        )}
                        <span className="text-xs font-bold text-rose-400">
                          {vid.version}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                          📹 {vid.camera}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                          ✨ {vid.particles}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy(vid.prompt, `vid_${idx}`);
                          showToast("Prompt de video copiado", "success");
                        }}
                        className="text-xs bg-[#14151B] hover:bg-[#1D1E26] text-slate-300 hover:text-white px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1 transition-colors"
                      >
                        {copiedStates[`vid_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar Video Prompt
                      </button>
                    </div>

                    <p className="text-xs font-mono text-slate-300 select-all leading-relaxed bg-[#050607] p-3 rounded-xl border border-white/[0.04]">
                      {vid.prompt}
                    </p>
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
