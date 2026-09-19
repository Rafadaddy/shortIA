"use client";

import { useState } from "react";
import { 
  Sparkles, Copy, Check, Image as ImageIcon, Loader2, 
  RefreshCw, Wand2, Type, Swords, Play, Mic, Film, Eye, Volume2, Video
} from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";
import { aiFetch } from "@/lib/ai-fetch";

interface WildlifeIdea {
  title: string;
  description: string;
}

interface Scene {
  scene_number: number;
  timestamp: string;
  narration: string;
  text_overlay: string;
  visual_concept: string;
  camera_movement: string;
  audio_cues: string;
  image_prompt: string;
  animation_prompt: string;
}

interface WildlifeData {
  title: string;
  music: string;
  hashtags: string[];
  winner_stats: string;
  cta: string;
  scenes: Scene[];
}

const animalsList = [
  "🎲 Sorpréndeme / Enfrentamiento Aleatorio",
  "🦁 León Africano",
  "🐅 Tigre Siberiano",
  "🐻 Oso Grizzly",
  "🐻‍❄️ Oso Polar",
  "🦍 Gorila Espalda Plateada",
  "🦛 Hipopótamo",
  "🦏 Rinoceronte Negro",
  "🐊 Cocodrilo del Nilo",
  "🐍 Anaconda Verde",
  "🦎 Dragón de Komodo",
  "🐆 Jaguar",
  "🐺 Lobo Gris (Alfa)",
  "🐾 Hiena Manchada",
  "🦈 Tiburón Blanco",
  "🐋 Orca (Ballena Asesina)",
  "🦅 Águila Harpía",
  "🐍 Mamba Negra",
  "🐘 Elefante Africano",
  "🐃 Búfalo del Cabo"
];

const QUICK_MATCHUPS = [
  { label: "🦍 vs 🐻 Gorila vs Oso", a: "Gorila Espalda Plateada", b: "Oso Grizzly" },
  { label: "🦛 vs 🐊 Hipopótamo vs Cocodrilo", a: "Hipopótamo", b: "Cocodrilo del Nilo" },
  { label: "🦁 vs 🐅 León vs Tigre", a: "León Africano", b: "Tigre Siberiano" },
  { label: "🐆 vs 🐍 Jaguar vs Anaconda", a: "Jaguar", b: "Anaconda Verde" },
  { label: "🦈 vs 🐋 Tiburón vs Orca", a: "Tiburón Blanco", b: "Orca (Ballena Asesina)" },
  { label: "🎲 Aleatorio", a: "", b: "" }
];

const tones = [
  "Documental Científico (Serio, estilo NatGeo / BBC)",
  "Épico y Cinematográfico (Batalla a muerte con alta tensión)",
  "Dramático y Brutal (Supervivencia cruda)",
  "Gamer / e-Sports (Comentarista emocionado)"
];

