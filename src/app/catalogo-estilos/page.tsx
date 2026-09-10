"use client";

import { useState } from "react";
import { Copy, Check, Search, Sparkles, Image as ImageIcon } from "lucide-react";
import { imageStyles } from "@/lib/image-styles";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

export default function CatalogoEstilosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { copiedStates, handleCopy: copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text, id);
    showToast("Prompt copiado al portapapeles", "success");
  };

  const filteredStyles = imageStyles.filter((style) =>
    style.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Catálogo de Estilos</h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg">
            Explora {imageStyles.length} estilos visuales para tus generaciones. Copia el prompt base para probarlo en Midjourney, DALL-E o tu IA favorita, y descubre cómo transforman tus imágenes.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar estilo o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStyles.map((style) => (
          <div
            key={style.id}
            className="group flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300"
          >
            {/* Image Area via Pollinations.ai */}
            <div className="aspect-square relative bg-slate-900 flex flex-col items-center justify-center border-b border-slate-800/50 overflow-hidden">
              <img
                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(style.prompt)}?width=400&height=400&nologo=true`}
                alt={`Ejemplo de ${style.label}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent opacity-60"></div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-slate-200 mb-2">{style.label}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                {style.prompt}
              </p>
              
              <button
                onClick={() => handleCopy(style.prompt, style.id)}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 hover:border-slate-600 text-sm font-medium"
              >
                {copiedStates[style.id] ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Prompt Base</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredStyles.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No se encontraron estilos</h3>
            <p className="text-slate-500">Prueba buscando con otras palabras clave.</p>
          </div>
        )}
      </div>
    </div>
  );
}
