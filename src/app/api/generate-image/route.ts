import { NextRequest, NextResponse } from "next/server";
import { generateImageWithGemini } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio, clientApiKey } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Usar la llave del cliente si la manda, si no usar la del servidor
    const geminiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "No hay API Key de Gemini configurada." },
        { status: 401 }
      );
    }

    // Tomar la primera llave si hay multiples separadas por coma
    const firstKey = geminiKey.split(',')[0].trim();

    const base64Image = await generateImageWithGemini(prompt, firstKey, aspectRatio || "9:16");

    return NextResponse.json({ imageBase64: base64Image });
  } catch (error: any) {
    console.error("Error generating image:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
