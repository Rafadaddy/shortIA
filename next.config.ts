import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/textos', destination: '/reflexiones' },
      { source: '/imagenes', destination: '/ilustraciones' },
      { source: '/comics', destination: '/historietas' },
      { source: '/chats', destination: '/conversaciones' },
      { source: '/borradores', destination: '/historial' },
      { source: '/infografias', destination: '/listas-virales' },
      { source: '/combates-animales', destination: '/naturaleza-salvaje' },
      { source: '/cuentos-infantiles', destination: '/videos-infantiles' },
    ];
  },
};

export default nextConfig;
