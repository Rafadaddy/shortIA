import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea, visualStyle, format, itemCount } = body;

    if (action === "ideas") {
      const prompt = [
        'Eres un experto creador de contenido viral estilo "Listicles" (Listas de datos, psicologia, finanzas, etc.).',
        `Genera 4 ideas virales para la tematica: "${niche}".`,
        `Tono: "${tone}".`,
        "Responde SOLO con JSON valido:",
        '{ "ideas": [ { "title": "7 Formas de...", "description": "Enfoque del video" } ] }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    if (action === "list") {
      const title = selectedIdea?.title ?? "Lista viral";
      const prompt = [
        'Eres un estratega de contenido viral para TikTok y Reels. Tu especialidad son las listas infograficas de alta retencion.',
        `Crea el contenido completo para un video/carrusel basado en este titulo: "${title}".`,
        "",
        "REGLAS:",
        `1. Genera exactamente ${itemCount || 10} puntos muy bien estructurados.`,
        "2. Los primeros 2 items deben ser los mas fuertes y de mayor valor.",
        "3. El ultimo item debe ser el mas polemico o sorprendente.",
        "4. El campo label debe tener de 3 a 6 palabras maximo.",
        "5. El campo text debe ser maximo 15 palabras, concreto y practico.",
        `6. Genera un image_prompt para la PORTADA en ENGLISH para Ideogram/DALL-E. Formato: ${format || 'Vertical (9:16)'}. Estilo: "${visualStyle || 'Ultra minimalista y tipografico'}". INCLUYE EL TITULO PRINCIPAL. NO decoraciones.`,
        `7. Para CADA PUNTO de la lista, genera su propio 'image_prompt' INDIVIDUAL en ENGLISH. Formato: ${format || 'Vertical (9:16)'}. Estilo: "${visualStyle || 'Ultra minimalista'}". Este prompt debe incluir el texto exacto del punto (Label + Text). Formato para cada punto: 'An ultra-minimalist ${format || 'Vertical'} infographic poster about [TEMA], [ESTILO]. Purely typographical layout, NO decorations, clean solid background, massive bold readable text containing exactly: [NUM]. [LABEL]. [TEXT]'.`,
        "",
        "Responde SOLO con JSON valido, sin texto adicional, con esta estructura:",
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequenya",
          image_prompt: "A highly aesthetic vertical infographic poster about finance, sleek dark mode style. Massive bold typography dominating the layout, containing exactly this text: 'TITLE'",
          items: [{
            num: "01",
            emoji: "emoji",
            label: "Titulo corto 3-6 palabras",
            text: "Descripcion practica max 15 palabras.",
            image_prompt: "An ultra-minimalist vertical infographic poster about finance, sleek dark mode style. Massive bold typography dominating the layout, containing exactly: '1. Title. Description...'"
          }],
          cta: "Call to action especifico",
          hashtags: ["#Tag1", "#Tag2", "#Tag3"],
          music: "Tipo de musica sugerida"
        }, null, 2)
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating infographic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
