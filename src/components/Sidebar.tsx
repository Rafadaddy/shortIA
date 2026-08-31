import Link from "next/link";
import { Sparkles, BookOpen, Image as ImageIcon, MessageSquare, History, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-white">AI Studio (Nube)</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 mt-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Herramientas Web
        </div>
        
        <Link href="/reflexiones" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Reflexiones
        </Link>
        <Link href="/ilustraciones" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <ImageIcon className="w-5 h-5 text-pink-400" />
          Ilustraciones
        </Link>
        <Link href="/historietas" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Historietas
        </Link>
        <Link href="/timeline" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <History className="w-5 h-5 text-emerald-400" />
          Líneas de Tiempo
        </Link>

      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Servidor</span>
            <span className="text-emerald-400 font-medium">Vercel (Nube)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
