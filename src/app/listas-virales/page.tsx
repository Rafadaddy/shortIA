"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ListOrdered, Wand2, Smartphone, Download, Loader2 } from "lucide-react";
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
  "Salud, Biohacking y Fitness"
];

const TONES = [
  "Polémico y Controversial",
  "Práctico y Directo al Grano",
  "Misterioso (Estilo Sigma)",
  "Académico / Intelectual"
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
  items: ListItem[];
  cta: string;
}

export default function ListasViralesPage() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [tone, setTone] = useState(TONES[0]);
  
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [data, setData] = useState<InfographicData | null>(null);

  const [, copyToClipboard] = useCopyToClipboard();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setSelectedIdea(null);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-infographic", {
        action: "ideas",
        niche,
        tone
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setIdeas(json.ideas || []);
      showToast("Ideas generadas", "success");
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
    try {
      const res = await aiFetch("/api/generate-infographic", {
        action: "list",
        selectedIdea: idea
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setData(json);
      showToast("Lista generada con éxito", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al generar lista";
      showToast(msg, "error");
    } finally {
      setIsGeneratingList(false);
    }
  };

  const handleCopyText = () => {
    if (!data) return;
    const text = `[\${data.category}]\n\${data.title}\n\${data.subhook}\n\n` +
      data.items.map(i => `\${i.num}. \${i.emoji} \${i.label}: \${i.text}`).join("\n") +
      `\n\n\${data.cta}`;
    
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Texto copiado al portapapeles", "success");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <ListOrdered className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Listas Infográficas (Virales)</h1>
            <p className="text-emerald-400/80 font-medium mt-1">Crea listas de retención infinita para TikTok y Reels.</p>
          </div>
        </div>

        {/* PASO 1 */}
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
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
            {isGeneratingIdeas ? <><Loader2 className="w-5 h-5 animate-spin" /> Buscando ganchos virales...</> : <><Sparkles className="w-5 h-5" /> Generar Títulos Virales</>}
          </button>
        </div>

        {/* PASO 2 */}
        {ideas.length > 0 && (
          <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
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
                  className={`text-left p-5 rounded-2xl border transition-all \${selectedIdea?.title === idea.title ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'} \${isGeneratingList && selectedIdea?.title !== idea.title ? 'opacity-50' : ''}`}
                >
                  <h3 className="font-bold text-emerald-400 text-lg leading-tight mb-2">{idea.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
                  
                  {selectedIdea?.title === idea.title && isGeneratingList && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" /> Redactando la lista...
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* CÓDIGO Y TEXTO COPIABLE */}
              <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><ListOrdered className="w-5 h-5 text-emerald-400" /> Datos de la Lista</h2>
                  <button onClick={handleCopyText} className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-emerald-600/40 transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-emerald-500 tracking-wider">HOOK (TÍTULO PRINCIPAL)</span>
                    <h3 className="text-xl font-bold text-white mt-1">{data.title}</h3>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-emerald-500 tracking-wider">SUB-HOOK (GATILLO)</span>
                    <p className="text-slate-300 italic mt-1">&quot;{data.subhook}&quot;</p>
                  </div>
                  
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-emerald-500 tracking-wider px-2">LOS PUNTOS (ITEMS)</span>
                    {data.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-3">
                        <div className="text-2xl pt-1">{item.emoji}</div>
                        <div>
                          <div className="text-emerald-400 font-mono text-sm font-bold mb-1">#{item.num} - {item.label}</div>
                          <div className="text-slate-300 text-sm leading-relaxed">{item.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-emerald-500 tracking-wider">CALL TO ACTION (CIERRE)</span>
                    <p className="text-slate-300 mt-1">{data.cta}</p>
                  </div>
                </div>
              </div>

              {/* PREVISUALIZACIÓN ESTILO VIRAL */}
              <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" /> Preview Visual (TikTok)</h2>
                </div>
                
                {/* CANVAS DEL VIDEO (9:16) */}
                <div className="relative w-[300px] h-[533px] bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-6">
                  {/* Background Ambient Glow */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-black z-0"></div>
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-600/20 rounded-full blur-[60px] z-0"></div>
                  
                  {/* Card Content */}
                  <div className="relative z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col max-h-full overflow-hidden">
                    
                    <div className="text-center mb-3">
                      <span className="text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        {data.category}
                      </span>
                    </div>
                    
                    <h3 className="text-[17px] font-black text-white text-center leading-tight mb-2 tracking-tight shadow-black drop-shadow-md">
                      {data.title.toUpperCase()}
                    </h3>
                    
                    <p className="text-center text-[10px] text-slate-300/80 italic mb-4">
                      {data.subhook}
                    </p>
                    
                    <div className="flex-1 overflow-hidden flex flex-col gap-2.5">
                      {data.items.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <div className="w-4 text-[10px] font-mono text-emerald-400 font-bold opacity-80 pt-0.5">{item.num}.</div>
                          <div className="flex-1">
                            <span className="text-[11px] font-bold text-white leading-tight block">{item.label}</span>
                            <span className="text-[9px] text-slate-300 leading-tight block opacity-90">{item.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {data.items.length > 6 && (
                      <div className="text-center mt-2 pt-2 border-t border-white/10">
                        <span className="text-[8px] text-emerald-400/80">+{data.items.length - 6} puntos más...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Fake UI Overlay */}
                  <div className="absolute bottom-4 left-4 right-12 z-20">
                    <p className="text-[10px] text-white font-bold">{data.cta}</p>
                    <p className="text-[9px] text-white/70">#viral #consejos #{data.category.toLowerCase().replace(/ /g, "")}</p>
                    <div className="flex items-center gap-1 mt-2 bg-white/10 w-max px-2 py-0.5 rounded text-[8px] text-white">
                      🎵 Audio Original - Phonk Lofi
                    </div>
                  </div>
                  <div className="absolute right-2 bottom-12 flex flex-col gap-4 z-20 items-center opacity-80">
                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    <div className="w-7 h-7 rounded-full bg-white/20"></div>
                    <div className="w-7 h-7 rounded-full bg-white/20"></div>
                    <div className="w-7 h-7 rounded-full bg-white/20"></div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">Usa este diseño como referencia visual para montarlo en Canva o Photoshop. La clave es el fondo oscuro, texto blanco y detalles esmeralda.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}


