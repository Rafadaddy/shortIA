import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import * as googleTTS from "google-tts-api";

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "es" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No se proporcionó texto para sintetizar" }, { status: 400 });
    }

    // Limpiar caracteres extraños que puedan romper la locución
    const cleanText = text
      .replace(/[#*—_]/g, " ")
      .replace(/♡|♥|✨|🔥|🌱|⏳|🕊️/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Obtener los fragmentos de audio en base64
    const audioChunks = await googleTTS.getAllAudioBase64(cleanText, {
      lang,
      slow: false,
      timeout: 10000,
    });

    if (!audioChunks || audioChunks.length === 0) {
      throw new Error("No se pudo sintetizar el audio");
    }

    // Concatenar buffers de MP3
    const buffers = audioChunks.map((chunk: { base64: string }) => Buffer.from(chunk.base64, "base64"));
    const combinedBuffer = Buffer.concat(buffers);
    const audioBase64 = combinedBuffer.toString("base64");

    return NextResponse.json({
      audioBase64,
      mimeType: "audio/mp3",
    });
  } catch (error: any) {
    console.error("Error en generate-speech:", error);
    return NextResponse.json({ error: error.message || "Error al sintetizar voz" }, { status: 500 });
  }
}
