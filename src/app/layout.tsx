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
        <header className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
              <span>🚀 AI Creator Studio</span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="/" className="text-slate-300 hover:text-white transition-colors">
                Shorts
              </a>
              <a href="/reflexiones" className="text-slate-300 hover:text-white transition-colors">
                Reflexiones
              </a>
              <a href="/ilustraciones" className="text-slate-300 hover:text-white transition-colors">
                Ilustraciones con Frases
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
