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

    const characterBase = "original character, mature adult anthropomorphic white duck, elegant wealthy businessman, wearing black suit blazer with vest, white dress shirt slightly open, thin delicate gold chain necklace, elegant gold wristwatch with gold bracelet, single gold signet ring, black sunglasses with gold details, serious sophisticated confident expression, not angry not cute, realistic feathers, detailed, ultra realistic, 8k, photorealistic, highly detailed, cinematic lighting --style raw";

    if (mode === "ideas") {
      prompt = `Actúa como el estratega viral para el canal "EL PATO CAPITALISTA".
PERSONAJE: Pato blanco multimillonario, sumamente educado, elegante y sofisticado (estilo Rico McPato). Habla con propiedad y mucha clase sobre finanzas en México.
AUDIENCIA: Mexicanos 20-40 años (ganan $8k-$30k).
CONTEXTO: OXXO, NU, BBVA, Coppel, CETES, tandas, quincena. CERO JERGA DE CALLE (No uses "varo", "chamba", ni hables como pandillero).
TONO ELEGIDO PARA HOY: "${tone || 'Directo y Regañón'}"

Genera 5 ideas de video altamente atractivas y muy clicables basadas en el TEMA: "${topic || 'Finanzas y Mentalidad'}"
REGLAS:
1. SOLO 1 IDEA POR SHORT. Que duela, que enseñe y que se comparta.
2. CERO GENERICIDADES. Conecta con el mexicano promedio.

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "TÍTULO (3-4 palabras)",
      "hook": "HOOK 0-3 SEGUNDOS (Frase que para el scroll)",
      "pain_point": "El dolor financiero del mexicano que resuelve",
      "why_it_works": "Por qué se hará viral"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Actúa como el guionista de Shorts virales para mi canal "EL PATO CAPITALISTA".

PERSONAJE: Pato blanco multimillonario, educado, elegante, con un lenguaje impecable y sofisticado (estilo Rico McPato). Es un magnate enseñándole a sus aprendices sobre el dinero en México. NO habla como de la calle ni usa jerga de barrio. Habla con clase, autoridad y extrema riqueza.
TONO ELEGIDO: "${tone || 'Directo y Regañón'}"
AUDIENCIA: Mexicanos 20-40 años que ganan $8k-$30k, con deudas, quieren ahorrar e invertir.
TEMA A DESARROLLAR: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS OBLIGATORIAS PARA EL GUION:
1. SOLO 1 IDEA CENTRAL. Nada de "3 consejos". 1 idea que cale.
2. CONTEXTO MÉXICO 2026: OXXO, NU, BBVA, Coppel, CETES, tandas, quincena.
3. CERO GENERICIDADES.
4. TONO: Ajustado al tono elegido ("${tone}"). Educado, directo, de alta sociedad. Mantiene el contexto mexicano pero con lenguaje culto y de negocios.
5. CIERRE MATADOR: Termina con una frase dura del pato + CTA (Ej: "Sígueme, no seas...").
6. TAMAÑO: DEBES escribir texto suficiente (aprox 130-200 palabras) para dividirse en ${count} escenas sin quedar vacío. Es un monólogo continuo.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del monólogo, sin nombres de escenas, solo el texto puro..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres el guionista de "EL PATO CAPITALISTA". Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"
Tono actual: "${tone || 'Regañón'}"

Reescribe el guion completo aplicando la instrucción y manteniendo el tono.

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

      prompt = `Eres un director de arte para el canal "EL PATO CAPITALISTA".
El usuario ya aprobó el guion. YO he dividido el guion en EXACTAMENTE ${count} escenas.

TUS ESCENAS (NO ALTERES LA NARRACIÓN):
${scenesTextBlocks}

TU TAREA:
1. Genera un concepto visual que coincida con la narración.
2. Genera los prompts visuales en INGLÉS.

Personaje OBLIGATORIO en cada escena: ${characterBase}
ESTILO VISUAL Y ENTORNO SOLICITADO PARA EL VIDEO: "${visualStyle || 'Oficina Lujosa'}"

REGLAS PARA IMAGE PROMPT:
- El prompt DEBE INCLUIR LA DESCRIPCIÓN BASE COMPLETA DEL PERSONAJE.
- Ponlo en el ENTORNO SOLICITADO ("${visualStyle}") o que adapte el contraste (ej. un pato millonario en un OXXO si la historia lo amerita).
- Formato sugerido: "${characterBase}, [Pose/Acción], [Entorno]. --ar 4:5"

Responde SOLO con un JSON válido:
{
  "title": "TÍTULO EN MAYÚSCULAS",
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
Entorno/Estilo base: "${visualStyle}"
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
    console.error("Error generating duck:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
