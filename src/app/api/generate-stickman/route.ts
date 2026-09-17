export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { topic, mode, idea, sceneCount, current_script, instruction, scene_number, existing_prompt, prompt_type, base_prompt, scene_context } = requestBody;

    let prompt = "";
    const count = sceneCount || 10;

    if (mode === "ideas") {
      prompt = `Eres un experto creador de contenido para YouTube especializado en videos educativos, de psicología y curiosidades animadas con "stickman" (monigotes).
Genera 8 ideas de videos altamente clicables (títulos y ganchos) para el siguiente tema general.

Tema General: "${topic || 'Psicología, hábitos o datos curiosos'}"

REGLAS PARA LOS GANCHOS (TÍTULOS):
- Máximo 15 palabras.
- Título muy llamativo al estilo de "Kurzgesagt" o canales de curiosidades.

Responde SOLO con un JSON válido:
{
  "ideas": [
    {
      "title": "Título corto y llamativo",
      "hook": "La premisa central del video",
      "focus": "Por qué este tema es interesante"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista experto para canales de YouTube de animación (estilo "stickman").
Tema/Idea base: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * 6} SEGUNDOS.

REGLAS:
- La narración debe ser clara, educativa y entretenida.
- Debe tener una introducción gancho, un desarrollo fácil de entender y una conclusión.
- Usa lenguaje sencillo.
- DEBES escribir suficiente texto para un video de ${count * 6} segundos. (Aprox 20-25 palabras por cada 6 segundos).

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del guion, escrito como un solo bloque de texto narrativo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido de animación para YouTube.
Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono educativo y dinámico.

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
        "voiceover": "Texto exacto de la Escena ${i + 1}",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt..."
      }`).join(',\n      ');

      prompt = `1. ROLE
You are a professional AI YouTube content creator and visual storytelling expert specializing in simple stickman animations.

El usuario ya aprobó el guion en español. YO, el sistema, lo he dividido en EXACTAMENTE ${count} escenas para ti.

AQUÍ ESTÁN TUS ESCENAS PRE-DIVIDIDAS (NO LAS ALTERES, USA ESTE TEXTO EXACTO PARA EL "voiceover"):
${scenesTextBlocks}

TU TAREA:
1. Toma cada una de las ${count} escenas.
2. Genera los prompts visuales en INGLÉS para ilustrar cada escena.
3. Genera un "base_prompt" general para el personaje.

OUTPUT FORMAT:

Step 1 - Character Base Prompt
Create a Stickman Base Design Prompt.
- Overall vibe: Cheerful, modern, engaging.
- Style: Modern 2D vector animation style, cute stylized stickman wearing a trendy hoodie and sneakers, perfectly round head, casual messy hair, thick black outlines, flat solid colors.
- MUST include: "High quality vector art, crisp thick outlines, white background, trendy youth clothing, cheerful anime-like eyes".

Step 2 - Scene Prompts (Image & Animation)
For each scene:
- image_prompt: Start with "Use the same stickman character as before." Describe Pose, Action, Expression, Prop. 16:9 aspect ratio.
- animation_prompt: Short animation instructions (only arms, head, expression, props).

CRITICAL: The 'title' and 'voiceover' MUST be in SPANISH. The prompts MUST be in ENGLISH.

Respond ONLY with a valid JSON object matching this structure:
{
  "title": "Título del video en español",
  "base_prompt": "The Stickman Base Design Prompt in English...",
  "scenes": [
    ${scenesTemplate}
  ]
}`;
    } else if (mode === "single_prompt") {
      prompt = `You are an expert AI YouTube content creator...
Regenerate ONLY the ${prompt_type === 'image' ? 'Image Prompt' : 'Animation Prompt'} for Scene ${scene_number}.

Context: "${scene_context}"
${prompt_type === 'image' ? `Stickman Base Prompt: "${base_prompt}"` : ''}
Previous Prompt (DO NOT REPEAT): "${existing_prompt}"

RULES: Make it different. Keep it simple and visual. ${prompt_type === 'image' ? '- Start with "Use the same stickman character as before." Aspect ratio 16:9.' : '- Slow minimal movements.'}

Reply ONLY with a valid JSON:
{
  "${prompt_type === 'image' ? 'image_prompt' : 'animation_prompt'}": "The new prompt in English..."
}`;
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
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating stickman video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
