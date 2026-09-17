export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, tone, visualStyle, idea, sceneCount, current_script, instruction, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type } = requestBody;

    const count = sceneCount ? parseInt(sceneCount) : 8;
    const requestedDuration = duration || "10 Segundos";
    
    let prompt = "";

    if (mode === "ideas") {
      prompt = `Actúa como el mejor guionista de miniseries virales para TikTok y Shorts (Estilo DramaBox, ReelShort).
TEMA ELEGIDO: "${topic || 'CEO Encubierto'}"
TONO ELEGIDO: "${tone || 'Suspenso Extremo'}"

Genera 5 ideas de mini-series o historias dramáticas hiper-virales. 
CONTEXTO:
- NO hables de telenovelas clásicas ni Televisa.
- Enfócate en el formato MODERNO de TikTok: "Mi esposo millonario fingió ser pobre", "La venganza de la dueña", "El CEO oculto", humillación, traición extrema y justicia kármica brutal.

REGLAS:
1. SOLO 1 IDEA POR SHORT. Que genere adicción y deje con ganas de ver la parte 2.
2. HOOKS VISCERALES (Ej: "El día de mi boda descubrí que mi prometido y mi hermana...", "Mi suegra me humilló en el restaurante sin saber que yo lo compré...").

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "TÍTULO (3-4 palabras en MAYÚSCULAS)",
      "hook": "HOOK 0-3 SEGUNDOS (Frase de shock)",
      "pain_point": "El conflicto central de la historia (infidelidad, humillación)",
      "why_it_works": "Por qué la audiencia no podrá dejar de ver (cliffhanger, justicia)"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Actúa como el guionista estrella de miniseries de TikTok (Estilo DramaBox / ReelShort). NO TIENE NADA QUE VER CON TELEVISA.

TONO ELEGIDO: "${tone || 'Suspenso Extremo'}"
TEMA A DESARROLLAR: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS OBLIGATORIAS:
1. Ritmo acelerado: No hay tiempo que perder, ve directo al shock, a la traición o al secreto expuesto.
2. Formato en primera persona funciona muy bien (POV: "Hoy descubrí que...").
3. ESTRUCTURA DEL GUION:
   - Hook brutal y visceral (0-3s).
   - Desarrollo rápido: Humillación o engaño expuesto.
   - La Revelación o Venganza: El giro donde se descubre quién es realmente el CEO, o cómo se vengará.
   - Cliffhanger o final Kármico que deje pidiendo Parte 2.
4. TAMAÑO: Escribe un bloque de texto continuo y robusto (aprox 130-200 palabras) para dividirse en ${count} escenas.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo de la narración, hilado y continuo, sin enumerar escenas..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres el guionista de Mini-dramas de TikTok. Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"
Tono actual: "${tone}"

Reescribe el guion completo aplicando la instrucción. Aumenta la traición, el suspenso y el giro moderno de DramaBox/ReelShort.

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

      prompt = `Eres un director de arte para una producción de Mini-Dramas modernos en TikTok (Estilo DramaBox).
El usuario ya aprobó el guion. YO he dividido el guion en EXACTAMENTE ${count} escenas.

TUS ESCENAS (NO ALTERES LA NARRACIÓN):
${scenesTextBlocks}

TU TAREA:
1. Genera un concepto visual cinematográfico moderno que coincida con la narración.
2. Genera los prompts visuales en INGLÉS para un generador de IA.

ESTILO VISUAL Y ENTORNO SOLICITADO: "${visualStyle || 'Cine Moderno Oscuro'}"

REGLAS PARA IMAGE PROMPT:
- El prompt debe describir cinemática moderna. Gente elegante, CEOs encubiertos, traiciones en oficinas de lujo o autos caros. (Ej. "A beautiful elegant woman catching her husband cheating, modern luxury bedroom, tense cinematic lighting").
- Aplica el estilo visual solicitado ("${visualStyle}"). NO uses estéticas de televisión vieja de los 90s. TODO ES MODERNO, en formato vertical móvil y alta calidad (8k, hyperrealistic).
- Formato sugerido: "[Descripción de los personajes modernos], [Acción dramática intensa], [Entorno], ${visualStyle}. --ar 9:16"

Responde SOLO con un JSON válido:
{
  "title": "TÍTULO EN MAYÚSCULAS",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA",
    "image_prompt": "English prompt for thumbnail, highly dramatic modern pose. --ar 16:9"
  },
  "scenes": [
      ${scenesTemplate}
  ]
}`;
    } else if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `Regenera SOLO el prompt de imagen para la escena ${scene_number}.
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Estilo Visual Solicitado: "${visualStyle}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS: Prompt diferente, en inglés. Cinematografía moderna (Estilo DramaBox, CEO moderno, traiciones, alta calidad). NADA de telenovelas antiguas.
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
    console.error("Error generating drama:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
