import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

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

    const prompt = `
Eres un creador de contenido viral y un experto en psicología persuasiva, de los mejores del mundo reteniendo la atención del lector.

${topic ? `El tema o situación es: "${topic}".` : `Elige aleatoriamente un tema universal, polémico o profundamente emocional.`}

⚠️ MUY IMPORTANTE PARA NO REPETIRTE: 
Incluso si el usuario te pide el mismo tema varias veces, HOY debes abordarlo desde este ángulo específico y único: **${randomAngle}**. 
NUNCA uses las mismas palabras, la misma historia o el mismo ejemplo de antes. Inventa una situación completamente nueva cada vez.

Tu tarea es escribir un texto impactante, magnético y transformador relacionado con el tema.
DEBES cumplir estrictamente con los siguientes requisitos:
1. **Longitud:** Mínimo absoluto de 150 palabras.
2. **Estructura Magnética:** 
   - **Título Viral:** Genera un título corto (máximo 6 palabras), súper llamativo y "clickbait" elegante que resuma la reflexión.
   - **Gancho Brutal (Inicio):** Una afirmación controversial, una pregunta que rompa la mente o una revelación dura que obligue a la persona a seguir leyendo. 
   - **Desarrollo (Psicología pura):** Explica por qué nos pasa eso con un tono directo, crudo y empático. Sin sonar como poesía barata. Habla de frente, como un amigo sabio que te dice verdades a la cara.
   - **Desenlace (Conclusión):** Un consejo súper práctico, empoderador y que te deje pensando.
3. **Estilo:** Usa un ritmo de lectura dinámico, párrafos cortos y usa **emojis estratégicos** 🚀🔥 a lo largo de todo el texto.

Además, debes generar un "image_prompt" en INGLÉS. 
Este prompt visual ES CRÍTICO y debe estar **100% RELACIONADO con el texto que acabas de inventar**.
Piensa en el PROTAGONISTA de tu texto y la situación exacta que describes.
Sigue ESTA ESTRUCTURA EXACTA:
"[Personaje principal haciendo una acción literal relacionada al texto], [Entorno detallado y luminoso], [Estilo visual: 3D Pixar style / high quality comic style], [Iluminación: bright cinematic lighting, masterpiece, clear face, highly detailed]".

Ejemplo si tu texto habla de salir de la zona de confort: "A clear 3D Pixar style cartoon of a young man looking nervous but excited, stepping out of a boring gray office into a bright, colorful magical forest. Masterpiece, vibrant colors, clear expressive face, bright lighting."

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "TÍTULO LLAMATIVO AQUÍ",
  "reflection_text": "Tu reflexión de al menos 150 palabras aquí...",
  "image_prompt": "english visual prompt here..."
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
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
