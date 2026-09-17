export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, idea, sceneCount, current_script, instruction, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type } = requestBody;

    const count = sceneCount ? parseInt(sceneCount) : 8;
    const requestedDuration = duration || "10 Segundos";
    
    let prompt = "";

    // DUCK WORTH CONSTANT - HARDCODED FROM USER PROMPT
    const characterBase = "original character, mature adult anthropomorphic white duck, elegant wealthy businessman, wearing black suit blazer with vest, white dress shirt slightly open, thin delicate gold chain necklace, elegant gold wristwatch with gold bracelet, single gold signet ring, black sunglasses with gold details, serious sophisticated confident expression, not angry not cute, realistic feathers, detailed, ultra realistic, 8k, photorealistic, highly detailed, cinematic lighting --style raw";

    if (mode === "ideas") {
      prompt = `Eres un creador experto de contenido para YouTube enfocado en Finanzas, Trading, Mentalidad Millonaria y Crecimiento Personal.
Genera 5 ideas de video altamente atractivas y muy clicables.
Tema General/Nicho: "${topic || 'Finanzas y Mentalidad'}"

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "Título del Video",
      "hook": "Hook emocional o revelador en una frase",
      "pain_point": "El problema financiero o mental que resuelve",
      "why_it_works": "Por qué funcionará bien"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista experto para canales de YouTube de Finanzas y Motivación estilo "Mentalidad de Tiburón".
El protagonista (quien narra o protagoniza) es un Pato Millonario, exitoso y elegante.
Tema/Idea base: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS:
- La narración debe ser un MONÓLOGO claro, duro, motivacional y persuasivo. 
- Mentalidad de abundancia, sin excusas.
- DEBES escribir suficiente texto (Aprox 130-200 palabras) para asegurar que el guion tenga sustancia y pueda dividirse en ${count} escenas sin quedar vacío.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del guion, escrito como un solo bloque narrativo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido de Finanzas. Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono financiero y elegante.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
      // PRE-SPLITTING
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

      prompt = `Eres un director de arte para un canal de YouTube de Finanzas.
El usuario ya aprobó el guion. YO he dividido el guion en EXACTAMENTE ${count} escenas.

TUS ESCENAS (NO ALTERES LA NARRACIÓN):
${scenesTextBlocks}

TU TAREA:
1. Genera un concepto visual que coincida con la narración.
2. Genera los prompts visuales en INGLÉS.

Personaje OBLIGATORIO en cada escena: ${characterBase}

REGLAS PARA IMAGE PROMPT:
- El prompt DEBE INCLUIR LA DESCRIPCIÓN BASE COMPLETA DEL PERSONAJE.
- Ponlo en un entorno lujoso/financiero que coincida con el guion (Ej: sitting at luxury executive desk, walking out of a private jet, standing in a Wall Street trading floor).
- Formato sugerido: "${characterBase}, [Pose/Acción], [Entorno Lujoso]. --ar 4:5"

Responde SOLO con un JSON válido:
{
  "title": "Título llamativo",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA",
    "image_prompt": "English prompt: ${characterBase}, highly emotional pose, luxury background. --ar 16:9"
  },
  "scenes": [
      ${scenesTemplate}
  ]
}`;
    } else if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `Regenera SOLO el prompt de imagen para la escena ${scene_number}.
Personaje Base: ${characterBase}
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS: Prompt diferente, en inglés. DEBE incluir la descripción del Personaje Base.
Responde SOLO con JSON válido:
{ "image_prompt": "Nuevo prompt en inglés..." }`;
      } else {
        prompt = `Regenera SOLO el prompt de animación para la escena ${scene_number}.
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior: "${existing_image_prompt}"

Responde SOLO con JSON válido:
{ "animation_prompt": "Nuevo prompt de animación en inglés..." }`;
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
    console.error("Error generating duck:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
