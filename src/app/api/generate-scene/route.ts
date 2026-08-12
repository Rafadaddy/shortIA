import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import * as googleTTS from "google-tts-api";
import path from "path";
import fs from "fs";

// Configurar el path del binario de FFmpeg que instalamos localmente
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

export async function POST(req: NextRequest) {
  try {
    const { scene, jobId, index, voice } = await req.json();
    
    // Directorio temporal en /public para fácil escritura local y acceso
    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log(`[VideoJob-${jobId}] Procesando escena ${index}...`);

    let finalImagePath = "";

    if (scene.imageUrl.startsWith("/temp/")) {
      // La imagen ya está descargada localmente por generate-image
      finalImagePath = path.join(process.cwd(), "public", scene.imageUrl);
      console.log(`[VideoJob-${jobId}-Scn${index}] Usando imagen local: ${finalImagePath}`);
    } else {
      // Por si acaso viene de una URL externa
      finalImagePath = path.join(tempDir, `${jobId}_img_${index}.png`);
      console.log(`[VideoJob-${jobId}-Scn${index}] Descargando imagen externa...`);
      await downloadFile(scene.imageUrl, finalImagePath);
    }

    const audioPath = path.join(tempDir, `${jobId}_audio_${index}.mp3`);
    const clipPath = path.join(tempDir, `${jobId}_clip_${index}.mp4`);

    console.log(`[VideoJob-${jobId}-Scn${index}] Generando TTS...`);
    let langCode = "es";
    if (voice === "es-ES") langCode = "es";
    if (voice === "es-MX") langCode = "es-US";
    if (voice === "en-US") langCode = "en";

    const audioUrl = googleTTS.getAudioUrl(scene.narration, {
      lang: langCode,
      slow: false,
      host: "https://translate.google.com",
    });
    await downloadFile(audioUrl, audioPath);

    console.log(`[VideoJob-${jobId}-Scn${index}] Ensamblando clip FFmpeg...`);
    await new Promise((resolve, reject) => {
      // Efecto Ken Burns dinámico: Escenas pares hacen Zoom In, impares hacen un pequeño Paneo
      const zoomFilter = index % 2 === 0 
        ? "zoompan=z='min(zoom+0.0015,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30" // Zoom in lento centrado
        : "zoompan=z='1.1':d=700:x='iw/2-(iw/zoom/2)+in*2':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30"; // Zoom fijo 1.1x y paneo lento a la derecha

      ffmpeg()
        .input(finalImagePath)
        .loop()
        .input(audioPath)
        .outputOptions([
           "-vf", zoomFilter,
           "-c:v libx264",
           "-tune stillimage",
           "-c:a aac",
           "-b:a 192k",
           "-pix_fmt yuv420p",
           "-shortest" // El video dura lo mismo que el audio
        ])
        .save(clipPath)
        .on("end", resolve)
        .on("error", reject);
    });
    
    // Devolvemos el path del clip generado
    return NextResponse.json({ clipPath });
    
  } catch (error) {
    console.error("Error generating scene:", error);
    return NextResponse.json({ error: "Failed to generate scene" }, { status: 500 });
  }
}
