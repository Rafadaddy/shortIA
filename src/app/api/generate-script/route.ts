import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Inicializa el cliente de Groq (asegúrate de poner GROQ_API_KEY en .env.local)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, ideaText, urlText, duration, voice, theme, style, format } = body;

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

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
Eres un creador experto de Shorts/Reels virales, un guionista maestro y un director cinematográfico de clase mundial.
Tema o contenido base: "${sourceContent}"
Temática/Tono Narrativo Seleccionado: "${theme}"
Estilo Visual Seleccionado: "${style}"
Formato de Imagen: ${requestedFormat} (${aspectRatioFlag})
Duración objetivo: ${duration} segundos.

⚠️ INSTRUCCIONES CRÍTICAS DE CALIDAD Y COHERENCIA:
1. NO TE REPITAS: Hoy debes abordar el tema desde este ángulo: **${randomAngle}**. Inventa una anécdota, dato o situación completamente nueva y fascinante.
2. GUION MAGNÉTICO: Estructura el guion con un GANCHO BRUTAL en los primeros 3 segundos, un DESARROLLO lleno de intriga o valor, y un CLÍMAX/LLAMADO A LA ACCIÓN al final. Queremos que el usuario se quede pegado a la pantalla.
3. COHERENCIA ABSOLUTA IMAGEN-TEXTO: La queja número 1 es que tus imágenes no coinciden con tu texto. El "image_prompt" DEBE reflejar **LITERALMENTE** lo que se narra en esa escena específica. Si hablas de un reloj antiguo rompiéndose, la imagen DEBE describir un reloj antiguo rompiéndose en pedazos. No pongas paisajes genéricos si la voz habla de una persona.

Tu tarea es generar el guión escena por escena.
Para CADA escena provee:
1. "scene_number": El número de escena.
2. "narration": El texto que dirá el narrador. Debe ser conversacional, fluido y muy atrapante (mínimo 20-35 palabras por escena).
3. "image_prompt": Un prompt visual EXTREMADAMENTE DETALLADO EN INGLÉS. 
ESTRUCTURA EXACTA Y OBLIGATORIA DEL PROMPT:
"[Descripción exacta y literal de la acción principal que coincide con la narración], [Entorno altamente detallado], [Estilo visual: ${style}], [Iluminación: masterpiece, highly detailed, cinematic lighting] ${aspectRatioFlag}".
(Asegúrate de SIEMPRE poner ${aspectRatioFlag} al mismísimo final del texto del image_prompt).
4. "duration_seconds": Duración estimada (ej. 5). La suma total debe ser ~${duration}.

IMPORTANTE: Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "title": "Título súper viral",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Texto de la voz en off...",
      "image_prompt": "english visual prompt ending with ${aspectRatioFlag}",
      "duration_seconds": 6
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
