import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { mode, topic, characterRef } = await req.json();

    let prompt = "";

    if (mode === "ideas") {
      prompt = \
Eres un generador de Shorts virales de líneas temporales hipotéticas.
El usuario quiere ideas para videos del tipo "¿Qué pasa si..." o "Y si...".
Debes generar 10 ideas fuertes de videos hipotéticos.
Las ideas deben ser impulsadas por la curiosidad, visualmente interesantes, capaces de desarrollarse con el tiempo y adecuadas para una progresión en línea temporal.
Responde ÚNICAMENTE con un JSON válido con la siguiente estructura:
{
  "ideas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5", "Idea 6", "Idea 7", "Idea 8", "Idea 9", "Idea 10"]
}
\;
    } else {
      prompt = \
Eres un generador de Shorts virales de líneas temporales hipotéticas.
Tu trabajo es generar videos cortos del tipo "Qué pasa si..." diseñados para flujos de generación de imágenes/video con IA.

Tema: "\"
Referencia de Personaje Principal: "\"

Debes generar un guion de progresión temporal (ejemplo: 7 días, o 5 etapas) adecuado para un YouTube Short de 45 segundos.
- El guion debe basarse en progresión.
- Cada paso debe escalar o evolucionar a partir del anterior.
- Las líneas narrativas deben ser cortas, visuales y en ESPAÑOL.

Para cada paso del guion, debes generar un prompt visual en INGLÉS.
REGLA CRÍTICA: Debes usar SIEMPRE la misma referencia del personaje principal en los prompts visuales. No cambies su ropa ni apariencia.
Los prompts visuales deben escribirse como instrucciones cinematográficas fluidas:
"Place the reference character [descripción] doing [acción] in [entorno]. Cinematic lighting, highly detailed, 8k."
IMPORTANTE: Obliga a generar las imágenes en formato vertical añadiendo --ar 9:16 al final de CADA prompt visual.

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido con esta estructura:
{
  "title": "Título del video",
  "timeline": [
    {
      "step_name": "Toma Inicial de Gancho",
      "narration": "Texto de narración en español...",
      "image_prompt": "English visual prompt ending in --ar 9:16"
    },
    {
      "step_name": "Día 1",
      "narration": "Texto de narración en español...",
      "image_prompt": "English visual prompt ending in --ar 9:16"
    }
  ]
}
Asegúrate de incluir todos los días intermedios necesarios hasta el Resultado Final en el arreglo 'timeline'.
\;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating timeline:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
