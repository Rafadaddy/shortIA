import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, idea, format } = await req.json();

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("3:4")) aspectRatioFlag = "--ar 3:4";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    const prompt = `
Eres un director de arte e ilustrador experto en crear contenido viral para Instagram, Pinterest y TikTok.
Tu especialidad son las ILUSTRACIONES AESTHETIC (tipo dibujo a mano, acuarela suave, arte digital tierno o humorístico) que INCLUYEN TEXTO DIRECTAMENTE EN LA IMAGEN.

Nicho / Temática seleccionada: "${niche}"
${idea ? `Idea del usuario: "${idea}"` : `Genera una idea al azar súper original y viral basada en este nicho.`}
Formato objetivo: ${requestedFormat} (${aspectRatioFlag})

Debes generar los elementos para que el usuario pueda crear esta imagen usando DALL-E 3 o Midjourney v6 (las cuales pueden generar texto en imágenes).

Instrucciones:
1. "title": Un título corto de la idea.
2. "suggested_phrase": La frase exacta que irá escrita DENTRO de la imagen. Debe ser CORTA (menos de 10 palabras preferiblemente), ingeniosa, graciosa o altamente motivacional. Usa un español neutro.
3. "image_prompt": EL PROMPT EN INGLÉS PARA GENERAR LA IMAGEN. 
ESTRUCTURA ESTRICTA DEL PROMPT:
"A highly detailed digital illustration in a cozy, cute, hand-drawn aesthetic style. [Describe exactly the characters and the situation happening]. Integrated into the artwork, there is stylized, beautiful typography that reads: '[SUGGESTED_PHRASE_EN_ESPAÑOL]'. [Describe where the text is placed, e.g., written in the sky, painted on the stairs, floating as text bubbles]. Pastel colors, warm lighting, masterpiece. ${aspectRatioFlag}"

IMPORTANTE: El prompt DEBE estar en inglés (porque DALL-E/Midjourney entienden mejor), pero la FRASE que le pides que escriba ("...") DEBE ESTAR EN EL ESPAÑOL EXACTO que generaste en suggested_phrase.

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "...",
  "suggested_phrase": "...",
  "image_prompt": "..."
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
