"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ListOrdered, Loader2, ImageIcon } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

const NICHES = [
  "Ahorro de Dinero y Finanzas",
  "Hacks del Hogar (Ahorrar luz, agua, gas)",
  "Psicología Oscura y Manipulación",
  "Seducción y Relaciones",
  "Desarrollo Personal y Hábitos",
  "Productividad y Trucos de IA",
  "Salud, Biohacking y Fitness",
  "10 Formas de ahorrar en el supermercado",
  "Peores formas de hablar con una chica",
  "Errores que cometes con el dinero",
  "Señales de que alguien te quiere mal",
  "Hábitos de la gente exitosa"
];

const TONES = [
  "Polémico y Controversial",
  "Práctico y Directo al Grano",
  "Misterioso (Estilo Sigma)",
  "Académico / Intelectual",
  "Humorístico / Sarcástico"
];

interface Idea {
  title: string;
  description: string;
}

interface ListItem {
  num: string;
  emoji: string;
  label: string;
  text: string;
}

interface InfographicData {
  title: string;
  category: string;
  subhook: string;
  image_prompt?: string;
  items: ListItem[];
  cta: string;
  hashtags?: string[];
  music?: string;
}

export default function ListasViralesPage() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [tone, setTone] = useState(TONES[0]);

  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [data, setData] = useState<InfographicData | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { handleCopy: copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-infographic", { action: "ideas", niche, tone });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error del servidor");
      if (!json.ideas || json.ideas.length === 0) throw new Error("La IA no devolvió ideas");
      setIdeas(json.ideas);
      showToast("¡Ideas generadas!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al generar ideas";
      showToast(msg, "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const generateList = async (idea: Idea) => {
    setSelectedIdea(idea);
    setIsGeneratingList(true);
    setData(null);
    setGeneratedImage(null);
    try {
      const res = await aiFetch("/api/generate-infographic", { action: "list", selectedIdea: idea });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error del servidor");
      if (!json.items) throw new Error("La IA no devolvió la lista correctamente");
      setData(json);
      showToast("¡Lista creada con éxito!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al generar lista";
      showToast(msg, "error");
    } finally {
      setIsGeneratingList(false);
    }
  };

  const generateImage = async () => {
    if (!data?.image_prompt) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await aiFetch("/api/generate-image", { prompt: data.image_prompt, aspectRatio: "9:16" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generando imagen");
      setGeneratedImage(json.imageBase64);
      showToast("¡Imagen generada!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al generar imagen";
      showToast(msg, "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text, key);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    showToast("Copiado", "success");
  };

  const handleCopyAll = () => {
    if (!data) return;
    const text = `[${data.category}]\n${data.title}\n${data.subhook}\n\n` +
      data.items.map(i => `${i.num}. ${i.emoji} ${i.label}: ${i.text}`).join("\n") +
      `\n\n${data.cta}`;
    handleCopy(text, "all");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <ListOrdered className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Listas Infográficas (Virales)</h1>
            <p className="text-emerald-400/80 font-medium mt-1">Crea listas de retención infinita para TikTok y Reels.</p>
          </div>
        </div>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Configuración del Nicho</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Temática / Nicho</label>
              <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tono del Video</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generateIdeas}
            disabled={isGeneratingIdeas}
            className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGeneratingIdeas
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando ganchos virales...</>
              : <><Sparkles className="w-5 h-5" /> Generar Títulos Virales</>}
          </button>
        </div>

        {/* PASO 2 */}
        {ideas.length > 0 && (
          <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Selecciona tu Gancho</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ideas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => generateList(idea)}
                  disabled={isGeneratingList}
                  className={`text-left p-5 rounded-2xl border transition-all ${selectedIdea?.title === idea.title ? "bg-emerald-500/10 border-emerald-500" : "bg-slate-950 border-slate-800 hover:border-emerald-500/50"} ${isGeneratingList && selectedIdea?.title !== idea.title ? "opacity-50" : ""}`}
                >
                  <h3 className="font-bold text-emerald-400 text-base leading-tight mb-2">{idea.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
                  {selectedIdea?.title === idea.title && isGeneratingList && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" /> Redactando...
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3 — Resultado */}
        {data && (
          <div className="space-y-6">

            {/* Info general */}
            <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-emerald-400" /> Datos de la Lista
                </h2>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-emerald-600/40 transition-colors"
                >
                  {copiedStates["all"] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-500 tracking-wider">TÍTULO PRINCIPAL</span>
                  <p className="text-white font-bold text-lg mt-1">{data.title}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-500 tracking-wider">SUB-HOOK</span>
                  <p className="text-slate-300 italic mt-1">&quot;{data.subhook}&quot;</p>
                </div>
              </div>

              {data.hashtags && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-emerald-500 tracking-wider">HASHTAGS · {data.cta}</span>
                  <p className="text-emerald-400 mt-1 text-sm">{data.hashtags.join(" ")}</p>
                  {data.music && <p className="text-slate-400 mt-1 text-sm italic">🎵 {data.music}</p>}
                </div>
              )}
            </div>

            {/* Items con prompts */}
            <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <ListOrdered className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Contenido de la Lista</h2>
              </div>

              {/* Single Image Prompt para todo el poster */}
              {data.image_prompt && (
                <div className="mb-8 border border-blue-500/30 bg-blue-500/5 rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider mb-2">
                        <ImageIcon className="w-4 h-4" /> Prompt para Poster de Fondo
                      </h3>
                      <p className="text-slate-300 text-sm font-mono leading-relaxed">{data.image_prompt}</p>
                      <p className="text-xs text-slate-500 mt-2">Copia este prompt en Midjourney/DALL-E para crear la imagen de fondo donde escribirás la lista.</p>
                    </div>
                    <button
                      onClick={() => handleCopy(data.image_prompt!, "global_img")}
                      className="shrink-0 bg-blue-600/20 text-blue-400 p-3 rounded-xl hover:bg-blue-600/40 transition-colors"
                    >
                      {copiedStates["global_img"] ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {data.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex gap-3">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1">
                      <div className="text-emerald-400 font-mono text-sm font-bold">#{item.num} — {item.label}</div>
                      <div className="text-slate-300 text-sm mt-1">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              </div>

              {data.image_prompt && (
                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center gap-6">
                  <button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="w-full max-w-sm py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingImage
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando imagen...</>
                      : <><ImageIcon className="w-5 h-5" /> Generar Imagen Ahora</>}
                  </button>

                  {generatedImage && (
                    <div className="w-full max-w-sm space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shadow-2xl">
                        <img src={`data:image/jpeg;base64,${generatedImage}`} alt="Lista viral generada" className="w-full h-auto object-cover" />
                      </div>
                      <a
                        href={`data:image/jpeg;base64,${generatedImage}`}
                        download="lista_viral_poster.jpg"
                        className="w-full py-3 rounded-xl font-bold bg-emerald-700/40 text-emerald-300 border border-emerald-700/50 flex items-center justify-center gap-2 hover:bg-emerald-700/60 transition-colors text-sm"
                      >
                        Descargar Poster
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
