import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, idea, format, style } = await req.json();

    const requestedFormat = format || "Vertical (9:16)";
    const requestedStyle = style || "Cinemático Oscuro (Motivación)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("3:4")) aspectRatioFlag = "--ar 3:4";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    let styleInstruction = "";
    if (requestedStyle.includes("Cinemático Oscuro")) {
      styleInstruction = "A dark, cinematic, high-contrast, moody photography style. Think millionaire mindset, sigma male, dramatic shadows, silhouettes, glowing light at the end of a tunnel. The typography must be bold, aggressive, clean, often in white and yellow or gold. Masterpiece, 8k, photorealistic.";
    } else if (requestedStyle.includes("Aesthetic Tierno")) {
      styleInstruction = "A cozy, cute, hand-drawn aesthetic illustration style. Watercolor textures, soft pastel colors, emotional and tender. The typography should look like beautiful hand-written calligraphy or cute bubble letters integrated playfully into the environment.";
    } else if (requestedStyle.includes("Minimalista Elegante")) {
      styleInstruction = "A clean, minimalist, high-end editorial style. Lots of negative space, neutral colors (black, white, beige). The typography must be sleek, modern serif or sans-serif, elegant and sophisticated.";
    } else if (requestedStyle.includes("Mural Urbano")) {
      styleInstruction = "An urban street photography style. A highly realistic photo of a large concrete wall, brick wall, or city surface. The typography MUST look like it is physically painted directly onto the wall (like a clean mural or stencil street art). Natural daylight, shadows of trees or buildings, ultra-realistic street aesthetic.";
    } else {
      styleInstruction = `A high quality visual artwork in the style of ${requestedStyle}. Integrated typography that fits the mood.`;
    }

    const prompt = `
Eres un director de arte experto en crear contenido visual viral para redes sociales.
Tu especialidad es generar imágenes impactantes que INCLUYEN TEXTO DIRECTAMENTE EN LA COMPOSICIÓN.

Nicho / Temática: "${niche}"
Estilo Visual Solicitado: "${requestedStyle}"
${idea ? `Idea del usuario: "${idea}"` : `Genera una idea al azar súper original y viral basada en este nicho.`}
Formato objetivo: ${requestedFormat} (${aspectRatioFlag})

Instrucciones:
1. "title": Un título corto de la idea.
2. "suggested_phrase": La frase exacta que irá escrita DENTRO de la imagen. Debe ser CORTA (entre 5 y 15 palabras máximo), brutalmente impactante, ingeniosa o motivacional. Usa un español neutro.
3. "image_prompt": EL PROMPT EN INGLÉS PARA GENERAR LA IMAGEN EN DALL-E 3 O MIDJOURNEY v6. 
ESTRUCTURA ESTRICTA DEL PROMPT:
"[Describe exactamente la escena principal y el sujeto]. ${styleInstruction} Integrated into the artwork, there is bold typography that perfectly reads: '[SUGGESTED_PHRASE_EN_ESPAÑOL]'. [Describe dónde está el texto, ej. escrito gigante en la pared, texto flotante brillante, tipografía elegante en el espacio negativo]. ${aspectRatioFlag}"
4. "caption": Un pequeño texto para publicar junto a la imagen en redes sociales (pie de foto). Debe ser altamente relacionado con la imagen, empático o motivacional. Extensión: entre 20 y 50 palabras. Usa emojis relevantes 🔥🚀. JAMÁS uses etiquetas estructurales como "Caption:" o "Texto:". Escribe solo el texto limpio y directo.

IMPORTANTE: El prompt DEBE estar en inglés (porque DALL-E/Midjourney entienden mejor), pero la FRASE que le pides que escriba ("...") DEBE ESTAR EN EL ESPAÑOL EXACTO que generaste en suggested_phrase.

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "...",
  "suggested_phrase": "...",
  "image_prompt": "...",
  "caption": "..."
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating illustration:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
