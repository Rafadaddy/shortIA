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
      prompt = `Actúa como el mejor guionista y estratega de contenido viral de TikTok y Shorts en el nicho de "Telenovelas Mexicanas" (Melodrama, Villanas, Chisme).
TEMA ELEGIDO: "${topic || 'Villanas Icónicas'}"
TONO ELEGIDO: "${tone || 'La Tía Chismosa (Humor y chisme)'}"

Genera 5 ideas de video altamente atractivas y muy clicables. 
CONTEXTO DEL NICHO:
- Villanas: Teresa, Rubí, Soraya Montenegro, Paola Bracho.
- Debates (¿Teresa o Rubí?), muertes absurdas, cachetadas irreales, chismes de producción (finales alternativos, peleas reales).

REGLAS:
1. SOLO 1 IDEA POR SHORT. Que genere polémica, nostalgia o muchísima curiosidad.
2. HOOKS VISCERALES (Ej: "La televisión mexicana prohibió esto...", "La cachetada que mandó a la actriz al hospital...").

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "TÍTULO (3-4 palabras en MAYÚSCULAS)",
      "hook": "HOOK 0-3 SEGUNDOS (Frase de shock o debate)",
      "pain_point": "De qué trata el chisme o debate y por qué engancha",
      "why_it_works": "Por qué se hará viral (polémica, nostalgia)"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Actúa como el creador de contenido viral #1 de TikTok sobre "Telenovelas Mexicanas".

TONO ELEGIDO: "${tone || 'La Tía Chismosa (Humor y chisme)'}"
- Si es "La Tía Chismosa": Usa jerga mexicana moderna (Agárrense, devoró, quedó tieso, la neta, funaron a).
- Si es "Narrador Dramático de Televisa": Usa voz grave, profunda y exagerada ("Una red de traición y mentiras...").
- Si es "Análisis Psicológico / Crítico": Sé analítico, desglosando la psicología del personaje ("Rubí no era mala, era un producto de su entorno...").

TEMA A DESARROLLAR: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS OBLIGATORIAS:
1. SOLO 1 TEMA CENTRAL (ej. un personaje, una escena, un chisme).
2. CONTEXTO MÉXICO: Telenovelas icónicas (Teresa, Rubí, María la del Barrio, La Usurpadora, La Rosa de Guadalupe).
3. ESTRUCTURA DEL GUION:
   - Hook Visceral (0-3s).
   - Desarrollo del Chisme/Análisis (Detalles jugosos o frases célebres).
   - El Giro (El final alternativo, la verdad detrás, o el karma).
   - CIERRE POLARIZANTE: Termina con un CTA de debate (Ej: "¿Y tú, eres Team Teresa o Team Rubí?").
4. TAMAÑO: Escribe un bloque de texto continuo y robusto (aprox 130-200 palabras) para dividirse luego en ${count} escenas.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo de la locución, hilado y continuo, sin enumerar escenas..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres el guionista experto en Telenovelas. Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"
Tono actual: "${tone}"

Reescribe el guion completo aplicando la instrucción. Mantén el drama noventero o el chisme jugoso.

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

      prompt = `Eres un director de arte para un canal de reseñas de Telenovelas Mexicanas.
El usuario ya aprobó el guion. YO he dividido el guion en EXACTAMENTE ${count} escenas.

TUS ESCENAS (NO ALTERES LA NARRACIÓN):
${scenesTextBlocks}

TU TAREA:
1. Genera un concepto visual que coincida con la narración.
2. Genera los prompts visuales en INGLÉS para un generador de IA.

ESTILO VISUAL Y ENTORNO SOLICITADO: "${visualStyle || 'Nostalgia Noventera (Sepia / Grano vintage)'}"

REGLAS PARA IMAGE PROMPT:
- El prompt debe describir escenas de telenovelas dramáticas (ej. "A beautiful Mexican woman in a red dress looking greedy and ambitious, dramatic lighting", "Two identical twin women fighting in a mansion", "A 90s TV set behind the scenes").
- Aplica el estilo visual solicitado (Ej. Si es Noventera: "1990s TV aesthetic, vintage grain, warm colors". Si es saturada 2000s: "High saturation, 2000s soap opera look, vibrant red lips").
- NUNCA uses nombres de actores reales (Angelique Boyer, Bárbara Mori) porque la IA gráfica los bloquea, descríbelas físicamente.
- Formato sugerido: "[Descripción de la mujer/hombre], [Acción dramática], [Entorno estilo mansión/estudio], ${visualStyle}. --ar 9:16"

Responde SOLO con un JSON válido:
{
  "title": "TÍTULO EN MAYÚSCULAS",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA (Ej: ¿RUBÍ O TERESA?)",
    "image_prompt": "English prompt for thumbnail, highly dramatic pose. --ar 16:9"
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

REGLAS: Prompt diferente, en inglés. Describe a los personajes sin usar nombres reales de celebridades. Añade la estética de "${visualStyle}".
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
    console.error("Error generating telenovela:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
