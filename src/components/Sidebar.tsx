"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {  
  BookOpen, 
  Image as ImageIcon, 
  MessageSquare, 
  MessageCircle, 
  PlaySquare, 
  Settings, 
  History, 
  DollarSign, 
  Tv, 
  Home, 
  ListOrdered, 
  Flame, 
  Swords, 
  Baby, 
  FolderArchive, 
  HeartHandshake, 
  Activity,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Compass,
  Zap
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  desc: string;
  icon: any;
  badge?: string;
  color: string;
  isNew?: boolean;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const CATEGORIES: NavCategory[] = [
  {
    title: "⭐ Generadores Estrella",
    items: [
      {
        href: "/reflexiones-ilustradas",
        label: "Reflexiones Ilustradas",
        desc: "Personaje 2D consistente + Fondos fotorrealistas + Guiones",
        icon: HeartHandshake,
        badge: "VIRAL 🔥",
        color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
        isNew: true
      },
      {
        href: "/pato-financiero",
        label: "Finanzas & Dinero",
        desc: "Consejos, ahorro y mentalidad financiera con ganchos",
        icon: DollarSign,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      },
      {
        href: "/historietas",
        label: "Cómics & Diálogos",
        desc: "Historietas virales de parejas y amigos",
        icon: MessageSquare,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      },
      {
        href: "/conversaciones",
        label: "Chats Fake Virales",
        desc: "Capturas de mensajes de WhatsApp y dramas",
        icon: MessageCircle,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
      }
    ]
  },
  {
    title: "🎬 Contenido y Guiones",
    items: [
      {
        href: "/reflexiones",
        label: "Textos de Reflexión",
        desc: "Frases profundas y guiones de motivación",
        icon: BookOpen,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
      },
      {
        href: "/ilustraciones",
        label: "Ilustraciones con Frase",
        desc: "Prompts Midjourney / DALL-E de alta calidad",
        icon: ImageIcon,
        color: "text-pink-400 bg-pink-500/10 border-pink-500/30"
      },
      {
        href: "/listas-virales",
        label: "Listas Virales (Top 10)",
        desc: "Infografías de datos curiosos y listas estáticas",
        icon: ListOrdered,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      },
      {
        href: "/videos-motivacionales",
        label: "Videos Motivacionales",
        desc: "Discursos de disciplina, estoicismo y mentalidad",
        icon: Flame,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      },
      {
        href: "/timeline",
        label: "Líneas de Tiempo",
        desc: "Evolución histórica y cronologías comparativas",
        icon: History,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      }
    ]
  },
  {
    title: "🌍 Nichos Específicos",
    items: [
      {
        href: "/cuerpo-humano",
        label: "Cuerpo Humano & Salud",
        desc: "Secretos biológicos y curiosidades anatómicas",
        icon: Activity,
        color: "text-red-400 bg-red-500/10 border-red-500/30"
      },
      {
        href: "/naturaleza-salvaje",
        label: "Combates & Naturaleza",
        desc: "Enfrentamientos de animales salvajes",
        icon: Swords,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/30"
      },
      {
        href: "/videos-infantiles",
        label: "Videos Infantiles",
        desc: "Cuentos tiernos y moralejas para niños",
        icon: Baby,
        color: "text-pink-400 bg-pink-500/10 border-pink-500/30"
      },
      {
        href: "/faceless-youtube",
        label: "Canales Faceless",
        desc: "Formatos probados para canales automatizados",
        icon: PlaySquare,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
      },
      {
        href: "/telenovelas",
        label: "Telenovelas & Drama",
        desc: "Dramas noveleros mexicanos y latinos",
        icon: Tv,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
      },
      {
        href: "/casas-mexicanas",
        label: "Casas Mexicanas",
        desc: "Arquitectura y estilos de vida típicos",
        icon: Home,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      },
      {
        href: "/stickman",
        label: "Stickman YouTube",
        desc: "Animaciones de monigotes minimalistas",
        icon: PlaySquare,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar modal al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 🖥️ Desktop Sidebar King Edition */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950/90 border-r border-slate-800/80 h-screen fixed left-0 top-0 backdrop-blur-2xl z-40 select-none">
        
        {/* Header con estilo Studio Pro */}
        <div className="p-5 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-transparent">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-black tracking-tight text-white group-hover:text-pink-300 transition-colors">
                    ShortIA
                  </h2>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Fábrica de Virales con IA</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider px-3 uppercase flex items-center justify-between">
                <span>{cat.title}</span>
              </div>

              <div className="space-y-1">
                {cat.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-transparent border-pink-500/40 text-white shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-900/80 border-transparent hover:border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg border transition-colors ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 ${isActive ? "opacity-100 text-pink-400" : "opacity-0"}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar (Historial y Ajustes) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-1">
          <Link
            href="/historial"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname === "/historial"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderArchive className="w-4 h-4 text-indigo-400" />
              <span>Mis Borradores & Medios</span>
            </div>
          </Link>

          <Link
            href="/configuracion"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname === "/configuracion"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Configuración & API Keys</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Ajustes</span>
          </Link>
        </div>
      </aside>

      {/* 📱 Mobile Top Bar & Drawer Toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-black text-white tracking-tight">ShortIA</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
            PRO
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 active:scale-95 transition-transform"
          aria-label="Abrir todas las herramientas"
        >
          <Menu className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-bold pr-1">Menú Completo</span>
        </button>
      </div>

      {/* 📱 Mobile Drawer (Todas las herramientas organizadas) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-bold text-white">Todas las Herramientas</h3>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  {cat.title}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-pink-500/15 border-pink-500/40 text-white"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              {item.label}
                              {item.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-pink-500 text-white">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Dock (Acceso rápido a las herramientas principales) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-around p-2 z-40 pb-safe">
        <Link
          href="/reflexiones-ilustradas"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/reflexiones-ilustradas" ? "text-pink-400 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
          <span className="text-[10px]">Ilustradas</span>
        </Link>

        <Link
          href="/pato-financiero"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/pato-financiero" ? "text-emerald-400 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px]">Finanzas</span>
        </Link>

        <Link
          href="/historietas"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/historietas" ? "text-amber-400 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Cómics</span>
        </Link>

        <Link
          href="/conversaciones"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/conversaciones" ? "text-purple-400 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chats</span>
        </Link>

        <Link
          href="/historial"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/historial" ? "text-indigo-400 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <FolderArchive className="w-5 h-5" />
          <span className="text-[10px]">Borradores</span>
        </Link>

        <Link
          href="/configuracion"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === "/configuracion" ? "text-slate-200 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Ajustes</span>
        </Link>
      </nav>
    </>
  );
}
