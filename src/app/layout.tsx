import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Shorts Generator",
  description: "Transforma ideas y videos en Shorts virales con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-black text-xl tracking-tight bg-gradient-to-br from-indigo-300 via-white to-slate-400 bg-clip-text text-transparent flex-shrink-0">
              <span>🚀 AI Creator Studio</span>
            </div>
            
            <nav className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <a href="/" className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800/40 hover:bg-indigo-500/20 border border-slate-700/50 hover:border-indigo-500/50 text-slate-200 hover:text-indigo-300 transition-all text-sm font-semibold flex items-center gap-2 shadow-sm">
                🎬 Shorts
              </a>
              <a href="/reflexiones" className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800/40 hover:bg-purple-500/20 border border-slate-700/50 hover:border-purple-500/50 text-slate-200 hover:text-purple-300 transition-all text-sm font-semibold flex items-center gap-2 shadow-sm">
                📖 Reflexiones
              </a>
              <a href="/ilustraciones" className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800/40 hover:bg-pink-500/20 border border-slate-700/50 hover:border-pink-500/50 text-slate-200 hover:text-pink-300 transition-all text-sm font-semibold flex items-center gap-2 shadow-sm">
                ✨ Ilustraciones
              </a>
              <a href="/historietas" className="flex-shrink-0 px-4 py-2 rounded-xl bg-slate-800/40 hover:bg-emerald-500/20 border border-slate-700/50 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 transition-all text-sm font-semibold flex items-center gap-2 shadow-sm">
                💬 Historietas
              </a>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
