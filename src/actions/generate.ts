'use server'

import { Groq } from 'groq-sdk';
import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import path from 'path';

// Asegurar que el directorio public/videos exista
const outputDir = path.join(process.cwd(), 'public', 'videos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Genera solo la historia (texto plano)
export async function generateStory(topic: string, format: string, style: string) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "Eres un guionista experto. Escribe una historia corta y atrapante en ESPAÑOL para un video corto. Responde SOLO con el texto de la historia en ESPAÑOL, sin introducciones." },
        { role: "user", content: `Tema: ${topic}\nFormato: ${format}\nEstilo visual deseado: ${style}` }
      ]
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

// 2. Divide la historia en escenas
export async function generateScenes(story: string, style: string) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "Eres un director de arte. Divide la historia proporcionada en escenas lógicas. Devuelve SOLO un objeto JSON válido con un array 'escenas'. Cada escena debe tener: 'narration' (el fragmento de texto a narrar EN ESPAÑOL) y 'imagePrompt' (descripción visual detallada EN INGLÉS para generar la imagen, incluyendo el estilo: " + style + ")." },
        { role: "user", content: story }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content;
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw error;
  }
}

// 3. Genera la imagen (¡USAMOS UNA IA GRATUITA: Pollinations.ai!)
export async function generateImage(prompt: string, id: string, index: number, orientation: string = 'Vertical') {
  try {
    const width = orientation === 'Vertical' ? 720 : 1280;
    const height = orientation === 'Vertical' ? 1280 : 720;
    
    // Pollinations es 100% gratis, pero tiene límite de 1 request concurrente
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Esperar 2 segundos si no es la primera imagen para evitar rate limit
    if (index > 0) {
      await new Promise(r => setTimeout(r, 2500));
    }
    
    let buffer: Buffer | null = null;
    let retries = 2;
    while (retries > 0) {
      try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        
        // Si la respuesta es muy pequeña (error de JSON), lanza error para reintentar
        if (buffer.length > 5000) {
          break; // Imagen válida
        } else {
          throw new Error("Imagen inválida o límite de velocidad alcanzado");
        }
      } catch (e) {
        retries--;
        if (retries > 0) await new Promise(r => setTimeout(r, 4000));
      }
    }
    
    // FALLBACK A UNSPLASH SI POLLINATIONS FALLA COMPLETAMENTE
    if (!buffer || buffer.length < 5000) {
      console.log("Pollinations falló, usando Unsplash fallback...");
      const fallbackUrl = `https://images.unsplash.com/photo-1534447677768-be436bb09401?w=${width}&h=${height}&fit=crop`;
      const fbResponse = await fetch(fallbackUrl);
      const fbArrayBuffer = await fbResponse.arrayBuffer();
      buffer = Buffer.from(fbArrayBuffer);
    }
    
    const fileName = `${id}_img_${index}.jpg`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return `/videos/${fileName}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// 4. Genera el Audio (Google TTS)
export async function generateAudio(text: string, id: string, index: number) {
  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: 'es',
      slow: false,
      host: 'https://translate.google.com',
    });
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileName = `${id}_audio_${index}.mp3`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return `/videos/${fileName}`;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
}

// 5. Genera los Subtítulos (Groq Whisper)
export async function generateSubtitles(audioUrl: string, id: string, index: number) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const audioPath = path.join(process.cwd(), 'public', audioUrl);
    
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      response_format: "verbose_json",
    }) as any;

    let srtContent = "";
    if (transcription.segments && Array.isArray(transcription.segments)) {
      transcription.segments.forEach((segment: any, i: number) => {
        const formatTime = (seconds: number) => {
          const date = new Date(0);
          date.setSeconds(Math.floor(seconds));
          const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
          return date.toISOString().substring(11, 19) + ',' + ms;
        };
        
        srtContent += `${i + 1}\n`;
        srtContent += `${formatTime(segment.start)} --> ${formatTime(segment.end)}\n`;
        srtContent += `${segment.text.trim()}\n\n`;
      });
    }

    const srtPath = path.join(outputDir, `${id}_subs_${index}.srt`);
    fs.writeFileSync(srtPath, srtContent);
    
    return `/videos/${id}_subs_${index}.srt`;
  } catch (error) {
    console.error("Error generating subtitles:", error);
    throw error;
  }
}
