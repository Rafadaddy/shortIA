"use client";
import { aiFetch } from "@/lib/ai-fetch";

import { useState, useRef, useEffect } from "react";
import { Sparkles, BookOpen, RefreshCw, Copy, Check, Search, Image as ImageIcon, List } from "lucide-react";
import { topicCategories } from "./topics";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

export const allTopicsList = topicCategories.flatMap((cat, catIdx) =>
  cat.topics.map((t, topicIdx) => {
    const id = topicCategories.slice(0, catIdx).reduce((acc, c) => acc + c.topics.length, 0) + topicIdx + 1;
    return {
      id,
      category: cat.category,
      icon: cat.icon,
      text: t,
      displayString: `${id}. ${t}`
    };
  })
);

interface ReflectionData {
  title?: string;
  reflection_text: string;
  image_prompt: string;
}

export default function ReflexionesPage() {
  const [topic, setTopic] = useState("");
  const [visualStyle, setVisualStyle] = useState("Cinemático Oscuro (Motivación)");
  const [imageFormat, setImageFormat] = useState("Vertical (9:16)");
  const [tone, setTone] = useState("Libre / Equilibrado");
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titles, setTitles] = useState<string[] | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ReflectionData | null>(null);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  const [regenerating, setRegenerating] = useState(false);

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

  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    setTitles(null);
    setData(null);
    try {
      // Si el tema está vacío, agarramos uno aleatorio
      const finalTopic = topic || allTopicsList[Math.floor(Math.random() * allTopicsList.length)].text;
      if (!topic) setTopic(finalTopic);

      const res = await aiFetch("/api/generate-reflection", { 
        topic: finalTopic, 
        mode: "titles" 
      });
      if (!res.ok) throw new Error("Error obteniendo títulos");
      
      const generated = await res.json();
      if (generated.titles) {
        setTitles(generated.titles);
      }
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar las ideas de títulos.", "error");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateReflection = async (selectedTitle: string) => {
    setIsGenerating(true);
    setData(null);
    setTopic(selectedTitle); // El título se convierte en el tema principal para la reflexión
    
    // Ocultar los títulos una vez seleccionado uno
    setTitles(null);

    try {
      const res = await aiFetch("/api/generate-reflection", { 
        topic: selectedTitle, 
        style: visualStyle, 
        format: imageFormat,
        tone: tone,
        mode: "script" 
      });
      if (!res.ok) throw new Error("Error en la solicitud");
      const reflectionData = await res.json();
      setData(reflectionData);
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar la reflexión.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAllText = () => {
    if (!data) return;
    const fullText = `${data.title ? data.title + '\\n\\n' : ''}${data.reflection_text}`;
    handleCopy(fullText, 'all_text');
    showToast("¡Texto copiado al portapapeles!", "success");
  };

  const handleRegenerateImagePrompt = async () => {
    if (!data || regenerating) return;
    setRegenerating(true);
    try {
      const res = await aiFetch("/api/generate-reflection", {
        mode: "single_prompt",
        reflection_text: data.reflection_text,
        style: visualStyle,
        format: imageFormat,
        existing_image_prompt: data.image_prompt,
      });
      if (!res.ok) throw new Error("Error regenerando");
      const newData = await res.json();
      setData({ ...data, image_prompt: newData.image_prompt });
      showToast("Prompt regenerado", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al regenerar", "error");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Encabezado */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Reflexiones y Textos</h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg">
            Genera guiones altamente empáticos y humanos. Toca las fibras sensibles de tu audiencia con verdades incómodas, dolores reales y vulnerabilidad.
          </p>
        </div>

        {/* Panel de Configuración */}
        <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl backdrop-blur-sm">
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Tono
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="Libre / Equilibrado">Libre / Equilibrado</option>
                  <option value="Duro y Confrontativo">Duro y Confrontativo</option>
                  <option value="Empático y Comprensivo">Empático y Comprensivo</option>
                  <option value="Profundo y Filosófico">Profundo y Filosófico</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" /> Estilo Visual
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="Fotografía Realista">Fotografía Realista</option>
                  <option value="Cinemático Oscuro (Motivación)">Cinemático Oscuro (Motivación)</option>
                  <option value="Ilustración Minimalista">Ilustración Minimalista</option>
                  <option value="Anime Estético">Anime Estético (Lofi)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Formato de Imagen
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="Vertical (9:16)">Vertical 9:16 (Shorts/TikTok)</option>
                  <option value="Horizontal (16:9)">Horizontal 16:9 (YouTube)</option>
                  <option value="Cuadrado (1:1)">Cuadrado 1:1 (Instagram)</option>
                </select>
              </div>
            </div>
            
            <div className="pt-2 relative z-50" ref={dropdownRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  placeholder="Escribe tu tema o busca uno (ej. amor, fracaso, soledad)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setTopic(e.target.value);
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
                          setSearchTerm(t.text);
                          setTopic(t.text);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/50 flex items-center gap-3 transition-colors last:border-0"
                      >
                        <span className="font-mono text-indigo-400 font-bold min-w-[24px]">{t.id}.</span>
                        <span className="text-slate-300 text-sm">{t.icon} {t.text}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-500 text-sm text-center">
                      No se encontraron temas. Escribe el tuyo y presiona el botón.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerateTitles}
            disabled={isGeneratingTitles || isGenerating}
            className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
          >
            {isGeneratingTitles ? (
              <><RefreshCw className="w-6 h-6 animate-spin" /> Pensando títulos profundos...</>
            ) : (
              <><List className="w-6 h-6 group-hover:scale-110 transition-transform" /> Generar 10 Títulos de este Tema</>
            )}
          </button>
        </div>

        {/* Zona de Selección de Títulos */}
        {titles && titles.length > 0 && (
          <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Selecciona el título que más conecte:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {titles.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateReflection(t)}
                  className="text-left bg-slate-950/60 hover:bg-indigo-900/40 hover:border-indigo-500/50 border border-slate-800 p-4 rounded-xl transition-all duration-200 group"
                >
                  <span className="flex items-start gap-3">
                    <span className="text-indigo-500 font-bold mt-1">{idx + 1}.</span>
                    <span className="text-slate-300 group-hover:text-indigo-200 leading-relaxed font-medium">{t}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cargando la reflexión */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 animate-pulse">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Escribiendo desde el dolor y la experiencia...</p>
          </div>
        )}

        {/* Zona de Resultados de Reflexión */}
        {data && !isGenerating && (
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRegenerateImagePrompt}
                        disabled={regenerating}
                        className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-2 px-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        {regenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(data.image_prompt, 'image_prompt')}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                      >
                        {copiedStates['image_prompt'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Prompt Visual</>}
                      </button>
                    </div>
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
