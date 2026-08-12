"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, BookOpen, RefreshCw, Copy, Check, Search, Image as ImageIcon } from "lucide-react";
import { topicCategories } from "./topics";

let globalTopicId = 1;
export const allTopicsList = topicCategories.flatMap(cat => 
  cat.topics.map(t => ({
    id: globalTopicId++,
    category: cat.category,
    icon: cat.icon,
    text: t,
    displayString: `${globalTopicId - 1}. ${t}`
  }))
);

interface ReflectionData {
  title?: string;
  reflection_text: string;
  image_prompt: string;
}

export default function ReflexionesPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ReflectionData | null>(null);
  
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReflectionData = async (currentTopic: string) => {
    const res = await fetch("/api/generate-reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: currentTopic }),
    });
    if (!res.ok) throw new Error("Error en la solicitud");
    return await res.json();
  };

  const handleGenerate = async (overrideTopic?: string) => {
    const finalTopic = overrideTopic || topic;
    
    setIsGenerating(true);
    setData(null);
    if (overrideTopic) setTopic(overrideTopic);

    try {
      const reflectionData = await fetchReflectionData(finalTopic);
      setData(reflectionData);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar la reflexión.");
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

  const handleCopyAllText = () => {
    if (!data) return;
    const textToCopy = `*${data.title || 'Reflexión'}*\n\n${data.reflection_text}`;
    handleCopy(textToCopy, 'all_text');
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            Reflexiones Diarias
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Generador de textos virales y prompts visuales para tus redes. Optimizado para crear rápido desde tu celular.
          </p>
        </header>

        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              ¿Sobre qué quieres reflexionar hoy?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. El miedo a fracasar, dejar ir el pasado, la presión de la sociedad..."
              className="w-full h-24 bg-slate-950/50 border border-slate-700/50 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
            
            <div className="pt-2 relative z-50" ref={dropdownRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  placeholder="🔍 Busca un tema o escribe su número (ej. 1, 5, amor)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
              
              {showDropdown && (
                <div className="absolute w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {allTopicsList.filter(t => 
                    t.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    t.id.toString() === searchTerm.trim()
                  ).length > 0 ? (
                    allTopicsList.filter(t => 
                      t.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.id.toString() === searchTerm.trim()
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSearchTerm("");
                          setShowDropdown(false);
                          handleGenerate(t.text);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/50 flex items-center gap-3 transition-colors last:border-0"
                      >
                        <span className="font-mono text-indigo-400 font-bold min-w-[24px]">{t.id}.</span>
                        <span className="text-slate-300 text-sm">{t.icon} {t.text}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-500 text-sm text-center">
                      No se encontraron temas con esa búsqueda.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Escribiendo reflexión...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {topic ? "Generar Texto y Prompt" : "Sorpréndeme (Reflexión Aleatoria 🎲)"}
              </>
            )}
          </button>
        </div>

        {/* Zona de Resultados */}
        {data && (
          <div className="animate-in slide-in-from-bottom-4 duration-700 max-w-3xl mx-auto">
            <div className="flex flex-col space-y-6 bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                {data.title && (
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {data.title}
                  </h2>
                )}
                <button
                  onClick={handleCopyAllText}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates['all_text'] ? <><Check className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
                </button>
              </div>

              <p className="text-slate-300 text-[1.05rem] md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {data.reflection_text}
              </p>
              
              <div className="pt-6 mt-4 border-t border-slate-800/60">
                <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <span className="font-semibold text-indigo-400 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> Prompt para Midjourney / DALL-E
                    </span>
                    <button
                      onClick={() => handleCopy(data.image_prompt, 'image_prompt')}
                      className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {copiedStates['image_prompt'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Prompt Visual</>}
                    </button>
                  </div>
                  <p className="text-sm md:text-base text-slate-400 font-mono leading-relaxed p-3 bg-slate-900 rounded-xl border border-slate-800/50">
                    {data.image_prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
