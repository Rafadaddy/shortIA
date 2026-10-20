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
    if (!geminiKey && _provider && (_provider.providerId === "google" || _provider.providerId === "gemini") && _provider.apiKey) {
      geminiKey = _provider.apiKey;
    }
    if (!geminiKey && process.env.GEMINI_API_KEY) {
      geminiKey = process.env.GEMINI_API_KEY;
    }

    if (!geminiKey) {
      return NextResponse.json({ 
        error: "Falta tu API Key de Google Gemini para generar imágenes. Ve al menú 'Ajustes' o 'Configuración' e ingresa tu Gemini API Key gratuita (de aistudio.google.com/apikey)." 
      }, { status: 400 });
    }

    // Tomar la primera llave si hay multiples separadas por coma
    const firstKey = geminiKey.split(',')[0].trim();

    console.log("[Generate-Image] Generating image with Gemini, prompt length:", prompt.length);
    const base64Image = await generateImageWithGemini(prompt, firstKey, aspectRatio || "9:16");

    return NextResponse.json({ imageBase64: base64Image });
  } catch (error: any) {
    console.error("Error generating image:", error.message);
    const msg = error.message || "";
    let friendlyError = msg;
    if (msg.includes("403") || msg.includes("leaked") || msg.includes("PERMISSION_DENIED")) {
      friendlyError = "Tu API Key de Gemini fue reportada o bloqueada por Google. Abre 'Configuración' e ingresa una nueva API Key de Google AI Studio.";
    } else if (msg.includes("API_KEY_INVALID") || msg.includes("not valid") || msg.includes("400")) {
      friendlyError = "Tu API Key de Gemini no es válida. Abre 'Configuración' e ingresa una clave nueva de aistudio.google.com/apikey.";
    } else if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      friendlyError = "Límite de cuota alcanzado en Gemini. Espera un minuto o cambia tu clave en Configuración.";
    }
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
