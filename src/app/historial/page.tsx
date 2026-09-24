"use client";

import { useState, useEffect } from "react";
import { 
  FolderArchive, Trash2, Copy, Check, ExternalLink, 
  Calendar, Film, FileText, Search, Sparkles, AlertCircle,
  Eye, RefreshCw, Layers
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem } from "@/lib/history-storage";

export default function HistorialPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const { copiedStates, handleCopy } = useCopyToClipboard();
  const { showToast } = useToast();

  const loadItems = () => {
    const list = getHistory();
    setItems(list);
    if (list.length > 0 && !selectedItem) {
      setSelectedItem(list[0]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(updated[0] || null);
    }
    showToast("Borrador eliminado del historial", "success");
  };

  const handleClearAll = () => {
    if (confirm("¿Estás seguro de que deseas vaciar todo el historial de borradores?")) {
      clearHistory();
      setItems([]);
      setSelectedItem(null);
      showToast("Historial vaciado", "success");
    }
  };

  const categories = ["Todos", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.script && item.script.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <FolderArchive className="w-3.5 h-3.5" />
              Autoguardado & Borradores
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Historial de <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">Creaciones Recientes</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Todo lo que generes se guarda aquí automáticamente para que nunca pierdas un guion o prompt.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="self-start md:self-auto bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-800 hover:border-red-900/40 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Historial
            </button>
          )}
        </header>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por título, palabra o guion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs py-2 px-3.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENEDOR PRINCIPAL: LISTA + DETALLE */}
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center mx-auto text-indigo-400">
              <FolderArchive className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No hay creaciones guardadas todavía</h3>
            <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">
              Cada vez que generes un guion o desglose de escenas en cualquiera de las herramientas (Videos Infantiles, Naturaleza Salvaje, etc.), se guardará automáticamente en este panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LISTA LATERAL IZQUIERDA (4 COLS) */}
            <div className="lg:col-span-4 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    selectedItem?.id === item.id
                      ? "bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/30">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    {item.script && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.script}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>
                      {item.prompts?.length ? `${item.prompts.length} escenas` : "1 guion"}
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Eliminar del historial"
                      className="p-1 rounded-md hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DETALLE Y VISTA DE BORRADOR DERECHA (8 COLS) */}
            <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              {selectedItem ? (
                <>
                  {/* Header del item */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
                          {selectedItem.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          Guardado: {formatDate(selectedItem.createdAt)}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white">
                        {selectedItem.title}
                      </h2>
                    </div>

                    {selectedItem.script && (
                      <button
                        onClick={() => {
                          handleCopy("selected_script", selectedItem.script || "");
                          showToast("¡Guion copiado al portapapeles!", "success");
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-700 flex items-center gap-1.5 self-start md:self-auto transition-colors"
                      >
                        {copiedStates["selected_script"] ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        Copiar Guion
                      </button>
                    )}
                  </div>

                  {/* Guion completo */}
                  {selectedItem.script && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Guion Narrativo Guardado:
                      </label>
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-sm text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                        {selectedItem.script}
                      </div>
                    </div>
                  )}

                  {/* Trivia Options si existen en metadata */}
                  {selectedItem.metadata?.trivia_game && typeof selectedItem.metadata.trivia_game === "object" && (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        🎯 Opciones de Trivia Guardadas (A, B, C):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {((selectedItem.metadata.trivia_game as { options?: Array<{ letter: string; text: string; is_correct: boolean }> })?.options || []).map((o, oi) => (
                          <div
                            key={oi}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                              o.is_correct
                                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200 font-bold"
                                : "bg-slate-950/70 border-slate-800 text-slate-300"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                              o.is_correct ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                            }`}>
                              {o.letter}
                            </span>
                            <span className="truncate">{o.text}</span>
                            {o.is_correct && <span className="ml-auto text-[10px]">✅</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escenas y Prompts */}
                  {selectedItem.prompts && selectedItem.prompts.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-pink-400" />
                          Escenas y Prompts Generados ({selectedItem.prompts.length}):
                        </label>
                        <button
                          onClick={() => {
                            const all = selectedItem.prompts
                              ?.map((p, idx) => `--- Escena ${p.scene_number || idx + 1} ---\nIMAGEN:\n${p.image_prompt || ''}\n\nVIDEO:\n${p.animation_prompt || ''}`)
                              .join("\n\n");
                            handleCopy("all_prompts", all || "");
                            showToast("¡Todos los prompts copiados!", "success");
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Todos
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                        {selectedItem.prompts.map((sc, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <span className="text-xs font-bold text-slate-300">
                                Escena {sc.scene_number || idx + 1}
                              </span>
                              {sc.narration && (
                                <span className="text-xs text-slate-400 italic line-clamp-1 max-w-[60%]">
                                  "{sc.narration}"
                                </span>
                              )}
                            </div>

                            {sc.image_prompt && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-pink-400 uppercase">
                                    Prompt de Imagen (Midjourney / Flux):
                                  </span>
                                  <button
                                    onClick={() => {
                                      handleCopy(`img_${idx}`, sc.image_prompt || "");
                                      showToast("Prompt de imagen copiado", "success");
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                  >
                                    {copiedStates[`img_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 select-all">
                                  {sc.image_prompt}
                                </p>
                              </div>
                            )}

                            {sc.animation_prompt && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-purple-400 uppercase">
                                    Prompt de Animación (Runway / Kling / Luma):
                                  </span>
                                  <button
                                    onClick={() => {
                                      handleCopy(`anim_${idx}`, sc.animation_prompt || "");
                                      showToast("Prompt de video copiado", "success");
                                    }}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                  >
                                    {copiedStates[`anim_${idx}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 select-all">
                                  {sc.animation_prompt}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Selecciona un borrador de la lista para ver su guion y prompts.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
