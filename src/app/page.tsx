import Link from "next/link";
import { 
  HeartHandshake, 
  DollarSign, 
  MessageSquare, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Zap, 
  FolderArchive, 
  Film, 
  Compass, 
  Layers,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Play
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-slate-100 selection:bg-rose-500/30 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-500/10 via-purple-600/5 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/10 via-emerald-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12">
        
        {/* HERO SECTION STUDIO */}
        <section className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-white/10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-rose-300">
              ShortIA Creative Studio Pro
            </span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] [text-wrap:balance]">
              Crea contenido viral con IA en segundos,{" "}
              <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-indigo-400 text-transparent bg-clip-text">
                no en horas.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl [text-wrap:pretty]">
              Guiones psicológicos de alto gancho, ilustraciones fotorrealistas con personajes consistentes, locuciones en español y previsualización de video vertical.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link
              href="/reflexiones-ilustradas"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-indigo-600 to-purple-600 hover:from-rose-400 hover:to-indigo-500 text-white shadow-xl shadow-rose-500/25 active:scale-[0.98] transition-all"
            >
              <HeartHandshake className="w-4 h-4 text-white" />
              <span>Crear Reflexión Ilustrada</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/pato-financiero"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-[#111215] hover:bg-[#181A1F] border border-white/10 text-slate-200 active:scale-[0.98] transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Finanzas & Ahorro</span>
            </Link>

            <Link
              href="/historial"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-[#111215] hover:bg-[#181A1F] border border-white/10 text-slate-200 active:scale-[0.98] transition-all"
            >
              <FolderArchive className="w-4 h-4 text-indigo-400" />
              <span>Mis Borradores</span>
            </Link>
          </div>
        </section>

        {/* METRICS / CAPABILITIES BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2 border-y border-white/5">
          <div className="p-4 rounded-2xl bg-[#0F1012]/60 border border-white/[0.06] backdrop-blur-md">
            <div className="text-2xl font-black text-white tabular-nums">16+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Motores de Creación</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0F1012]/60 border border-white/[0.06] backdrop-blur-md">
            <div className="text-2xl font-black text-rose-400 tabular-nums">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Consistencia de Personaje</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0F1012]/60 border border-white/[0.06] backdrop-blur-md">
            <div className="text-2xl font-black text-indigo-400 tabular-nums">&lt; 10s</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Generación de Guion & Prompt</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0F1012]/60 border border-white/[0.06] backdrop-blur-md">
            <div className="text-2xl font-black text-emerald-400 tabular-nums">0 MB</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Gasto de tu Laptop (Cloud)</div>
          </div>
        </section>

        {/* FEATURED TOOLS GRID (HERRAMIENTAS ESTRELLA) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                Generadores Más Populares
              </h2>
              <p className="text-xs text-slate-400">Los formatos con mayor retención y engagement en TikTok, Shorts y Reels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Tarjeta 1: Reflexiones Ilustradas */}
            <Link
              href="/reflexiones-ilustradas"
              className="group relative rounded-3xl p-6 bg-gradient-to-b from-[#131418] to-[#0D0E11] border border-white/10 hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                    Top 1 Viral 🔥
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    Reflexiones Ilustradas
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Monigote 2D consistente con ojos dinámicos sobre fondos fotorrealistas con bokeh, tipografía bicolor y locución.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>Abrir Generador</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tarjeta 2: Finanzas & Dinero */}
            <Link
              href="/pato-financiero"
              className="group relative rounded-3xl p-6 bg-gradient-to-b from-[#131418] to-[#0D0E11] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    Rentable 💰
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Finanzas & Dinero
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Psicología del dinero, trampas del crédito, interés compuesto y tiempo vs dinero con ganchos directos al oyente.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Abrir Finanzas</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tarjeta 3: Cómics & Chats */}
            <Link
              href="/historietas"
              className="group relative rounded-3xl p-6 bg-gradient-to-b from-[#131418] to-[#0D0E11] border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    Divertido 🎭
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Cómics & Diálogos
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Viñetas consecutivas de parejas, dilemas de amigos y conversaciones tiernas entre 2 personajes.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Abrir Cómics</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </section>

        {/* WORKFLOW GUIDE BANNER (CÓMO HACER UN SHORT EN 30 SEGUNDOS) */}
        <section className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#12141A] via-[#0E0F13] to-[#0A0B0E] border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Flujo Rápido de Producción para TikTok / Reels</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-rose-400">Paso 1: Generar</span>
              <p className="text-xs text-slate-300">
                Elige tu categoría y genera tu reflexión con su guion narrado y prompt visual con tipografía bicolor.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-indigo-400">Paso 2: Previsualizar</span>
              <p className="text-xs text-slate-300">
                Observa el reproductor vertical en vivo con efecto Ken Burns y escucha la voz sintetizada en español.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-emerald-400">Paso 3: Exportar</span>
              <p className="text-xs text-slate-300">
                Descarga la imagen 9:16 y el audio MP3 en 1 clic. ¡Súbelos a CapCut o TikTok y publica en 1 minuto!
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}