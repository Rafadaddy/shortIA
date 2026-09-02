import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, style, format, tone } = await req.json();

    const requestedTone = tone || "Libre / Equilibrado";

    // Rich, human-centered angles for the reflection
    const angles = [
      "una escena muy específica del hogar o la infancia que todos reconocen pero nadie nombra",
      "el punto de vista de alguien que cometió un error y tardó años en entender por qué lo hizo",
      "una conversación que nunca tuviste pero necesitabas desesperadamente tener",
      "ese momento exacto en que te diste cuenta de que algo había cambiado para siempre",
      "la sensación de cargar algo que nadie a tu alrededor puede ver pero tú sientes todo el tiempo",
      "un enfoque filosófico crudo que contradice lo que siempre nos enseñaron",
      "una verdad incómoda que la gente sabe pero nunca dice en voz alta",
      "la historia de alguien que se equivocó completamente y salió adelante de una manera inesperada",
      "un golpe de realidad directo: lo que nadie te dice sobre [el tema] hasta que ya es tarde",
      "una metáfora sacada de algo muy cotidiano: una cocina, un semáforo, una llamada perdida",
      "el contraste entre lo que mostramos en redes y lo que sentimos a las 2am",
      "la voz de alguien que pasó por lo peor de [el tema] y encontró algo valioso en el fondo",
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    const requestedStyle = style || "Fotografía Realista";

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    const prompt = `
Eres un escritor de reflexiones virales de alto impacto para TikTok e Instagram. Tu voz es poética, cruda, honesta y estética. Hablas directamente al alma del lector.

${topic ? `El tema central de la reflexión es: "${topic}".` : `Elige un tema profundamente humano (soledad, sanar, dejar ir, empezar de nuevo).`}
Tono Emocional: "${requestedTone}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ÁNGULO ÚNICO PARA HOY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aborda el tema desde este ángulo: **${randomAngle}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 INSTRUCCIONES DE ESCRITURA CRÍTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **TÍTULO VIRAL (máx. 6 palabras):** Provocador y directo al dolor o al alivio.

2. **ESTRUCTURA NARRATIVA (mínimo 150 palabras):**
   - **Apertura:** Una observación hiperespecífica sobre el comportamiento humano.
   - **Desarrollo:** Nombra la emoción cruda que nadie dice en voz alta. Usa frases cortas.
   - **Cierre (EL REMATE FINAL):** El final es lo más importante para que el video se haga viral. DEBE usar uno de estos 3 formatos:
     * *La Pregunta Incómoda:* "¿Hasta cuándo vas a seguir pidiendo perdón por...?" (Para forzar comentarios).
     * *La Verdad Seca:* Una frase cortante de máximo 5 palabras. Ej: "Y eso está bien." o "Nadie vendrá a salvarte."
     * *El Giro de Trama:* Cambia la perspectiva. Ej: "Quéizás no perdiste a esa persona, quizás te recuperaste a ti."

3. **REGLAS DE ESTILO:**
   - Escribe en segunda persona ("tú").
   - Párrafos de 1 o 2 oraciones máximo.
   - CERO frases de autoayuda baratas ("confía en el proceso", "vibra alto"). Quéeremos profundidad literaria.

4. **COHERENCIA DEL PROMPT DE IMAGEN Y TEXTO INTEGRADO (IMPORTANTE):**
   - El usuario NO quiere editar la imagen después. La imagen DEBE llevar el Título integrado de forma creativa.
   - Pide que el texto esté físicamente integrado en el entorno (escrito en un muro, en nubes en el cielo, en un letrero de neón, en un cuaderno, en la arena, tallado en madera, etc.).
   - Asegúrate de especificar que el texto diga EXACTAMENTE el título de la reflexión.

ESTRUCTURA EXACTA DEL IMAGE PROMPT (EN INGLÉS):
"[Sujeto solitario o escena relacionada al tema], [Entorno altamente estético y atmosférico]. Seamlessly integrated into the environment (e.g. written on a wall, glowing in neon, shaped by clouds, or written on a paper), there is bold, stylish typography that perfectly spells: '[TÍTULO EN ESPAÑOL]'. [Estilo visual: ${requestedStyle}], masterpiece, highly detailed. ${aspectRatioFlag}"

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido:
{
  "title": "TÍTULO LLAMATIVO AQUÍ",
  "reflection_text": "Tu reflexión aquí...",
  "image_prompt": "english visual prompt here..."
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.75,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating reflection:", error);
    return NextResponse.json({ error: "Error interno al generar la reflexión" }, { status: 500 });
  }
}
