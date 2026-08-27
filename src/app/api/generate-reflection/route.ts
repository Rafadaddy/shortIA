import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, style, format } = await req.json();

    const angles = [
      "una anécdota personal impactante",
      "un enfoque filosófico crudo",
      "una metáfora de la vida diaria",
      "un golpe de realidad directo y sin filtros",
      "una historia de fracaso que termina en éxito",
      "un consejo poco convencional (contrarian)",
      "una comparación con la naturaleza o el universo"
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    const requestedStyle = style || "Fotografía Realista";
    
    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    const prompt = `
Eres un creador de contenido viral y un experto en psicología persuasiva, de los mejores del mundo reteniendo la atención del lector.

${topic ? `El tema o situación es: "${topic}".` : `Elige aleatoriamente un tema universal, polémico o profundamente emocional.`}

⚠️ INSTRUCCIONES CRÍTICAS DE CALIDAD Y COHERENCIA:
1. NO TE REPITAS: Incluso si el usuario te pide el mismo tema, HOY debes abordarlo desde este ángulo: **${randomAngle}**. Inventa una situación completamente nueva cada vez.
2. TEXTO MAGNÉTICO Y LIMPIO (**ESTRICTAMENTE EN ESPAÑOL**):
   - Título Viral: Corto (máx 6 palabras), súper llamativo ("clickbait" elegante).
   - Estructura: Ten un gancho inicial, un desarrollo empático y un consejo final.
   - 🚫 REGLA DE ORO: **NUNCA escribas palabras estructurales dentro del texto como "Gancho:", "Desarrollo:", "Desenlace:", "Reflexión:"**. Escribe única y exclusivamente los párrafos fluidos y limpios para ser copiados y pegados.
   - Usa párrafos cortos y emojis 🔥.
3. COHERENCIA ABSOLUTA IMAGEN-TEXTO: El "image_prompt" en inglés DEBE reflejar **LITERALMENTE** lo que pasa en tu reflexión. Si hablas de una persona llorando bajo la lluvia, el prompt debe describir a una persona llorando bajo la lluvia.

ESTRUCTURA EXACTA Y OBLIGATORIA DEL PROMPT VISUAL:
"[Descripción exacta y literal de la acción principal que coincide con la reflexión], [Entorno altamente detallado], [Estilo visual: ${requestedStyle}], [Iluminación/Detalles: masterpiece, highly detailed, dramatic lighting] ${aspectRatioFlag}".
(Asegúrate de SIEMPRE poner ${aspectRatioFlag} al mismísimo final del texto del image_prompt).

Ejemplo de JSON:
{
  "title": "TÍTULO LLAMATIVO AQUÍ",
  "reflection_text": "Tu reflexión de al menos 150 palabras aquí...",
  "image_prompt": "A highly realistic photograph of... masterpiece, cinematic lighting ${aspectRatioFlag}"
}

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "TÍTULO LLAMATIVO AQUÍ",
  "reflection_text": "Tu reflexión de al menos 150 palabras aquí...",
  "image_prompt": "english visual prompt here..."
}
`;

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
    console.error("Error generating reflection:", error);
    return NextResponse.json({ error: "Error interno al generar la reflexión" }, { status: 500 });
  }
}
