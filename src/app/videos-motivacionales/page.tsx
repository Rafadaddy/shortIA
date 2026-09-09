"use client";
import { aiFetch } from "@/lib/ai-fetch";

import { useState } from "react";
import { Sparkles, Video, Copy, Check, Flame, RefreshCw, Play, Quote } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";


interface Scene {
  scene_number: number;
  narration: string;
  visual_concept: string;
  image_prompt: string;
  animation_prompt: string;
  duration: string;
}

interface MotivationalData {
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
  "Desarrollo personal y superación",
  "Disciplina y hábitos diarios",
  "Superar el miedo al fracaso",
  "Salud mental y autoestima",
  "Éxito financiero y mentalidad",
  "Relaciones y amor propio",
  "Productividad y enfoque",
  "Cambios de vida y transformation",
  "Resiliencia después del dolor",
  "Propósito de vida y significado",
  "Estudios y aprendizaje",
  "Fitness y fuerza mental",
  "Soledad y fortaleza interior",
  "Tiempo y arrepentimiento",
  "Hábitos tóxicos y crecimiento",
];

const tones = [
  { value: "Emotivo y Profundo", icon: "💔", label: "Emotivo" },
  { value: "Directo y Contestador", icon: "🎯", label: "Directo" },
  { value: "Motivacional Energético", icon: "🔥", label: "Energético" },
  { value: "Filosófico y Reflexivo", icon: "🧠", label: "Filosófico" },
  { value: "Oscuro y Crudo", icon: "🖤", label: "Oscuro" },
  { value: "Esperanzador y Cálido", icon: "✨", label: "Esperanzador" },
];

const visualStyles = [
  "Cinemático Oscuro",
  "Paisajes Épicos",
  "Urbano / Calle",
  "Minimalista",
  "Natural / Bosque",
  "Noir / B&W",
  "Colorido / Vibrante",
];

