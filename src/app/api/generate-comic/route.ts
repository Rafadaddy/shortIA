import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, idea, panels, style, characterDesc } = await req.json();

    const panelCount = panels || 4;
    const requestedStyle = style || "Estilo Cómic / Manga";
    
    // We force square images for carousels as it's standard, or portrait
    const aspectRatioFlag = "--ar 1:1";

    let styleInstruction = "";
    if (requestedStyle.includes("Webtoon")) {
      styleInstruction = "A modern webtoon digital comic style, clean lines, vibrant colors.";
    } else if (requestedStyle.includes("Stickman")) {
      styleInstruction = "A minimalist stickman line-art drawing style on a clean off-white background. Simple, cute, and highly expressive stick figures. NO speech bubbles. The text MUST be floating cleanly at the top or in the empty space, written in a neat handwriting font.";
    } else if (requestedStyle.includes("Anime")) {
      styleInstruction = "A high-quality Japanese anime/manga aesthetic, detailed shading, expressive characters.";
    } else if (requestedStyle.includes("Dibujo Tierno")) {
      styleInstruction = "A cozy, cute, aesthetic hand-drawn illustration style. Pastel colors, very soft and emotive.";
    } else if (requestedStyle.includes("3D")) {
      styleInstruction = "A 3D Pixar/Disney style animation render, highly detailed, expressive features, cinematic lighting.";
    } else if (requestedStyle.includes("Animación 2D")) {
      styleInstruction = "A classic 2D animated cartoon style. Flat colors, expressive and dynamic character designs, traditional western animation aesthetics.";
    } else if (requestedStyle.includes("Lápiz")) {
      styleInstruction = "A traditional pencil sketch drawing style. Highly detailed graphite shading, monochromatic, visible pencil strokes on textured paper, professional sketchbook aesthetic.";
    } else if (requestedStyle.includes("Noir")) {
      styleInstruction = "A dark noir comic style, black and white, heavy inking, dramatic shadows, Frank Miller style.";
    } else {
      styleInstruction = `A high quality visual artwork in the style of ${requestedStyle}.`;
    }

    const charInstruction = characterDesc 
      ? `CRÍTICO PARA CONSISTENCIA DE PERSONAJE: El personaje principal es: "${characterDesc}". DEBES incluir esta descripción visual EXACTA en cada uno de los "image_prompt" para garantizar que la IA lo dibuje idéntico en todas las viñetas.` 
      : "";

    const prompt = `
Eres un escritor y dibujante de historietas virales para redes sociales (carruseles de Instagram / TikTok).
Tu tarea es crear una historia corta y atractiva dividida en ${panelCount} viñetas (imágenes separadas).

Temática: "${niche}"
${idea ? `Idea del usuario: "${idea}"` : `Genera una historia al azar súper original basada en este nicho.`}
Estilo Visual Solicitado: "${requestedStyle}"

${charInstruction}

Para cada viñeta debes proporcionar:
1. "panel_number": El número de viñeta (1 al ${panelCount}).
2. "dialogue": El diálogo o narración EXACTO que irá escrito dentro de la imagen. DEBE ESTAR ESTRICTAMENTE EN ESPAÑOL. Debe ser CORTO (máximo 15 palabras) para que quepa bien en un globo de texto o cartel en la imagen.
3. "image_prompt": EL PROMPT EN INGLÉS PARA GENERAR LA IMAGEN DE ESTA VIÑETA EN DALL-E 3.
ESTRUCTURA ESTRICTA DEL PROMPT:
"${styleInstruction} [Describe la acción y los personajes detalladamente]. Integrated into the artwork, there is a clear speech bubble or caption box containing bold typography that reads exactly: '[DIALOGUE EN ESPAÑOL]'. Masterpiece, highly detailed. ${aspectRatioFlag}"

IMPORTANTE: El prompt DEBE estar en inglés, pero la FRASE que le pides que escriba ("...") DEBE ESTAR EN EL ESPAÑOL EXACTO que generaste en "dialogue".

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "Un título atractivo para la historieta",
  "panels": [
    {
      "panel_number": 1,
      "dialogue": "...",
      "image_prompt": "..."
    }
  ],
  "caption": "Un pie de foto para redes sociales (20-40 palabras) invitando a comentar, con emojis 🔥.",
  "music_recommendation": "Describe qué tipo de música exacta deben ponerle al video/carrusel (ej. Beat de phonk oscuro, piano triste y lento, etc.)"
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
    console.error("Error generating comic:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
