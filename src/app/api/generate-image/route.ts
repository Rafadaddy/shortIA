import { NextRequest, NextResponse } from "next/server";
import { generateImageWithGemini } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, aspectRatio, clientApiKey, _provider } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Buscar API key en múltiples lugares posibles
    let geminiKey = clientApiKey;
    if (!geminiKey && _provider && _provider.providerId === "gemini" && _provider.apiKey) {
      geminiKey = _provider.apiKey;
    }
    if (!geminiKey) {
      geminiKey = process.env.GEMINI_API_KEY;
    }

    if (!geminiKey) {
      return NextResponse.json(
        { error: "No hay API Key de Gemini configurada. Abre Configuración y agrega tu clave de Gemini." },
        { status: 401 }
      );
    }

    // Tomar la primera llave si hay multiples separadas por coma
    const firstKey = geminiKey.split(',')[0].trim();

    console.log("[Generate-Image] Generating image with Gemini, prompt length:", prompt.length);
    const base64Image = await generateImageWithGemini(prompt, firstKey, aspectRatio || "9:16");

    return NextResponse.json({ imageBase64: base64Image });
  } catch (error: any) {
    console.error("Error generating image:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
