import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Inicializa el cliente de Groq (asegúrate de poner GROQ_API_KEY en .env.local)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, ideaText, urlText, duration, voice, theme, style } = body;

    const angles = [
      "un enfoque en datos científicos perturbadores o alucinantes",
      "una historia narrativa con un giro inesperado al final",
      "un tono de misterio y suspenso con preguntas sin responder",
      "una perspectiva psicológica explicando por qué la mente nos engaña",
      "un estilo ultra-dinámico de 'cosas que tu maestro no te contó'",
      "un enfoque de conspiración o secretos ocultos",
      "una perspectiva hiper-motivacional y épica"
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];

    let sourceContent = "";
    if (mode === "url") {
      sourceContent = `URL Fuente: ${urlText}`;
    } else {
      sourceContent = ideaText || "Selecciona un tema fascinante y poco conocido al azar";
    }

    const prompt = `
Eres un creador experto de Shorts/Reels virales y un director cinematográfico.
Tema o contenido base: "${sourceContent}"
Temática/Tono Narrativo Seleccionado: "${theme}"
Estilo Visual Seleccionado: "${style}"
Duración objetivo: ${duration} segundos.

⚠️ MUY IMPORTANTE PARA NO REPETIRTE NUNCA: 
HOY debes abordar el tema desde este ángulo específico y único: **${randomAngle}**. 
Si te piden el mismo tema de nuevo, inventa una anécdota, un dato o una situación completamente nueva. NUNCA uses la misma estructura o datos exactos que usaste antes.

Tu tarea es generar un guión altamente dinámico y estructurado en escenas.
Para cada escena provee:
1. "scene_number": El número de escena en secuencia.
2. "narration": El texto que dirá el narrador en la voz en off. DEBE ser extremadamente atrapante. MUY IMPORTANTE: La narración de CADA escena debe ser rica y detallada, de entre 25 a 40 palabras como mínimo.
3. "image_prompt": Un prompt visual EXTREMADAMENTE DETALLADO, EN INGLÉS. Es vital que la imagen represente **DIRECTAMENTE Y LITERALMENTE lo que está pasando en la narración de esta misma escena**. 
ESTRUCTURA OBLIGATORIA DEL PROMPT:
"[Sujeto principal realizando la acción descrita en la narración], [Entorno altamente detallado], [Estilo visual: ${style}], [Iluminación/Detalles: masterpiece, highly detailed, cinematic lighting]".
4. "duration_seconds": Duración estimada de la escena (en segundos). La suma total debe ser ~${duration} segundos.


IMPORTANTE: Debes responder ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura, sin texto adicional ni formato de markdown:
{
  "title": "Título del video",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Texto de narración",
      "image_prompt": "english visual prompt",
      "duration_seconds": 5
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b", // Modelo más estable actual
      response_format: { type: "json_object" }, // Obligamos a Groq a devolver JSON
      temperature: 0.7,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Parseamos el JSON para enviarlo al Frontend
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating script with Groq:", error);
    return NextResponse.json({ error: "Error interno al generar el guión" }, { status: 500 });
  }
}
