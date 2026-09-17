export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, idea, bodyColor, shortsColor, sceneCount, current_script, instruction, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type } = requestBody;

    const count = sceneCount ? parseInt(sceneCount) : 8;
    const requestedDuration = duration || "10 Segundos";
    
    let prompt = "";

    const characterBase = `Stylized muscular humanoid character with smooth ${bodyColor || 'yellow'} skin, simple oval head with no facial features except two white oval eyes. Clean line art, thick black outlines, flat solid colors. Very defined but simplified musculature on chest, arms, and abs. Wearing short ${shortsColor || 'black'} athletic shorts. Body proportions heroic and slightly exaggerated. Minimalist digital illustration style, no gradients, no detailed shading, only subtle contour lines. Soft pastel background. Modern, comic-like, simple, clean aesthetic.`;

    if (mode === "ideas") {
      prompt = `Eres un creador experto de contenido para YouTube.
Genera 5 ideas de video altamente atractivas y muy clicables para un canal de YouTube faceless con animación (Público objetivo: jóvenes/adultos interesados en fitness, historias y superación).
Tema General: "${topic || 'Fitness y superación'}"

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "Título del Video",
      "hook": "Hook emocional en una sola frase",
      "pain_point": "El dolor o problema del público objetivo que resuelve",
      "why_it_works": "Por qué funcionará bien"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista experto para canales de YouTube de animación Faceless (Historias y Fitness).
Tema/Idea base: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS:
- La narración debe ser un MONÓLOGO claro, crudo y altamente persuasivo.
- Cero jerga excesiva, ve directo al grano.
- DEBES escribir suficiente texto (Aprox 130-200 palabras) para asegurar que el guion tenga sustancia y pueda dividirse en ${count} escenas más adelante sin quedar vacío.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del guion, escrito como un solo bloque narrativo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido Faceless.
Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono emocional y directo.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
      // PRE-SPLITTING IN BACKEND
      const sentences = current_script.split(/(?<=[.?!])\s+/).filter((s: string) => s.trim().length > 0);
      const preSplitScenes = Array.from({ length: count }, () => [] as string[]);
      
      if (sentences.length > 0) {
        sentences.forEach((s: string, i: number) => {
            const index = Math.min(Math.floor(i / (sentences.length / count)), count - 1);
            preSplitScenes[index].push(s);
        });
      } else {
        preSplitScenes[0].push(current_script);
      }

      const scenesTextBlocks = preSplitScenes.map((sentencesArr, i) => {
        return `ESCENA ${i + 1} NARRACIÓN: "${sentencesArr.join(' ')}"`;
      }).join('\n\n');

      const scenesTemplate = Array.from({ length: count }).map((_, i) => `{
        "scene_number": ${i + 1},
        "narration": "Texto exacto de la Escena ${i + 1}",
        "visual_concept": "Qué se ve en pantalla...",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt...",
        "duration": "~10s"
      }`).join(',\n      ');

      prompt = `Eres un guionista y director de arte visual para un canal de YouTube de Historias Faceless.
El usuario ya aprobó el guion. YO, el sistema, ya he dividido el guion en EXACTAMENTE ${count} escenas para ti.

AQUÍ ESTÁN TUS ESCENAS PRE-DIVIDIDAS (NO LAS ALTERES, USA ESTE TEXTO EXACTO PARA CADA "narration"):
${scenesTextBlocks}

TU TAREA:
1. Toma cada una de las ${count} escenas.
2. Genera un concepto visual que coincida con la narración.
3. Genera los prompts visuales en INGLÉS (image y animation).
4. Genera el prompt para la MINIATURA del video.

Personaje Base: ${characterBase}

REGLAS PARA LOS PROMPTS VISUALES:
- Usa la descripción base del personaje, alterando pose, cámara, entorno.
- Image Prompt en inglés (Ej: Use the base character. [Pose] in [Environment]. Lighting...)
- Animation Prompt en inglés (Ej: Camera: [type]. Action: [movement]. Duration: 5 seconds.)

Responde SOLO con un JSON válido:
{
  "title": "Título llamativo y altamente clickable",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA",
    "image_prompt": "English prompt: You are generating A YOUTUBE THUMBNAIL. AIM: Maximize CTR. SUBJECT: ${characterBase} with [strong emotion/pose]. LIGHTING: Cinematic. BACKGROUND: Simple gradient. STYLE: Clean cartoon illustration. --ar 16:9"
  },
  "scenes": [
      ${scenesTemplate}
  ]
}`;
    } else if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `Eres un director de arte experto en animación para YouTube. Regenera SOLO el prompt de imagen para la escena ${scene_number}.
Personaje Base: ${characterBase}
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS: Prompt diferente, en inglés.
Responde SOLO con JSON válido:
{ "image_prompt": "El nuevo prompt visual en inglés..." }`;
      } else {
        prompt = `Eres un director de arte experto. Regenera SOLO el prompt de animación para la escena ${scene_number}.
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS: Prompt diferente, en inglés.
Responde SOLO con JSON válido:
{ "animation_prompt": "El nuevo prompt de animación en inglés..." }`;
      }
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: mode?.includes("script") || mode === "ideas" ? 0.9 : 0.7 });
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();
    
    const data = JSON.parse(cleanJson);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating faceless youtube:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
