import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { prompt, width = 768, height = 1365 } = await req.json();

    console.log("Generando imagen con Pollinations.ai...");
    
    // Generamos un seed aleatorio
    const seed = Math.floor(Math.random() * 1000000);
    
    // Mejoramos el prompt para calidad alta
    const enhancedPrompt = `${prompt}, masterpiece, cinematic lighting, ultra detailed, 8k resolution, photorealistic`;
    
    // URL de Pollinations
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    // Hacemos la descarga de la imagen en el backend (servidor)
    // Esto evita que el navegador haga múltiples peticiones de golpe y sea bloqueado
    const res = await fetch(pollinationsUrl);
    
    if (!res.ok) {
      throw new Error(`Error de red al conectar con Pollinations: ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();

    // Guardar en la carpeta local public/temp
    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `img_${Date.now()}_${seed}.jpg`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Devolvemos la URL local para que el frontend la muestre de manera estable
    return NextResponse.json({ imageUrl: `/temp/${fileName}` });
    
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: "Error interno al generar la imagen" }, { status: 500 });
  }
}
