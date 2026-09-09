"use client";

import { useState } from "react";
import { Sparkles, Heart, Copy, Check, MessageSquare, RefreshCw } from "lucide-react";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";


interface ConversationPanel {
  panel_number: number;
  speaker: "EL HOMBRE" | "LA MUJER";
  dialogue: string;
  image_prompt: string;
}

interface ConversationData {
  title: string;
  man_appearance: string;
  woman_appearance: string;
  panels: ConversationPanel[];
  caption: string;
  music_recommendation: string;
}

const conversationNiches = [
  "El reencuentro después de años sin verse",
  "La última conversación antes de separarse",
  "Cuando uno confiesa lo que nunca dijo",
  "El día que dejaron de ser amigos",
  "La conversación que nunca tuvieron con su padre",
  "Cuando ella vuelve después de mucho tiempo",
  "El ex que aparece cuando ya estás bien",
  "Dos extraños que comparten un momento real",
  "Cuando te das cuenta de que ya no eres la misma persona",
  "La verdad que nadie se atreve a decir",
  "El primer amor que reaparece en tu vida",
  "Cuando tu mejor amiga se enamora de tu ex",
  "La conversación después de una gran pelea",
  "Dos personas que se conocieron en el momento equivocado",
  "El día que decidieron ser honestos por fin",
  "Cuando ella le dice que está embarazada",
  "La despedida en el aeropuerto",
  "El reencuentro después de la traición",
  "Dos compañeros que nunca se hablaron y un día conectan",
  "La conversación que cambia todo",
  "Cuando uno admite que extraña al otro",
  "El momento en que todo se Complica",
  "La verdad incómoda que debían decirse",
  "Dos personas que se eligen a pesar de todo",
];

const themes = [
  { value: "amor", label: "Amor / Reencuentro", icon: "💕" },
  { value: "desamor", label: "Desamor / Separación", icon: "💔" },
  { value: "amistad", label: "Amistad / Distancia", icon: "🤝" },
  { value: "familia", label: "Familia / Reconciliación", icon: "👨‍👩‍👧" },
  { value: "nostalgia", label: "Nostalgia / Recuerdos", icon: "💭" },
];

const visualStyles = [
  "Estilo Cómic Web / Webtoon",
  "Anime / Manga",
  "Dibujo Tierno Aesthetic",
  "Ilustración 3D (Pixar)",
  "Dibujo a Lápiz (Sketch Tradicional)",
  "Arte Noir (Blanco y Negro)",
  "Animación 2D Clásica (Cartoon)",
];

