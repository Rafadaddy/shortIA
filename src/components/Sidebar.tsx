import Link from "next/link";
import { Swords, ListOrdered, Sparkles, BookOpen, Image as ImageIcon, MessageSquare, History, PlaySquare, MessageCircle, Flame, Palette, Settings, DollarSign, Tv, Home } from "lucide-react";

export function Sidebar() {
  return (
    <>
      {/* ðŸ’» Desktop Sidebar (Oculto en celulares) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 h-screen flex-col sticky top-0">
        <div className="p-4 flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">AI Studio</span>
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
          <Link href="/conversaciones" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <MessageCircle className="w-5 h-5 text-pink-400" />
            Conversaciones
          </Link>
          <Link href="/timeline" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <History className="w-5 h-5 text-emerald-400" />
            LÃ­neas de Tiempo
          </Link>
          <Link href="/faceless-youtube" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <PlaySquare className="w-5 h-5 text-cyan-400" />
            Faceless YouTube
          </Link>
          <Link href="/pato-financiero" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Pato Financiero
          </Link>
          <Link href="/telenovelas" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Tv className="w-5 h-5 text-purple-400" />
            Telenovelas
          </Link>
          <Link href="/casas-mexicanas" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Home className="w-5 h-5 text-orange-400" />
            Casas Mex
          </Link>
          <Link href="/stickman" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <PlaySquare className="w-5 h-5 text-emerald-400" />
            Stickman YouTube
          </Link>
                              <Link href="/naturaleza-salvaje" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Swords className="w-5 h-5 text-red-400" />
            Nat. Salvaje
          </Link>
                  <Link href="/naturaleza-salvaje" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-400 active:text-red-400 min-w-[4rem] flex-shrink-0">
          <Swords className="w-5 h-5" />
          <span className="text-[10px] font-medium">Salvaje</span>
        </Link>
        <Link href="/listas-virales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            Listas Virales
          </Link>
          <Link href="/videos-motivacionales" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Flame className="w-5 h-5 text-amber-400" />
            Videos Motivacionales
          </Link>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
            Recursos
          </div>
                    <Link href="/configuracion" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            ConfiguraciÃ³n
          </Link>

        </nav>
        
        <div className="p-4 border-t border-slate-800">
        </div>
      </aside>

      {/* ðŸ“± Mobile Bottom Navigation (Oculto en Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center justify-start p-2 z-50 pb-safe overflow-x-auto gap-2">
        <Link href="/reflexiones" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-indigo-400 active:text-indigo-400 min-w-[4rem] flex-shrink-0">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Textos</span>
        </Link>
        <Link href="/ilustraciones" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-pink-400 active:text-pink-400 min-w-[4rem] flex-shrink-0">
          <ImageIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">ImÃ¡genes</span>
        </Link>
        <Link href="/historietas" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-amber-400 active:text-amber-400 min-w-[4rem] flex-shrink-0">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">CÃ³mics</span>
        </Link>
        <Link href="/conversaciones" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-pink-400 active:text-pink-400 min-w-[4rem] flex-shrink-0">
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chats</span>
        </Link>
        <Link href="/timeline" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">LÃ­neas</span>
        </Link>
        <Link href="/faceless-youtube" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-cyan-400 active:text-cyan-400 min-w-[4rem] flex-shrink-0">
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Faceless</span>
        </Link>
        <Link href="/pato-financiero" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] font-medium">Finanzas</span>
        </Link>
        <Link href="/telenovelas" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-purple-400 active:text-purple-400 min-w-[4rem] flex-shrink-0">
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-medium">Novelas</span>
        </Link>
        <Link href="/casas-mexicanas" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-orange-400 active:text-orange-400 min-w-[4rem] flex-shrink-0">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Casas</span>
        </Link>
        <Link href="/stickman" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Stickman</span>
        </Link>
                          <Link href="/naturaleza-salvaje" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Swords className="w-5 h-5 text-red-400" />
            Nat. Salvaje
          </Link>
                  <Link href="/naturaleza-salvaje" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-400 active:text-red-400 min-w-[4rem] flex-shrink-0">
          <Swords className="w-5 h-5" />
          <span className="text-[10px] font-medium">Salvaje</span>
        </Link>
        <Link href="/listas-virales" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-emerald-400 active:text-emerald-400 min-w-[4rem] flex-shrink-0">
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px] font-medium">Listas</span>
        </Link>
        <Link href="/videos-motivacionales" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-amber-400 active:text-amber-400 min-w-[4rem] flex-shrink-0">
          <Flame className="w-5 h-5" />
          <span className="text-[10px] font-medium">MotivaciÃ³n</span>
        </Link>
                <Link href="/configuracion" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-200 active:text-slate-200 min-w-[4rem] flex-shrink-0">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Ajustes</span>
        </Link>
      </nav>
    </>
  );
}




