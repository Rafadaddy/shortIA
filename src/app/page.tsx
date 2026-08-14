"use client";

import { useState } from "react";
import { Sparkles, Link as LinkIcon, Clapperboard, Settings2, Copy, Check, Image as ImageIcon } from "lucide-react";

interface Scene {
  scene_number: number;
  narration: string;
  image_prompt: string;
  duration_seconds: number;
}

interface ScriptData {
  title?: string;
  scenes: Scene[];
}

export default function Home() {
  const [mode, setMode] = useState<"idea" | "url">("idea");
  const [ideaText, setIdeaText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [duration, setDuration] = useState("30");
  const [theme, setTheme] = useState("Libre / Creativo");
  const [visualStyle, setVisualStyle] = useState("Fotografía Realista");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  // Estados para los botones de copiar
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleCopyAllScript = async () => {
    if (!scriptData) return;
    const allText = scriptData.scenes.map(s => s.narration).join("\n\n");
    await handleCopy(allText, 'all_script');
  };

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setLoadingText("Pensando y escribiendo con IA...");
    setScriptData(null);
    
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ideaText, urlText, duration, voice: "es-MX", theme, style: visualStyle }),
      });
      
      if (!res.ok) throw new Error("Error en la solicitud al backend");
      
      const data = await res.json();
      setScriptData(data);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar el guión.");
    } finally {
      setIsGenerating(false);
      setLoadingText("");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Controls */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <header className="space-y-3 relative">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
              Shorts Generator
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
              Genera guiones ultra virales y los prompts visuales exactos para que los uses en tus herramientas de IA favoritas.
            </p>
          </header>

          <div className="space-y-8 bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl">
            <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
              <button
                onClick={() => setMode("idea")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                  mode === "idea"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Idea Nueva
              </button>
              <button
                onClick={() => setMode("url")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                  mode === "url"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Desde URL
              </button>
            </div>

            <div className="space-y-4">
              {mode === "idea" ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <label className="text-sm font-medium text-slate-300">¿De qué tratará el video?</label>
                  <textarea
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    placeholder="Ej. Datos psicológicos que no sabías..."
                    className="w-full h-28 bg-slate-950/50 border border-slate-700/50 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <label className="text-sm font-medium text-slate-300">Enlace del video fuente (TikTok/Reel)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="url"
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-slate-400" /> Tema
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="Libre / Creativo">Libre / Creativo</option>
                  <option value="Datos Curiosos y Ciencia">Datos Curiosos y Ciencia</option>
                  <option value="Motivación y Éxito">Motivación y Éxito</option>
                  <option value="Terror y Misterio">Terror y Misterio</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Estilo Visual
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="Fotografía Realista">Fotografía Realista</option>
                  <option value="Animación 3D (Pixar/Disney)">Animación 3D (Pixar)</option>
                  <option value="Cinemático Oscuro">Cinemático Oscuro</option>
                  <option value="Ilustración Digital 2D">Ilustración Digital 2D</option>
                  <option value="Anime / Manga">Anime / Manga</option>
                  <option value="Acuarela y Arte Tradicional">Acuarela Tradicional</option>
                  <option value="Cyberpunk / Futurista">Cyberpunk / Futurista</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-slate-400" /> Duración
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                >
                  <option value="30">30 Segundos</option>
                  <option value="45">45 Segundos</option>
                  <option value="60">60 Segundos</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGenerating || (mode === "idea" && !ideaText) || (mode === "url" && !urlText)}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
            >
              {isGenerating ? (
                <><Sparkles className="w-5 h-5 animate-pulse" /> {loadingText}</>
              ) : (
                <><Clapperboard className="w-5 h-5" /> Generar Guión y Prompts</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-7 pt-8 lg:pt-0">
          {scriptData ? (
            <div className="bg-slate-900/40 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {scriptData.title || "Tu Guión Viral"}
                </h2>
                <button
                  onClick={handleCopyAllScript}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates['all_script'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo el Texto</>}
                </button>
              </div>

              <div className="space-y-6">
                {scriptData.scenes.map((scene) => (
                  <div key={scene.scene_number} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 relative group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {scene.scene_number}
                      </span>
                      <span className="text-slate-500 text-sm font-medium">Escena de {scene.duration_seconds}s</span>
                    </div>

                    {/* Texto del Guión */}
                    <div className="mb-4">
                      <p className="text-slate-200 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-indigo-500/50 pl-4 py-1">
                        "{scene.narration}"
                      </p>
                    </div>

                    {/* Caja del Prompt Visual */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4 mt-6">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Prompt Visual
                        </span>
                        <button
                          onClick={() => handleCopy(scene.image_prompt, `prompt_${scene.scene_number}`)}
                          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors"
                        >
                          {copiedStates[`prompt_${scene.scene_number}`] ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar Prompt</>}
                        </button>
                      </div>
                      <p className="text-sm text-slate-400 font-mono leading-relaxed">
                        {scene.image_prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 rounded-3xl border border-slate-800/40 border-dashed min-h-[400px]">
               <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
                 <Clapperboard className="w-10 h-10 text-slate-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-400 mb-2">Listo para la magia</h3>
               <p className="text-slate-500 max-w-sm">
                 Genera tu guión a la izquierda y aquí aparecerá el texto narrativo junto con los prompts visuales listos para copiar.
               </p>
             </div>
          )}
        </div>

      </div>
    </main>
  );
}
