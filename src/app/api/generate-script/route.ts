import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Inicializa el cliente de Groq (asegúrate de poner GROQ_API_KEY en .env.local)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, ideaText, urlText, duration, voice, theme, style } = body;

    let sourceContent = "";

    if (mode === "url") {
      console.log(`Extrayendo contenido de la URL: ${urlText}`);
      sourceContent = `URL Fuente: ${urlText}\nTranscripción simulada: "El universo está lleno de misterios insondables. ¿Sabías que existe un planeta hecho enteramente de diamantes? Hoy te cuento los secretos más brillantes del cosmos..."`;
    } else {
      sourceContent = ideaText;
    }

    const prompt = `
Eres un creador experto de Shorts/Reels virales y un director cinematográfico.
Tema o contenido base: "${sourceContent}"
Temática/Tono Narrativo Seleccionado: "${theme}"
Estilo Visual Seleccionado: "${style}"
Duración objetivo: ${duration} segundos.

Tu tarea es generar un guión altamente dinámico y estructurado en escenas que respete el tono narrativo solicitado.
Para cada escena provee:
1. "scene_number": El número de escena en secuencia.
2. "narration": El texto que dirá el narrador en la voz en off. DEBE ser extremadamente atrapante, magnético y educativo. Usa técnicas de retención de YouTube Shorts/TikTok (empieza con un gancho brutal que rompa patrones, mantén el ritmo rápido, da datos de alto valor o curiosidades increíbles). Escribe de manera conversacional. MUY IMPORTANTE: La narración de CADA escena debe ser rica y detallada, de entre 25 a 40 palabras como mínimo. NO des narraciones súper cortas de 5 o 6 palabras. Queremos que el narrador tenga tiempo suficiente para explicar el punto con claridad mientras se muestra la imagen.
3. "image_prompt": Un prompt visual EXTREMADAMENTE DETALLADO, EN INGLÉS. Es vital que la imagen represente DIRECTAMENTE el tema base y la narración (ej. si hablan de ahorrar dinero, la imagen DEBE mostrar fajos de billetes, alcancías rompiéndose, bóvedas gigantes, monedas de oro cayendo). El prompt debe ser MUY EXAGERADO y llamativo para retener la atención en TikTok/Reels. Describe el sujeto principal u objetos centrales, iluminación (ej. cinematic lighting), estilo de cámara y atmósfera. Es OBLIGATORIO incluir palabras clave de alta calidad (masterpiece, 8k resolution, ultra-detailed). NUNCA generes personajes o cosas aleatorias que no tengan que ver con el tema central.
4. "duration_seconds": Duración estimada de la escena (en segundos). La suma total de las duraciones debe ser aproximadamente de ${duration} segundos.

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
