"use client";

import { useState } from "react";
import { Copy, Check, Search, Sparkles, Image as ImageIcon } from "lucide-react";
import { imageStyles } from "@/lib/image-styles";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useToast } from "@/components/Toast";

export default function CatalogoEstilosPage() {
  const [searchTerm, setSearchTerm] = useState("");

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
          <HoverImageCard key={style.id} style={style} />
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

// Subcomponente para manejar el Hover y evitar el Rate-Limit de Pollinations
function HoverImageCard({ style }: { style: any }) {
  const { copiedStates, handleCopy: copyToClipboard } = useCopyToClipboard();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text, id);
    showToast("Prompt copiado al portapapeles", "success");
  };

  return (
    <div
      className="group flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Image Area via Pollinations.ai (Carga on Hover) */}
      <div className="aspect-square relative bg-slate-900 flex flex-col items-center justify-center border-b border-slate-800/50 overflow-hidden">
        {isHovered && !imageFailed ? (
          <>
            <img
              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(style.prompt)}?width=400&height=400&nologo=true&seed=${style.id.length * 42}`}
              alt={`Ejemplo de ${style.label}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent opacity-60 pointer-events-none"></div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 opacity-60 group-hover:opacity-100 transition-opacity">
            <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-xs text-slate-400 font-medium">{imageFailed ? "No se pudo cargar la previsualización" : "Pasa el mouse para ver el ejemplo"}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-200 mb-2">{style.label}</h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed flex-1">
          {style.prompt}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(style.prompt, style.id); }}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-slate-700/50 hover:border-slate-600/50"
        >
          {copiedStates[style.id] ? (
            <><Check className="w-4 h-4 text-emerald-400" /> Copiado</>
          ) : (
            <><Copy className="w-4 h-4" /> Copiar Prompt Base</>
          )}
        </button>
      </div>
    </div>
  );
}
