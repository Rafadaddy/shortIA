import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

// Configurar el path del binario de FFmpeg que instalamos localmente
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(req: NextRequest) {
  try {
    const { jobId, clipPaths } = await req.json();
    
    // Directorio temporal en /public
    const tempDir = path.join(process.cwd(), "public", "temp");
    const videoListPath = path.join(tempDir, `${jobId}_list.txt`);
    
    let videoListContent = "";
    
    // Preparar el archivo txt para el demuxer concat de FFmpeg
    for (const clipPath of clipPaths) {
      // En Windows necesitamos escapar correctamente o usar paths relativos simples para concat
      const safePath = clipPath.replace(/\\/g, "/");
      videoListContent += `file '${safePath}'\n`;
    }

    console.log(`[VideoJob-${jobId}] Concatenando ${clipPaths.length} clips...`);
    fs.writeFileSync(videoListPath, videoListContent);
    
    const finalVideoName = `short_${jobId}.mp4`;
    const finalVideoPath = path.join(process.cwd(), "public", finalVideoName);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoListPath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions("-c copy")
        .save(finalVideoPath)
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`[VideoJob-${jobId}] ¡Video generado exitosamente!`);
    
    // Retornamos la URL relativa que Next.js puede servir estáticamente desde /public
    return NextResponse.json({ videoUrl: `/${finalVideoName}` });
    
  } catch (error) {
    console.error("Error concatenating video:", error);
    return NextResponse.json({ error: "Failed to concatenate video" }, { status: 500 });
  }
}