export default function ConversacionesPage() {
  const [niche, setNiche] = useState(conversationNiches[0]);
  const [idea, setIdea] = useState("");
  const [theme, setTheme] = useState("amor");
  const [panelCount, setPanelCount] = useState(8);
  const [visualStyle, setVisualStyle] = useState("Estilo Cómic Web / Webtoon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ConversationData | null>(null);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();
  const [regeneratingPanel, setRegeneratingPanel] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setData(null);

    try {
      const res = await aiFetch("/api/generate-conversation", { niche, idea, panels: panelCount, style: visualStyle, theme });
      if (!res.ok) throw new Error("Error en la solicitud");
      const generatedData = await res.json();
      setData(generatedData);
    } catch (error) {
      console.error(error);
      showToast("Hubo un error al generar la conversación.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (!data) return;
    const allText = data.panels
      .map((p) => `[${p.speaker}]: "${p.dialogue}"`)
      .join("\n");
    handleCopy(allText, "all");
  };

  const handleCopyScript = () => {
    if (!data) return;
    const script = data.panels
      .map((p) => `Viñeta ${p.panel_number} - ${p.speaker}:\n${p.dialogue}\nPrompt: ${p.image_prompt}`)
      .join("\n\n");
    handleCopy(script, "script");
  };

  const handleRegeneratePanel = async (panelIndex: number) => {
    if (!data || regeneratingPanel !== null) return;
    const panel = data.panels[panelIndex];
    setRegeneratingPanel(panelIndex);
    try {
      const res = await aiFetch("/api/generate-conversation", {
        mode: "single_prompt",
        style: visualStyle,
        panel_number: panel.panel_number,
        dialogue: panel.dialogue,
        speaker: panel.speaker,
        existing_prompt: panel.image_prompt,
        man_appearance: data.man_appearance,
        woman_appearance: data.woman_appearance,
      });
      if (!res.ok) throw new Error("Error al regenerar");
      const newData = await res.json();
      const newPanels = [...data.panels];
      newPanels[panelIndex] = { ...newPanels[panelIndex], image_prompt: newData.image_prompt };
      setData({ ...data, panels: newPanels });
    } catch (error) {
      console.error(error);
      showToast("Error al regenerar el prompt.", "error");
    } finally {
      setRegeneratingPanel(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-12 selection:bg-pink-500/30">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-4">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-400" />
            Conversaciones
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Historias que se desarrollan a través del diálogo entre un hombre y una mujer. Cada viñeta es un intercambio real y emotivo.
          </p>
        </header>

        {/* Formulario */}
        <div className="bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-xl space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Temática de la Conversación
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
              >
                {conversationNiches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Tipo de Emoción
              </label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                      theme === t.value
                        ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                        : "bg-slate-950/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-400" /> Estilo Visual
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none"
              >
                {visualStyles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                Cantidad de Viñetas: <span className="text-pink-400 font-bold">{panelCount}</span>
              </label>
              <input
                type="range"
                min={4}
                max={20}
                value={panelCount}
                onChange={(e) => setPanelCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>4</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              ¿Qué debería pasar en la conversación? (Opcional)
            </label>
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej. Ella le dice que se va del país, él intenta convencerla de que se quede..."
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(236,72,153,0.4)]"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" /> Escribiendo conversación...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" /> Generar Conversación
              </>
            )}
          </button>
        </div>

        {/* Resultados */}
        {data && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-6">

            {/* Título y descripción de personajes */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{data.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-blue-400 font-semibold">👨 Él:</span>
                  <p className="text-slate-300 mt-1">{data.man_appearance}</p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-pink-400 font-semibold">👩 Ella:</span>
                  <p className="text-slate-300 mt-1">{data.woman_appearance}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates["all"] ? (
                    <><Check className="w-4 h-4" /> Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copiar Solo Diálogos</>
                  )}
                </button>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-2 bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/40 py-2 px-4 rounded-xl text-sm font-semibold transition-colors"
                >
                  {copiedStates["script"] ? (
                    <><Check className="w-4 h-4" /> Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copiar Todo</>
                  )}
                </button>
              </div>
            </div>

            {/* Viñetas estilo chat */}
            <div className="space-y-4">
              {data.panels.map((panel, idx) => {
                const isWoman = panel.speaker === "LA MUJER";
                return (
                  <div
                    key={idx}
                    className={`flex ${isWoman ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 border ${
                        isWoman
                          ? "bg-pink-500/10 border-pink-500/30 rounded-bl-sm"
                          : "bg-blue-500/10 border-blue-500/30 rounded-br-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold ${
                            isWoman ? "text-pink-400" : "text-blue-400"
                          }`}
                        >
                          {isWoman ? "👩 Ella" : "👨 Él"}
                        </span>
                        <span className="text-xs text-slate-500">Viñeta {panel.panel_number}</span>
                      </div>
                      <p className="text-slate-200 font-medium text-lg italic">
                        &quot;{panel.dialogue}&quot;
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">Prompt de imagen</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRegeneratePanel(idx)}
                              disabled={regeneratingPanel !== null}
                              className="flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-1 px-1.5 rounded-lg transition-colors"
                            >
                              {regeneratingPanel === idx ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(panel.image_prompt, `prompt_${idx}`)}
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg transition-colors"
                            >
                              {copiedStates[`prompt_${idx}`] ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1 line-clamp-2">
                          {panel.image_prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info extra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 block">
                  🎵 Música Sugerida
                </span>
                <p className="text-sm text-slate-300 italic">
                  &quot;{data.music_recommendation}&quot;
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">
                  📝 Caption para Redes
                </span>
                <p className="text-slate-300">{data.caption}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