export default function NaturalezaSalvajePage() {
  const [animalA, setAnimalA] = useState("");
  const [animalB, setAnimalB] = useState("");
  const [tone, setTone] = useState(tones[0]);

  const [ideas, setIdeas] = useState<WildlifeIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<WildlifeIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<WildlifeData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);

    const effectiveA = animalA.startsWith("🎲") ? "" : animalA;
    const effectiveB = animalB.startsWith("🎲") ? "" : animalB;

    try {
      const res = await aiFetch("/api/generate-wildlife", { 
        action: "ideas", 
        tone, 
        animalA: effectiveA, 
        animalB: effectiveB 
      });
      
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Error al conectar con el servidor");
      }
      if (!json.ideas || json.ideas.length === 0) {
        throw new Error("No se recibieron ideas de combate. Intenta de nuevo.");
      }
      setIdeas(json.ideas);
      showToast("¡Ideas de combate generadas con éxito!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndGenerateScript = async (idea: WildlifeIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);
    try {
      const res = await aiFetch("/api/generate-wildlife", { 
        action: "script_only", 
        selectedIdea: idea, 
        tone 
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Error al generar guion");
      }
      setScriptText(json.script);
      showToast("¡Guion de batalla generado!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await aiFetch("/api/generate-wildlife", { 
        action: "improve_script", 
        customScript: scriptText, 
        instruction, 
        tone 
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error al modificar");
      setScriptText(json.script);
      showToast("Guion actualizado con éxito", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al modificar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    try {
      const res = await aiFetch("/api/generate-wildlife", { 
        action: "full_from_script", 
        customScript: scriptText 
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error al generar escenas");
      setData(json);
      showToast("¡Escenas y prompts generados!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar escenas", "error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data || regeneratingScene !== null) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    
    try {
      const scene = data.scenes[sceneIndex];
      const res = await aiFetch("/api/generate-wildlife", {
        action: "single_prompt",
        prompt_type: promptType,
        narration: scene.narration,
        visual_concept: scene.visual_concept
      });
      
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error");
      const newData = { ...data };
      if (promptType === "image") {
        newData.scenes[sceneIndex].image_prompt = json.image_prompt;
      } else {
        newData.scenes[sceneIndex].animation_prompt = json.animation_prompt;
      }
      setData(newData);
      showToast("Prompt actualizado", "success");
    } catch (error) {
      showToast("Error al regenerar el prompt", "error");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const handleGenerateImage = async (sceneIndex: number, prompt: string) => {
    if (generatingImageFor !== null) return;
    setGeneratingImageFor(sceneIndex);
    try {
      let clientApiKey = "";
      try {
        const saved = localStorage.getItem("ai-studio-settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          const google = parsed.providers?.find((p: { id: string; apiKey?: string }) => p.id === "google");
          if (google && google.apiKey) {
            clientApiKey = google.apiKey;
          }
        }
      } catch (e) {}

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16", clientApiKey })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generando imagen");
      
      setGeneratedImages(prev => ({ ...prev, [sceneIndex]: json.imageBase64 }));
      showToast("¡Imagen generada con éxito!", "success");
    } catch (error: unknown) {
      console.error(error);
      showToast((error instanceof Error ? error.message : "Error al generar la imagen"), "error");
    } finally {
      setGeneratingImageFor(null);
    }
  };

  const handleCopyVoiceover = () => {
    if (!data) return;
    const text = data.scenes.map(s => s.narration).join("\n\n");
    handleCopy(text, "voiceover");
    showToast("Locución limpia copiada al portapapeles", "success");
  };

  const handleCopyTechnical = () => {
    if (!data) return;
    let text = `🎬 TÍTULO: ${data.title}\n`;
    text += `🏆 VEREDICTO: ${data.winner_stats}\n`;
    text += `🎵 MÚSICA: ${data.music}\n\n`;
    data.scenes.forEach((s) => {
      text += `⏱️ [${s.timestamp}] ESCENA ${s.scene_number}\n`;
      text += `🔤 Texto en Pantalla: ${s.text_overlay}\n`;
      text += `🎥 Cámara: ${s.camera_movement}\n`;
      text += `🔊 Sonido: ${s.audio_cues}\n`;
      text += `👁️ Visual: ${s.visual_concept}\n\n`;
    });
    text += `📌 CTA: ${data.cta}\n`;
    if (data.hashtags) text += `🏷️ Hashtags: ${data.hashtags.join(" ")}\n`;
    handleCopy(text, "technical");
    showToast("Detalles técnicos copiados", "success");
  };

  const handleCopyImagePrompts = () => {
    if (!data) return;
    const text = data.scenes.map(s => `--- ESCENA ${s.scene_number} (IMAGEN) ---\n${s.image_prompt}`).join("\n\n");
    handleCopy(text, "image_prompts");
    showToast("Prompts de todas las imágenes copiados", "success");
  };

  const handleCopyAnimationPrompts = () => {
    if (!data) return;
    const text = data.scenes.map(s => `--- ESCENA ${s.scene_number} (VIDEO) ---\n${s.animation_prompt}`).join("\n\n");
    handleCopy(text, "animation_prompts");
    showToast("Prompts de animación de todas las escenas copiados", "success");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        {/* HEADER */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Swords className="w-4 h-4" /> Duelos Épicos de Animales
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            Naturaleza Salvaje (Showdowns)
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Crea enfrentamientos biológicos virales para TikTok y Shorts. Análisis de mordidas, ventajas biomecánicas y ganador final.
          </p>
        </header>

        {/* PASO 1: CONFIGURACIÓN */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-red-600/30">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configuración del Enfrentamiento</h2>
              <p className="text-xs text-slate-400">Selecciona los contendientes o elige uno de los duelos rápidos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Animal 1 */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Animal 1 (Contendiente A)</label>
              <select
                value={animalA}
                onChange={(e) => setAnimalA(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm font-medium"
              >
                <option value="">-- Elige Animal 1 o déjalo al azar --</option>
                {animalsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Animal 2 */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Animal 2 (Contendiente B)</label>
              <select
                value={animalB}
                onChange={(e) => setAnimalB(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm font-medium"
              >
                <option value="">-- Elige Animal 2 o déjalo al azar --</option>
                {animalsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Tono del relato */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Tono del Relato</label>
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)} 
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm font-medium"
              >
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Duelos rápidos */}
            <div className="md:col-span-2 space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Duelos Virales Populares:
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_MATCHUPS.map((match) => (
                  <button
                    type="button"
                    key={match.label}
                    onClick={() => { setAnimalA(match.a); setAnimalB(match.b); }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      animalA === match.a && animalB === match.b
                        ? "bg-red-500/20 text-red-300 border-red-500/60 font-bold"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {match.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={generateIdeas} 
            disabled={isGeneratingIdeas} 
            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 text-base disabled:opacity-50"
          >
            {isGeneratingIdeas ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Buscando contrincantes y estadísticas...</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Generar Ideas de Batalla</>
            )}
          </button>
        </div>

        {/* PASO 1.5: SELECCIÓN DE IDEAS */}
        {ideas && ideas.length > 0 && !scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-5 animate-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Swords className="w-5 h-5 text-red-500" />
              Selecciona el Enfrentamiento que prefieras:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => selectIdeaAndGenerateScript(idea)}
                  className="text-left bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-red-500/60 hover:bg-slate-900 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/90 bg-red-900/20 px-2 py-0.5 rounded-md mb-2 inline-block">
                      Opción {idx + 1}
                    </span>
                    <h3 className="text-red-400 font-extrabold text-base mb-2 group-hover:text-red-300 leading-snug">
                      {idea.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {idea.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: GUION DE BATALLA */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-red-600/30">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Guion Narrativo de la Batalla</h2>
                <p className="text-xs text-slate-400">Edita a mano o ajusta el ritmo con los botones rápidos</p>
              </div>
            </div>
            
            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm font-medium">Calculando PSI de mordida y redactando batalla...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={scriptText} 
                  onChange={(e) => setScriptText(e.target.value)} 
                  className="w-full h-64 bg-slate-950/80 border border-slate-700/60 rounded-2xl p-4 text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none resize-none leading-relaxed text-sm font-medium" 
                />
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => improveScript("Hazlo más brutal y añade detalles del choque físico y agresividad extrema.")} 
                    disabled={isGeneratingScript} 
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Type className="w-4 h-4 text-red-400" /> Más Brutal y Tensión
                  </button>
                  <button 
                    onClick={() => improveScript("Añade estadísticas científicas precisas (fuerza de mordida en PSI, peso exacto, velocidad de ataque).")} 
                    disabled={isGeneratingScript} 
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4 text-red-400" /> Más Científico y Datos PSI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: GENERAR ESCENAS */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-red-600/30">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Generar Escenas y Prompts</h2>
                <p className="text-xs text-slate-400">Desglosa el guion en escenas de alta retención con prompts para Midjourney y Runway</p>
              </div>
            </div>
            <button 
              onClick={generateFullVideo} 
              disabled={isGeneratingVideo} 
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 text-base disabled:opacity-50"
            >
              {isGeneratingVideo ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creando tomas cinematográficas y prompts...</>
              ) : (
                <><ImageIcon className="w-5 h-5" /> Dividir en Escenas y Generar Prompts</>
              )}
            </button>
          </div>
        )}

        {/* PASO 4: RESULTADO FINAL */}
        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
              
              {/* Header de resultados */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b border-slate-800/80 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">{data.title}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-red-900/40 text-red-300 border border-red-800/60 px-2.5 py-0.5 rounded-full font-bold">
                      🏆 {data.winner_stats}
                    </span>
                    <span className="text-slate-400">🎵 {data.music}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button 
                    onClick={handleCopyImagePrompts} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-pink-500/15 text-pink-300 border border-pink-500/40 hover:bg-pink-500/25 py-2 px-3.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    {copiedStates['image_prompts'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    <span>Copiar Prompts Imágenes</span>
                  </button>
                  <button 
                    onClick={handleCopyAnimationPrompts} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 py-2 px-3.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    {copiedStates['animation_prompts'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Video className="w-3.5 h-3.5" />}
                    <span>Copiar Prompts Video</span>
                  </button>
                  <button 
                    onClick={handleCopyVoiceover} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 py-2 px-3.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    {copiedStates['voiceover'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>Copiar Locución</span>
                  </button>
                  <button 
                    onClick={handleCopyTechnical} 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 py-2 px-3.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    {copiedStates['technical'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Detalles Técnicos</span>
                  </button>
                </div>
              </div>

              {/* Lista de Escenas */}
              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-900/40 text-red-300 border border-red-800/50 font-bold px-3 py-1 rounded-lg text-xs">
                          Escena {scene.scene_number}
                        </span>
                        {scene.timestamp && (
                          <span className="bg-slate-900 text-slate-400 px-2.5 py-0.5 rounded-md text-xs font-mono border border-slate-800">
                            ⏱️ {scene.timestamp}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-yellow-400 font-bold">
                        Texto en Pantalla: &quot;{scene.text_overlay}&quot;
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/60 relative">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                          🎙️ Voz en Off:
                        </span>
                        <p className="text-slate-200 text-sm italic leading-relaxed pr-8">
                          &quot;{scene.narration}&quot;
                        </p>
                        <button 
                          onClick={() => handleCopy(scene.narration, `vo_${idx}`)} 
                          className="absolute right-2 top-2 text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-slate-300"
                        >
                          {copiedStates[`vo_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <Film className="w-3 h-3 text-amber-400" /> Movimiento de Cámara:
                          </span>
                          <p className="text-slate-300 text-xs">{scene.camera_movement}</p>
                        </div>
                        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-blue-400" /> Efectos de Sonido (SFX):
                          </span>
                          <p className="text-slate-300 text-xs">{scene.audio_cues}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-purple-400" /> Acción Visual:
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed">{scene.visual_concept}</p>
                    </div>
                    
                    {/* Grid Prompts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Prompt Imagen */}
                      <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-pink-400 uppercase font-bold flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Prompt Imagen (Midjourney / Flux)
                          </span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleRegeneratePrompt(idx, "image")} 
                              disabled={regeneratingScene !== null} 
                              className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300 disabled:opacity-50"
                              title="Regenerar prompt"
                            >
                              <RefreshCw className={`w-3 h-3 ${regeneratingScene === idx && regeneratingType === "image" ? "animate-spin" : ""}`} />
                            </button>
                            <button 
                              onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)} 
                              className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300"
                            >
                              {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-3">
                          {scene.image_prompt}
                        </p>
                        
                        {/* Generación de Imagen */}
                        <div className="mt-auto pt-2 border-t border-slate-800/80">
                          {generatedImages[idx] ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-950 flex items-center justify-center">
                              <img src={`data:image/jpeg;base64,${generatedImages[idx]}`} alt="Escena generada" className="w-full h-full object-cover" />
                              <a href={`data:image/jpeg;base64,${generatedImages[idx]}`} download={`escena_${scene.scene_number}.jpg`} className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white px-3 py-1 rounded-lg hover:bg-black text-xs font-bold">
                                Descargar
                              </a>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleGenerateImage(idx, scene.image_prompt)} 
                              disabled={generatingImageFor !== null} 
                              className="w-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {generatingImageFor === idx ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando con IA...</>
                              ) : (
                                <><ImageIcon className="w-3.5 h-3.5" /> Generar Imagen en Pantalla</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Prompt Animación */}
                      <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5" /> Prompt Animación (Runway / Kling / Luma)
                          </span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleRegeneratePrompt(idx, "animation")} 
                              disabled={regeneratingScene !== null} 
                              className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300 disabled:opacity-50"
                              title="Regenerar prompt"
                            >
                              <RefreshCw className={`w-3 h-3 ${regeneratingScene === idx && regeneratingType === "animation" ? "animate-spin" : ""}`} />
                            </button>
                            <button 
                              onClick={() => handleCopy(scene.animation_prompt, `anim_${idx}`)} 
                              className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300"
                            >
                              {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          {scene.animation_prompt}
                        </p>
                      </div>

                    </div>
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
