import Link from "next/link";
import { LayoutDashboard, FolderKanban, Mic, Music, Settings, HelpCircle, ShieldAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-white text-lg">L</span>
        </div>
        <span className="font-bold text-xl text-white">Labsia Clon</span>
      </div>

      <div className="px-4 mt-2">
        <Link href="/crear" className="block w-full">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Video
          </Button>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 mt-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Dashboard
        </div>
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-indigo-400 bg-indigo-950/30 rounded-lg hover:bg-slate-800 transition-colors">
          <FolderKanban className="w-5 h-5" />
          Proyectos
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <Mic className="w-5 h-5" />
          Voces
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <Music className="w-5 h-5" />
          Música
        </Link>

        <div className="mt-8 mb-2"></div>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
          Ayuda
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          Ajustes
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <ShieldAlert className="w-5 h-5" />
          Admin
        </Link>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Uso Local</span>
            <span className="text-indigo-400 font-medium">Ilimitado</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-indigo-500 h-1.5 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
