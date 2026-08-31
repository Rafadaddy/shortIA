import { Play, Download, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data to simulate the user's projects before connecting the database
const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Los antiguos romanos vomitaban para seguir comiendo",
    status: "Completado",
    engine: "unreal_engine",
    scenes: 11,
    time: "Hace 53 min",
    thumbnail: "https://images.unsplash.com/photo-1547940254-2c70034a7428?q=80&w=600&auto=format&fit=crop",
    mainText: "VOMITABAN PARA SEGUIR"
  },
  {
    id: 2,
    title: "Los 5 hombres más fuertes del mundo",
    status: "Completado",
    engine: "renaissance_oil",
    scenes: 14,
    time: "Hoy, 02:28",
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    mainText: "REDEFINEN LA FUERZA"
  },
  {
    id: 3,
    title: "La alarma como hábito destructivo",
    status: "Completado",
    engine: "comic_book",
    scenes: 8,
    time: "13 ago",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
    mainText: "LA ALARMA COMO..."
  },
  {
    id: 4,
    title: "El libro de Enoc prohibido",
    status: "En proceso",
    engine: "cinematic",
    scenes: 12,
    time: "12 ago",
    thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
    mainText: "RESULTARÁN DIFÍCILES DE..."
  }
];

export default function Home() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Proyectos</h1>
        <p className="text-slate-400">4 proyectos en total</p>
      </div>

      {/* Pestañas (Tabs) */}
      <div className="flex gap-2 mb-8 border-b border-slate-800 pb-px overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <button className="px-4 py-2 text-sm font-medium text-white border-b-2 border-indigo-500">Todos</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Completados</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Borradores</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">En proceso</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Con error</button>
      </div>

      {/* Cuadrícula de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <div key={project.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
            
            {/* Imagen del Video (Thumbnail) */}
            <div className="relative aspect-[4/5] bg-slate-800 overflow-hidden">
              <img 
                src={project.thumbnail} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              
              {/* Badge de Estado */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md border border-white/10">
                {project.status === 'Completado' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : project.status === 'En proceso' ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={project.status === 'Completado' ? 'text-emerald-100' : 'text-amber-100'}>
                  {project.status}
                </span>
              </div>

              {/* Texto Grande superpuesto (Estilo TikTok/Reels) */}
              <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
                <span className="font-black text-xl text-white uppercase tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 8px rgba(0,0,0,0.8)' }}>
                  {project.mainText}
                </span>
              </div>
            </div>

            {/* Detalles de la Tarjeta */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-white leading-tight mb-2 line-clamp-2">
                {project.title}
              </h3>
              
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <span>{project.engine}</span>
                <span>•</span>
                <span>{project.scenes} escenas</span>
              </div>
              
              <div className="text-xs text-slate-500 mb-4">
                {project.time}
              </div>

              <div className="mt-auto grid grid-cols-4 gap-2">
                <Button variant="secondary" className="col-span-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                  <Play className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button variant="secondary" size="icon" className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                  <Edit2 className="w-4 h-4" />
                </Button>
                {/* 
                <Button variant="secondary" size="icon" className="bg-red-500/10 hover:bg-red-500/20 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
                */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
