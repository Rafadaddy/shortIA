"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, Loader2, Play, Check, Copy, RefreshCw, Wand2, 
  Type, Image as ImageIcon, ChevronDown, ChevronUp,
  Music, Hash, Video, Eye, Film, Baby, Heart, HelpCircle,
  BookOpen, Star, Smile, Lightbulb, FolderArchive, RotateCcw
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { aiFetch } from "@/lib/ai-fetch";
import { saveHistoryItem } from "@/lib/history-storage";

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

interface KidsVideoData {
  title: string;
  music_recommendation: string;
  hashtags: string[];
  learning_value: string;
  scenes: Scene[];
}

interface KidsIdea {
  title: string;
  hook: string;
  description: string;
}

const AGE_GROUPS = [
  "👶 Bebés / Toddlers (1 a 3 años)",
  "🧒 Preescolar (4 a 6 años)",
  "🎒 Primaria Inicial (7 a 10 años)",
];

const FORMAT_TYPES = [
  "🧠 Trivia Educativa / Preguntas Escolares (Historia, Ciencias, Geografía)",
  "🔢 Reto de Matemáticas Rápido (Sumas, Restas, Tablas)",
  "📖 Adivinanzas de Español y Vocabulario (Ortografía, Sinónimos)",
  "❓ Adivinanza de Animales (con cuenta regresiva)",
  "🦊 Fábula con Moraleja (Valores y empatía)",
  "🌙 Cuento para Dormir (Bedtime Story relajante)",
  "🦖 Curiosidad Infantil (Dinos, Espacio, Océano)",
  "🎒 Aventura de Personaje Tierno",
];

const COUNTDOWN_OPTIONS = [
  { label: "⏱️ 3 segundos", value: "3" },
  { label: "⏱️ 5 segundos", value: "5" },
  { label: "⏱️ 10 segundos (Recomendado Trivia)", value: "10" },
  { label: "⏱️ 15 segundos", value: "15" },
];

const SCHOOL_TOPIC_CHIPS = [
  { label: "🌎 Historia y Geografía", char: "El descubrimiento de América y exploradores del mundo", moral: "Curiosidad por la historia" },
  { label: "➗ Matemáticas Divertidas", char: "Un reto de cálculo mental rápido con manzanas y estrellas", moral: "Agilidad mental" },
  { label: "📚 Ortografía y Español", char: "Adivina cuál es la palabra correcta y cómo se escribe", moral: "Amor por la lectura" },
  { label: "🪐 El Sistema Solar", char: "Los planetas, la luna y curiosidades del universo", moral: "Cuidado del planeta" },
  { label: "🦁 El Reino Animal", char: "Animales salvajes, sus hábitats y récords asombrosos", moral: "Respeto a los animales" },
];

const VISUAL_STYLES = [
  "🎨 3D Pixar / Disney Tierno",
  "📖 Libro Ilustrado / Acuarela Suave",
  "🧸 Plastilina / Claymation 3D",
  "🧶 Fieltro y Lana Artesanal (Wool Felt)",
  "🍭 2D Kawaii Colorido",
];

const QUICK_CHARACTERS = [
  { label: "🐻 Osito Curioso", value: "Un pequeño osito de peluche curioso con un chaleco azul" },
  { label: "🦊 Zorrito Sabio", value: "Un zorrito naranja alegre con una bufanda tejida" },
  { label: "🦖 Dinosaurio Bebé", value: "Un simpático bebé triceratops verde con manchas amarillas" },
  { label: "🐰 Conejito Blanco", value: "Un conejito blanco muy suave con largas orejitas rosadas" },
  { label: "🐱 Gatito con Botas", value: "Un gatito atigrado con botas amarillas de lluvia" },
  { label: "🐧 Pingüino Saltarín", value: "Un pingüinito bebé con una bufanda roja que da saltitos" },
];

const MORAL_OPTIONS = [
  "🤝 Compartir y Generosidad",
  "❤️ Amistad y Empatía",
  "🌟 Decir la Verdad (Honestidad)",
  "🌱 Paciencia y Perseverancia",
  "🦁 Superar el Miedo y Valentía",
  "🌍 Cuidar a los Animales y la Naturaleza",
  "🧹 Hábitos Positivos (Ordenar, Lavarse las manos)",
];

