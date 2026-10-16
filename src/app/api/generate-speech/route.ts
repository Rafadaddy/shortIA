import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import * as googleTTS from "google-tts-api";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "es", lang = "es" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No se proporcionó texto para sintetizar" }, { status: 400 });
    }

    // Determinar el código de idioma/acento adecuado
    // 'es-MX' / 'es-419' / 'es' -> español latinoamericano
    // 'es-ES' -> español de España
    // 'es-US' -> español neutro / US
    let selectedLang = lang || "es";
    if (voice && typeof voice === "string") {
      if (voice.includes("ES") || voice.includes("spain") || voice.includes("alvaro")) {
        selectedLang = "es-ES";
      } else if (voice.includes("US") || voice.includes("neutro")) {
        selectedLang = "es-US";
      } else {
        selectedLang = "es";
      }
    }

    // Limpiar caracteres extraños que puedan romper la locución
    const cleanText = text
      .replace(/[#*—_]/g, " ")
      .replace(/♡|♥|✨|🔥|🌱|⏳|🕊️/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Obtener los fragmentos de audio en base64
    let audioChunks;
    try {
      audioChunks = await googleTTS.getAllAudioBase64(cleanText, {
        lang: selectedLang,
        slow: false,
        timeout: 10000,
      });
    } catch (langErr) {
      // Fallback a 'es' si el locale estricto arroja error en el parser
      audioChunks = await googleTTS.getAllAudioBase64(cleanText, {
        lang: "es",
        slow: false,
        timeout: 10000,
      });
    }

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
      selectedVoice: voice,
      appliedLang: selectedLang,
    });
  } catch (error: any) {
    console.error("Error en generate-speech:", error);
    return NextResponse.json({ error: error.message || "Error al sintetizar voz" }, { status: 500 });
  }
}
