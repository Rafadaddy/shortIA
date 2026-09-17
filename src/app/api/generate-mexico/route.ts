export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, tone, visualStyle, idea, sceneCount, current_script, instruction, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type, protagonist } = requestBody;

    const count = sceneCount ? parseInt(sceneCount) : 8;
    const requestedDuration = duration || "10 Segundos";
    
    let prompt = "";

    if (mode === "ideas") {
      prompt = `Actúa como un guionista experto en cultura mexicana y en contenido viral para TikTok México. Tu nicho es "Cosas que solo pasan en una casa mexicana".
TEMA / CATEGORÍA ELEGIDA: "${topic}"
PROTAGONISTA: "${protagonist || 'Cualquiera'}"
TONO: "${tone}"

Genera 5 ideas de videos virales basándote en la categoría solicitada. 
CONTEXTO DE LA CATEGORÍA:
1. ECONOMÍA: La tanda, abono de Coppel/Elektra, recibo de la CFE, el gas, quincena, remesas.
2. FAMILIA EXTENSA: Suegra, cuñado arrimado, pelear por el terreno de la abuela, primos.
3. DRAMA: La chancla, control de la tele, no lavar platos, chismes.
4. TRADICIONES: Tamales, rosca, 15 años endeudados, carne asada, recalentado.
5. CASA FÍSICA: Gotera, boiler, perro come-chanclas, techo de lámina o Infonavit.
6. AMOR/VECINDAD: Vecinos Vigilantes en WhatsApp, fierro viejo, amor de tianguis.
7. SOLUCIONES: VapoRub, alambre, pedir fiado.

REGLAS:
1. SOLO 1 IDEA POR SHORT.
2. Usa lenguaje muy orgánico y reconocible por los mexicanos.

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "TÍTULO VIRAL (Ej: Cuando llega el de la tanda)",
      "hook": "HOOK 0-3 SEGUNDOS (Frase inicial del video)",
      "pain_point": "El conflicto familiar/casero que se relata",
      "why_it_works": "Por qué el mexicano promedio se identificará de inmediato"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Actúa como un guionista experto en cultura mexicana para TikTok. Nicho: "Cosas que solo pasan en una casa mexicana".

CATEGORÍA BASE: "${topic}"
PROTAGONISTA: "${protagonist || 'La Mamá Mexicana'}"
TONO ELEGIDO: "${tone}"
TEMA A DESARROLLAR: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

INSTRUCCIONES PARA EL CONTENIDO:
1. Con diálogos y expresiones 100% mexicanas orgánicas (usa sutilmente palabras como: güey, chale, órale, no manches, mija/mijo, ándale, qué oso, nmms, etc.).
2. Relata el drama casero en primera persona (POV) o como una anécdota intensa.
3. INICIA con el Hook fuerte que capture la atención.
4. MANTÉN el Tono Elegido ("${tone}"). Si es comedia, hazlo absurdo. Si es terror de mamá, que se sienta el pánico a la chancla.
5. TAMAÑO: Escribe un texto continuo, hilado y robusto (aprox 130-200 palabras) para dividirse luego en ${count} escenas. NO enumeres las escenas.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo de la narración, hilado y continuo, sin enumerar escenas..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres el guionista de comedia mexicana para TikTok. Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"
Tono actual: "${tone}"

Reescribe el guion completo aplicando la instrucción. Mantén el sabor 100% mexicano, el chisme o el drama de casa de Infonavit.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
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

      prompt = `Eres un director de arte para TikToks de "Cosas típicas de familias mexicanas".
El usuario ya aprobó el guion. YO he dividido el guion en EXACTAMENTE ${count} escenas.

TUS ESCENAS (NO ALTERES LA NARRACIÓN):
${scenesTextBlocks}

TU TAREA:
1. Genera un concepto visual que coincida con la narración.
2. Genera los prompts visuales en INGLÉS para Midjourney/AI.

ESTILO VISUAL SOLICITADO: "${visualStyle}"

REGLAS PARA IMAGE PROMPT:
- El prompt debe describir hogares latinoamericanos/mexicanos realistas (mesas con mantel de plástico, sillas Coca-Cola, paredes a medio pintar, patios con tendederos, mamás con mandil, etc. dependiendo la escena).
- Si hay chancla, documéntalo.
- Usa hiper-realismo o estilo de cámara celular (POV).
- NUNCA uses nombres de marcas prohibidas explícitamente, pero describe el objeto ("yellow plastic bag", "blue water tank on roof" para tinaco Rotoplas).
- Formato sugerido: "[Sujeto mexicano], [Acción cómica/dramática], [Entorno de casa mexicana], ${visualStyle}. --ar 9:16"

Responde SOLO con un JSON válido:
{
  "title": "TÍTULO EN MAYÚSCULAS",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA",
    "image_prompt": "English prompt for thumbnail, highly dramatic/comedic pose. --ar 16:9"
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

REGLAS: Prompt diferente, en inglés. Entorno realista de casa mexicana.
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
  } catch (error: any) {
    console.error("Error generating mexico:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