export default function VideosInfantilesPage() {
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[1]);
  const [formatType, setFormatType] = useState(FORMAT_TYPES[0]);
  const [countdownSeconds, setCountdownSeconds] = useState("10");
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [character, setCharacter] = useState("¿Quién descubrió América y en qué año?");
  const [moral, setMoral] = useState("Aprender historia universal y geografía");

  const [ideas, setIdeas] = useState<KidsIdea[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<KidsIdea | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const [scriptText, setScriptText] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const [data, setData] = useState<KidsVideoData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);

  // CARGAR BORRADOR AUTOMÁTICO AL ENTRAR
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shortia_draft_kids");
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.ideas) setIdeas(draft.ideas);
        if (draft.selectedIdea) setSelectedIdea(draft.selectedIdea);
        if (draft.scriptText) setScriptText(draft.scriptText);
        if (draft.data) setData(draft.data);
        if (draft.ageGroup) setAgeGroup(draft.ageGroup);
        if (draft.formatType) setFormatType(draft.formatType);
        if (draft.countdownSeconds) setCountdownSeconds(draft.countdownSeconds);
        if (draft.visualStyle) setVisualStyle(draft.visualStyle);
        if (draft.character) setCharacter(draft.character);
        if (draft.moral) setMoral(draft.moral);
      }
    } catch (e) {
      console.error("[VideosInfantiles] Error restoring draft:", e);
    }
  }, []);

  // GUARDAR BORRADOR CADA VEZ QUE CAMBIE EL CONTENIDO
  useEffect(() => {
    try {
      if (scriptText || data || (ideas && ideas.length > 0)) {
        localStorage.setItem("shortia_draft_kids", JSON.stringify({
          ideas,
          selectedIdea,
          scriptText,
          data,
          ageGroup,
          formatType,
          countdownSeconds,
          visualStyle,
          character,
          moral
        }));
      }
    } catch (e) {
      console.error("[VideosInfantiles] Error saving draft:", e);
    }
  }, [ideas, selectedIdea, scriptText, data, ageGroup, formatType, countdownSeconds, visualStyle, character, moral]);

  const handleResetDraft = () => {
    if (confirm("¿Deseas reiniciar la pantalla y empezar un video nuevo? (Se conservará en tu historial)")) {
      setIdeas(null);
      setSelectedIdea(null);
      setScriptText("");
      setData(null);
      localStorage.removeItem("shortia_draft_kids");
      showToast("Pantalla reiniciada para un nuevo video", "success");
    }
  };

  // 1. GENERAR 4 IDEAS INFANTILES
  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScriptText("");
    setData(null);

    try {
      const res = await aiFetch("/api/generate-kids", {
        action: "ideas",
        ageGroup,
        formatType,
        countdownSeconds,
        visualStyle,
        character,
        moral,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Error al conectar con el servidor");
      }
      if (!json.ideas || json.ideas.length === 0) {
        throw new Error("No se recibieron ideas. Intenta de nuevo.");
      }
      setIdeas(json.ideas);
      showToast("¡Ideas infantiles generadas con éxito!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar ideas", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // 2. SELECCIONAR IDEA Y GENERAR GUION
  const selectIdeaAndGenerateScript = async (idea: KidsIdea) => {
    setSelectedIdea(idea);
    setIsGeneratingScript(true);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-kids", {
        action: "script_only",
        ageGroup,
        formatType,
        countdownSeconds,
        visualStyle,
        moral,
        selectedIdea: idea,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Error al generar guion");
      }

      const scriptResult = json.script || json.guion || json.text || (typeof json === "string" ? json : "");
      if (!scriptResult) {
        throw new Error("No se pudo extraer el texto del guion. Intenta nuevamente.");
      }
      setScriptText(scriptResult);

      // GUARDAR EN HISTORIAL GLOBAL
      saveHistoryItem({
        category: "Videos Infantiles",
        title: idea.title || "Video Infantil",
        subtitle: `${ageGroup} • ${formatType} (${countdownSeconds}s)`,
        script: scriptResult,
        metadata: { ageGroup, formatType, countdownSeconds, visualStyle, moral }
      });

      showToast("¡Guion infantil generado y guardado en Borradores!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 3. MEJORAR GUION CON BOTONES RÁPIDOS
  const improveScript = async (instruction: string) => {
    if (!scriptText) return;
    setIsGeneratingScript(true);
    try {
      const res = await aiFetch("/api/generate-kids", {
        action: "improve_script",
        customScript: scriptText,
        instruction,
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error al modificar");
      const updated = json.script || json.guion || (typeof json === "string" ? json : "");
      if (updated) setScriptText(updated);
      showToast("Guion actualizado con éxito", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al modificar el guion", "error");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 4. GENERAR ESCENAS Y PROMPTS
  const generateFullVideo = async () => {
    if (!scriptText) return;
    setIsGeneratingVideo(true);
    try {
      const res = await aiFetch("/api/generate-kids", {
        action: "full_from_script",
        visualStyle,
        customScript: scriptText,
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error al generar escenas");
      setData(json);

      // GUARDAR EN HISTORIAL CON TODOS LOS PROMPTS
      saveHistoryItem({
        category: "Videos Infantiles",
        title: json.title || selectedIdea?.title || "Video Infantil",
        subtitle: `${ageGroup} • ${visualStyle}`,
        script: scriptText,
        prompts: json.scenes?.map((s: Scene) => ({
          scene_number: s.scene_number,
          image_prompt: s.image_prompt,
          animation_prompt: s.animation_prompt,
          narration: s.narration,
        })),
        metadata: {
          music: json.music_recommendation,
          hashtags: json.hashtags,
          learning_value: json.learning_value
        }
      });

      showToast("¡Escenas y prompts infantiles listos y guardados!", "success");
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error al generar escenas", "error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // 5. REGENERAR PROMPT INDIVIDUAL
  const handleRegeneratePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data || regeneratingScene !== null) return;
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);

    try {
      const scene = data.scenes[sceneIndex];
      const res = await aiFetch("/api/generate-kids", {
        action: "single_prompt",
        prompt_type: promptType,
        visualStyle,
        narration: scene.narration,
        visual_concept: scene.visual_concept,
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

  // 6. GENERAR IMAGEN CON GEMINI EN VIVO
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
        body: JSON.stringify({
          prompt,
          apiKey: clientApiKey || undefined,
          aspectRatio: "9:16",
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Error al generar imagen");
      }

      setGeneratedImages((prev) => ({
        ...prev,
        [sceneIndex]: result.imageUrl,
      }));
      showToast("¡Imagen generada con éxito!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al generar imagen";
      showToast(msg, "error");
    } finally {
      setGeneratingImageFor(null);
    }
  };

  // COPIAR TODOS LOS PROMPTS
  const handleCopyAllPrompts = (type: "image" | "animation") => {
    if (!data || !data.scenes) return;
    const textToCopy = data.scenes
      .map((scene, i) => `--- Escena ${i + 1} (${scene.timestamp}) ---\n${type === "image" ? scene.image_prompt : scene.animation_prompt}`)
      .join("\n\n");
    handleCopy(`all_${type}`, textToCopy);
    showToast(`¡Todos los prompts de ${type === "image" ? "imagen" : "animación"} copiados!`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Baby className="w-3.5 h-3.5" />
              YouTube Kids & TikTok Infantil
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              Creador de <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">Videos Infantiles</span>
              <Sparkles className="w-8 h-8 text-pink-400 hidden sm:block animate-pulse" />
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              Crea adivinanzas interactivas con cuenta regresiva, fábulas con moraleja y cuentos tiernos en 3D Pixar, acuarela o plastilina.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link
              href="/historial"
              className="bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-indigo-500/30 flex items-center gap-2 transition-colors shadow-lg shadow-indigo-950/40"
            >
              <FolderArchive className="w-4 h-4 text-indigo-400" />
              <span>Ver Historial / Borradores</span>
            </Link>

            {(scriptText || data || (ideas && ideas.length > 0)) && (
              <button
                onClick={handleResetDraft}
                title="Reiniciar pantalla para empezar un video nuevo"
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </button>
            )}
          </div>
        </header>

        {/* PASO 1: CONFIGURACIÓN */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="bg-pink-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-pink-600/30">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configuración del Video Infantil</h2>
              <p className="text-xs text-slate-400">Elige la edad, formato y estilo visual para cautivar a niños y familias</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Edad Objetivo */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-pink-400" />
                Rango de Edad
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              >
                {AGE_GROUPS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Formato del Video */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                Formato / Tipo de Video
              </label>
              <select
                value={formatType}
                onChange={(e) => setFormatType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              >
                {FORMAT_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Cuenta Regresiva (Segundos) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Tiempo de Cuenta Regresiva
              </label>
              <select
                value={countdownSeconds}
                onChange={(e) => setCountdownSeconds(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              >
                {COUNTDOWN_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Estilo Visual Artístico */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Estilo Visual Artístico
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              >
                {VISUAL_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Pregunta Escolar o Protagonista */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Pregunta, Reto Escolar o Personaje
                </span>
                <span className="text-[10px] text-slate-400">Escribe tu pregunta exacta o usa un chip temático</span>
              </label>
              <input
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                placeholder="Ej. ¿Quién conquistó América y en qué barco llegó? / ¿Cuánto es 7 x 8?..."
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              />
              
              {/* Chips de Preguntas Escolares / Materias */}
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Materias y Preguntas Escolares:</span>
                <div className="flex flex-wrap gap-2">
                  {SCHOOL_TOPIC_CHIPS.map((st) => (
                    <button
                      key={st.label}
                      type="button"
                      onClick={() => {
                        setCharacter(st.char);
                        setMoral(st.moral);
                      }}
                      className="text-xs py-1 px-2.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 text-indigo-200 transition-colors"
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1 block">Personajes Infantiles:</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHARACTERS.map((qc) => (
                    <button
                      key={qc.label}
                      type="button"
                      onClick={() => setCharacter(qc.value)}
                      className="text-xs py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-pink-600/30 hover:border-pink-500/50 border border-slate-700/50 text-slate-300 transition-colors"
                    >
                      {qc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Moraleja o Valor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Valor / Aprendizaje
              </label>
              <select
                value={moral}
                onChange={(e) => setMoral(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-medium"
              >
                {MORAL_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

          </div>

          <button
            onClick={generateIdeas}
            disabled={isGeneratingIdeas}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50"
          >
            {isGeneratingIdeas ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando ideas mágicas...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generar 4 Ideas de Cuentos o Adivinanzas</span>
              </>
            )}
          </button>
        </div>

        {/* PASO 1.5: SELECCIÓN DE IDEAS */}
        {ideas && ideas.length > 0 && !scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-5 animate-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Selecciona la Idea Infantil que prefieras:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea, idx) => (
                <button
                  key={idx}
                  onClick={() => selectIdeaAndGenerateScript(idea)}
                  className="text-left bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-pink-500/60 hover:bg-slate-900 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400/90 bg-pink-900/20 px-2 py-0.5 rounded-md mb-2 inline-block">
                      Opción {idx + 1}
                    </span>
                    <h3 className="text-pink-400 font-extrabold text-base mb-1.5 group-hover:text-pink-300 leading-snug">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium mb-2 italic">
                      "{idea.hook}"
                    </p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {idea.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: GUION INFANTIL */}
        {(isGeneratingScript || scriptText) && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-pink-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-pink-600/30">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Guion Infantil Continuo</h2>
                <p className="text-xs text-slate-400">Edítalo a mano o utiliza los ajustes rápidos con un clic</p>
              </div>
            </div>

            {isGeneratingScript && !scriptText ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-sm font-medium">Escribiendo guion dulce y atrapante para niños...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full h-64 bg-slate-950/80 border border-slate-700/60 rounded-2xl p-4 text-slate-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 outline-none resize-none leading-relaxed text-sm font-medium"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => improveScript("Hazlo con rimas divertidas y palabras más fáciles y cariñosas.")}
                    disabled={isGeneratingScript}
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400" /> Más Tierno y Rimado
                  </button>
                  <button
                    onClick={() => improveScript("Añade una pausa clara con cuenta regresiva interactiva [Pausa: 3... 2... 1...] para que los niños participen.")}
                    disabled={isGeneratingScript}
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" /> Añadir Cuenta Regresiva 3-2-1
                  </button>
                  <button
                    onClick={() => improveScript("Enfatiza la moraleja positiva al final para que los niños aprendan una valiosa lección.")}
                    disabled={isGeneratingScript}
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Star className="w-4 h-4 text-amber-400" /> Reforzar Moraleja
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: DESGLOSAR EN ESCENAS */}
        {scriptText && !isGeneratingScript && (
          <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-pink-600 text-white w-8 h-8 flex items-center justify-center rounded-xl font-extrabold text-sm shadow-lg shadow-pink-600/30">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Generar Escenas y Prompts</h2>
                <p className="text-xs text-slate-400">Desglosa el guion en escenas visuales con prompts para Midjourney y Runway</p>
              </div>
            </div>

            <button
              onClick={generateFullVideo}
              disabled={isGeneratingVideo}
              className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all disabled:opacity-50"
            >
              {isGeneratingVideo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Desglosando escenas y creando prompts infantiles...</span>
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  <span>Desglosar Escenas y Prompts Visuales</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PASO 4: RESULTADOS COMPLETOS */}
        {data && data.scenes && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            
            {/* Resumen del video */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-950/60 px-2.5 py-1 rounded-full border border-pink-800/40">
                    Video Infantil Completo
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1.5">{data.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyAllPrompts("image")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedStates["all_image"] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-pink-400" />}
                    Copiar Todos los Prompts de Imagen
                  </button>
                  <button
                    onClick={() => handleCopyAllPrompts("animation")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedStates["all_animation"] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                    Copiar Todos los Prompts de Video
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">Música Recomendada:</span>
                    <p className="text-slate-200 font-semibold">{data.music_recommendation}</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">Valor o Aprendizaje:</span>
                    <p className="text-slate-200 font-semibold">{data.learning_value || moral}</p>
                  </div>
                </div>
              </div>

              {data.hashtags && data.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.hashtags.map((tag, i) => (
                    <span key={i} className="text-[11px] font-medium text-pink-400/80 bg-pink-950/30 px-2.5 py-0.5 rounded-md border border-pink-900/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Escenas desglosadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-pink-400" />
                Desglose Escena por Escena ({data.scenes.length} Escenas):
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {data.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-5"
                  >
                    {/* Header de la escena */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md shadow-pink-600/20">
                          Escena {scene.scene_number || idx + 1}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          ⏱️ {scene.timestamp || `0:0${idx * 8}-0:0${(idx + 1) * 8}`}
                        </span>
                      </div>
                      {scene.text_overlay && (
                        <span className="text-xs font-semibold text-amber-300 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/30">
                          {scene.text_overlay}
                        </span>
                      )}
                    </div>

                    {/* Locución y concepto visual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/70 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                          🎙️ Locución / Voz
                        </span>
                        <p className="text-sm text-slate-200 font-medium leading-relaxed">
                          "{scene.narration}"
                        </p>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/70 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          🎬 Qué ocurre en pantalla & Cámara
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scene.visual_concept}
                        </p>
                        {scene.camera_movement && (
                          <p className="text-[11px] text-slate-400 italic">
                            🎥 {scene.camera_movement}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Efectos de sonido */}
                    {scene.audio_cues && (
                      <div className="bg-pink-950/20 border border-pink-900/30 rounded-xl px-4 py-2 text-xs text-pink-300 flex items-center gap-2">
                        <Music className="w-3.5 h-3.5 flex-shrink-0" />
                        <span><strong>Efectos sonoros:</strong> {scene.audio_cues}</span>
                      </div>
                    )}

                    {/* Prompts para Midjourney y Runway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      
                      {/* Image Prompt */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                            Prompt de Imagen (Midjourney / Flux)
                          </label>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "image")}
                              disabled={regeneratingScene === idx}
                              title="Regenerar Prompt de Imagen"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingScene === idx && regeneratingType === "image" ? "animate-spin text-pink-400" : ""}`} />
                            </button>
                            <button
                              onClick={() => handleCopy(`img_${idx}`, scene.image_prompt)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              {copiedStates[`img_${idx}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed select-all">
                          {scene.image_prompt}
                        </div>

                        {/* Botón de generar imagen en vivo */}
                        <div className="pt-1">
                          {generatedImages[idx] ? (
                            <div className="space-y-2">
                              <img
                                src={generatedImages[idx]}
                                alt={`Escena ${idx + 1}`}
                                className="w-full h-64 object-cover rounded-xl border border-pink-500/40 shadow-lg shadow-pink-500/10"
                              />
                              <a
                                href={generatedImages[idx]}
                                download={`escena_infantil_${idx + 1}.jpg`}
                                className="inline-block text-xs text-pink-400 hover:underline font-semibold"
                              >
                                Descargar Imagen
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateImage(idx, scene.image_prompt)}
                              disabled={generatingImageFor === idx}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {generatingImageFor === idx ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generando Imagen con Gemini...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                                  <span>Generar Vista Previa con IA</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Animation Prompt */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-purple-400" />
                            Prompt de Animación (Runway / Kling / Luma)
                          </label>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRegeneratePrompt(idx, "animation")}
                              disabled={regeneratingScene === idx}
                              title="Regenerar Prompt de Animación"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingScene === idx && regeneratingType === "animation" ? "animate-spin text-purple-400" : ""}`} />
                            </button>
                            <button
                              onClick={() => handleCopy(`anim_${idx}`, scene.animation_prompt)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              {copiedStates[`anim_${idx}`] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed select-all">
                          {scene.animation_prompt}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
