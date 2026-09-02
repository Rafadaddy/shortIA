import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, style, format, tone } = await req.json();

    const requestedTone = tone || "Libre / Equilibrado";

    // Rich, human-centered angles for the reflection
    const angles = [
      "la perspectiva de alguien cansado en la cocina a las 3 de la mañana, fijándose en el silencio incómodo de la casa",
      "el trayecto en transporte público o tráfico al trabajo, observando a extraños y dándote cuenta de una verdad cruda",
      "la sensación de lavar los platos o hacer una tarea mundana y que de golpe te caiga un balde de realidad",
      "la perspectiva de alguien que acaba de borrar un mensaje larguísimo y en su lugar mandó solo 'ok'",
      "esa conversación incómoda en la sala de espera de un hospital o dentista, donde todo se siente frágil",
      "la sensación de mirar el techo de la habitación un domingo por la tarde cuando cancelaste todos tus planes",
      "el contraste entre estar rodeado de gente en una fiesta, con la música alta, y sentirte completamente aislado",
      "el momento de empacar cajas en una mudanza, viendo cómo la vida entera cabe en cartón",
      "el instante en el espejo del baño público, echándote agua en la cara para fingir que todo está bien",
      "el sonido de la lluvia golpeando la ventana del copiloto, mientras piensas en el error que cometiste hace años",
      "la calma fría y extraña que llega después de llorar hasta quedarte dormido",
      "el momento de pagar en el supermercado, fingiendo normalidad mientras el mundo interno se desmorona"
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    const requestedStyle = style || "Fotografía Realista";

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    const prompt = `
Eres un escritor de reflexiones virales de alto impacto para TikTok e Instagram. Tu voz es auténtica, directa y profundamente realista. Escribes desde el "barro" de la cotidianidad, sin filtros y sin pretensiones poéticas.

${topic ? `El tema central de la reflexión es: "${topic}".` : `Elige un tema profundamente humano (soledad, sanar, dejar ir, empezar de nuevo).`}
Tono Emocional: "${requestedTone}"

================================================
⭐ ÁNGULO ÚNICO PARA HOY (ESCENARIO MUNDANO)
================================================
Aborda el tema desde este escenario o perspectiva hiperrealista: **${randomAngle}**
Concéntrate en los objetos físicos y la atmósfera de este lugar o momento.

================================================
⚠️ INSTRUCCIONES DE ESCRITURA CRÍTICAS
================================================
1. **TÍTULO VIRAL (máx. 6 palabras):** Provocador y directo al dolor o al alivio.

2. **ESTRUCTURA NARRATIVA (mínimo 150 palabras):**
   - **Apertura:** Inicia describiendo un detalle físico, mundano y aburrido del entorno asignado en el Ángulo Único. Ancla al lector a la realidad antes de hablar de emociones.
   - **Desarrollo:** Nombra la emoción cruda que nadie dice en voz alta. Usa frases cortas y planas. Conecta el entorno mundano con la reflexión profunda.
   - **Cierre (EL REMATE FINAL):** EVITA finales esperanzadores y mágicos. El final DEBE usar uno de estos 3 formatos:
     * *La Pregunta Incómoda:* "¿Hasta cuándo vas a seguir pidiendo perdón por...?"
     * *La Verdad Seca:* Una frase cortante de máximo 5 palabras. Ej: "Y eso está bien." o "Nadie vendrá a salvarte."
     * *El Giro de Trama:* Cambia la perspectiva. Ej: "Quizás no perdiste a esa persona, quizás te recuperaste a ti."

3. **REGLAS DE ESTILO (CRÍTICAS):**
   - Escribe en segunda persona ("tú") o primera persona ("yo"), con un tono conversacional, plano y directo.
   - Párrafos de 1 o 2 oraciones máximo.
   - 🚫 ESTRICTAMENTE PROHIBIDO: Usar metáforas poéticas, descripciones románticas, palabras como 'resiliencia', 'corazón roto' o frases de autoayuda baratas ("confía en el proceso", "vibra alto"). Queremos cruda realidad.
   - ⚡ **REGLA OBLIGATORIA:** ¡DEBES incluir ABUNDANTES emojis a lo largo de todo el texto! Pon emojis (🔥, 💔, ✨, 🧠, 🌊, ☕, 🕰️, etc.) al final de las frases o párrafos para que tenga muchísima vida visual. NUNCA entregues un texto plano sin emojis.

4. **COHERENCIA DEL PROMPT DE IMAGEN Y TEXTO INTEGRADO (IMPORTANTE):**
   - El usuario NO quiere editar la imagen después. La imagen DEBE llevar el Título integrado de forma creativa.
   - Pide que el texto esté físicamente integrado en el entorno (escrito en un muro, en nubes en el cielo, en un letrero de neón, en un cuaderno, en la arena, tallado en madera, etc.).
   - Asegúrate de especificar que el texto diga EXACTAMENTE el título de la reflexión.

ESTRUCTURA EXACTA DEL IMAGE PROMPT (EN INGLÉS):
"[Sujeto solitario o escena relacionada al tema], [Entorno altamente estético y atmosférico]. Seamlessly integrated into the environment (e.g. written on a wall, glowing in neon, shaped by clouds, or written on a paper), there is bold, stylish typography that perfectly spells: '[TÍTULO EN ESPAÑOL]'. [Estilo visual: ${requestedStyle}], masterpiece, highly detailed. ${aspectRatioFlag}"

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido:
{
  "title": "TÍTULO LLAMATIVO AQUÍ",
  "reflection_text": "Tu reflexión aquí, llena de emojis y significado...",
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