export default function VideosMotivacionalesPage() {
  const [niche, setNiche] = useState(motivationalNiches[0]);
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("Emotivo y Profundo");
  const [visualStyle, setVisualStyle] = useState("Cinemático Oscuro");
  const [sceneCount, setSceneCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [data, setData] = useState<MotivationalData | null>(null);
  const [ideas, setIdeas] = useState<MotivationalIdea[]>([]);
  const [regeneratingScene, setRegeneratingScene] = useState<number | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleGenerate = async (overrideIdea?: string) => {
    const finalIdea = overrideIdea || idea;
    setIsGenerating(true);
    setData(null);
    setIdeas([]);
    if (overrideIdea) setIdea(overrideIdea);

    try {
      const res = await aiFetch("/api/generate-motivational", {
        niche,
        idea: finalIdea,
        tone,
        style: visualStyle,
        sceneCount,
      });
      if (!res.ok) throw new Error("Error al generar");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar el video motivacional.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setIdeas([]);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-motivational", { mode: "ideas", niche });
      if (!res.ok) throw new Error("Error al generar ideas");
      const generated = await res.json();
      if (generated.ideas) {
        setIdeas(generated.ideas);
      }
    } catch (error) {
      showToast("Error al generar ideas.", "error");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleRegenerateScenePrompt = async (sceneIndex: number, promptType: "image" | "animation") => {
    if (!data || regeneratingScene !== null) return;
    const scene = data.scenes[sceneIndex];
    setRegeneratingScene(sceneIndex);
    setRegeneratingType(promptType);
    try {
      const res = await aiFetch("/api/generate-motivational", {
        mode: "single_prompt",
        prompt_type: promptType,
        niche,
        style: visualStyle,
        scene_number: scene.scene_number,
        narration: scene.narration,
        existing_prompt: promptType === "image" ? scene.image_prompt : scene.animation_prompt,
      });
      if (!res.ok) throw new Error("Error al regenerar");
      const newData = await res.json();
      const newScenes = [...data.scenes];
      if (promptType === "image") {
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], image_prompt: newData.image_prompt };
      } else {
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], animation_prompt: newData.animation_prompt };
      }
      setData({ ...data, scenes: newScenes });
    } catch (error) {
      console.error(error);
      showToast("Error al regenerar el prompt.", "error");
    } finally {
      setRegeneratingScene(null);
      setRegeneratingType(null);
    }
  };

  const handleCopyNarration = () => {
    if (!data) return;
    handleCopy(data.full_narration, "narration");
  };

  const handleCopyAll = () => {
    if (!data) return;
    let text = `📝 NARRACIÓN COMPLETA:\n\n${data.full_narration}\n\n`;
    text += `--- PROMPTS DE ESCENAS ---\n\n`;
    data.scenes.forEach(s => {
      text += `ESCENA ${s.scene_number} (${s.duration}):\n`;
      text += `📖 ${s.narration}\n`;
      text += `🖼️ Imagen: ${s.image_prompt}\n`;
      text += `🎬 Video: ${s.animation_prompt}\n\n`;
    });
    text += `📸 Caption: ${data.caption}\n`;
    text += `🎵 Música: ${data.music_recommendation}\n`;
    text += `# ${data.hashtags?.join(" ") || ""}`;
    handleCopy(text, "all");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            Videos Motivacionales
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Genera reflexiones motivacionales para narrar en videos cortos (~40 seg). Incluye prompts de imagen y animación para cada escena.
          </p>
        </header>

        {/* Formulario */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Nicho / Temática
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
            >
              {motivationalNiches.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Tono Emocional
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                      tone === t.value
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-slate-950/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" /> Estilo Visual
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
              >
                {visualStyles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Escenas: <span className="text-amber-400 font-bold">{sceneCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={8}
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>3</span>
                <span>5</span>
                <span>8</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              ¿Qué quieres decir en el video? (Opcional)
            </label>
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej. Por qué la gente fracasa al intentar cambiar, el verdadero costo de no actuar..."
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateIdeas}
              disabled={isGenerating || isGeneratingIdeas}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-slate-700"
            >
              {isGeneratingIdeas ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Sugerir Ideas
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || isGeneratingIdeas}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20"
            >
              {isGenerating ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Generando Video...</>
              ) : (
                <><Play className="w-5 h-5" /> Generar Video Motivacional</>
              )}
            </button>
          </div>
        </div>

        {/* Ideas Generadas */}
        {ideas.length > 0 && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            {ideas.map((ideaItem, idx) => (
              <div
                key={idx}
                className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all group"
                onClick={() => handleGenerate(ideaItem.title)}
              >
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-amber-400 transition-colors">{ideaItem.title}</h3>
                <p className="text-sm text-slate-400 mb-3 border-l-2 border-amber-500/30 pl-3 italic">
                  &quot;{ideaItem.hook}&quot;
                </p>
                <div className="text-xs bg-slate-950 p-2 rounded text-slate-300">
                  <span className="text-amber-400 font-semibold">Enfoque:</span> {ideaItem.focus}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resultados */}
        {data && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8">

            {/* Título */}
            <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-xl text-center">
              <h2 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {data.title}
              </h2>
            </div>

            {/* Narración Completa */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl relative">
              <button
                onClick={handleCopyNarration}
                className="absolute top-6 right-6 flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                {copiedStates['narration'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Narración</>}
              </button>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-400" /> Narración Completa (Para Narrar)
              </h3>
              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {data.full_narration}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                <Play className="w-3 h-3" /> Usa esta narración para grabar tu voz. ~40 segundos de lectura.
              </p>
            </div>

            {/* Escenas */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-500" /> Desglose de Escenas
                </h3>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              <div className="space-y-6">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.scene_number} className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
                        Escena {scene.scene_number}
                      </span>
                      <span className="text-slate-500 text-xs">{scene.duration}</span>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Narración de esta escena</span>
                      <p className="text-amber-200/90 text-sm font-medium mt-1 italic">&quot;{scene.narration}&quot;</p>
                    </div>

                    <div className="border-l-2 border-purple-500/50 pl-3 mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">En Pantalla</span>
                      <p className="text-slate-300 text-sm mt-1">{scene.visual_concept}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-pink-400 uppercase">Prompt Imagen</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRegenerateScenePrompt(idx, "image")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-700/50 p-1.5 rounded-md hover:bg-slate-600/50 text-pink-300"
                            >
                              {regeneratingScene === idx && regeneratingType === "image" ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(scene.image_prompt, `img_${idx}`)}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-pink-300"
                            >
                              {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{scene.image_prompt}</p>
                      </div>

                      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-400 uppercase">Prompt Animación</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRegenerateScenePrompt(idx, "animation")}
                              disabled={regeneratingScene !== null}
                              className="text-xs bg-slate-700/50 p-1.5 rounded-md hover:bg-slate-600/50 text-emerald-300"
                            >
                              {regeneratingScene === idx && regeneratingType === "animation" ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(scene.animation_prompt, `anim_${idx}`)}
                              className="text-xs bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-emerald-300"
                            >
                              {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{scene.animation_prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Extra */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 block">
                  🎵 Música Sugerida
                </span>
                <p className="text-sm text-slate-300 italic">&quot;{data.music_recommendation}&quot;</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 block">
                  📝 Caption
                </span>
                <p className="text-slate-300 text-sm">{data.caption}</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">
                  # Hashtags
                </span>
                <p className="text-slate-300 text-sm">{data.hashtags?.join(" ")}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
