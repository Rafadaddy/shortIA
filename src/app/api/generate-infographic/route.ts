import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea, visualStyle } = body;

    if (action === "ideas") {
      const prompt = [
        "Actua como un experto creador de contenido viral especializado en listas numeradas para redes sociales.",
        `El usuario quiere crear un video de lista para el nicho: "${niche}" con un tono "${tone}".`,
        'Genera 3 ideas de titulos (hooks) ultra-virales. Los titulos deben empezar con un numero (ej. "7 Formas de...", "10 Habitos que...").',
        'Aplica estrategias psicologicas: usa variaciones como "Los Mejores", "Errores", "Razones", "Senales", o "Cosas que no sabias".',
        "",
        "Responde UNICAMENTE con un JSON valido con esta estructura exacta:",
        '{ "ideas": [ { "title": "TITULO GANCHERO", "description": "Breve descripcion del valor y por que se hara viral" } ] }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    if (action === "list") {
      const title = selectedIdea?.title ?? "Lista viral";
      const prompt = [
        'Eres un experto creador de contenido viral para TikTok/Reels especializado en listas numeradas.',
        `Crea el contenido completo para un video "Infographic Listicle" basado en este titulo: "${title}".`,
        "",
        "REGLAS:",
        "1. Genera exactamente entre 4 y 6 puntos máximo para no saturar la imagen.",
        "2. Los primeros 2 items deben ser los mas fuertes y de mayor valor.",
        "3. El ultimo item debe ser el mas polemico o sorprendente.",
        "4. El campo label debe tener de 3 a 5 palabras maximo.",
        "5. El campo text debe ser maximo 15 palabras, concreto y practico.",
        `6. Genera un UNICO image_prompt en ENGLISH para Ideogram/DALL-E. El diseno debe ser un poster infografico vertical (9:16). El usuario ha solicitado este estilo visual: "${visualStyle || 'Que la IA decida'}". Adapta los colores, iluminacion y estetica a esta peticion. PIDE QUE LA TIPOGRAFIA SEA GIGANTE, GRUESA Y EL FOCO PRINCIPAL (Massive, bold, highly readable typography as the main focus). Para no saturar el diseño, INCLUYE SOLO el TITULO y los LABELS de los puntos (OMITE el campo 'text' en el prompt de la imagen). Formato: 'A highly aesthetic vertical infographic poster about [TEMA], [ESTILO SOLICITADO]. Massive bold typography dominating the image, containing exactly this text: [TITULO]. 1. [label1] 2. [label2]...'. Maximo 100 palabras.`,
        "",
        "Responde SOLO con JSON valido, sin texto adicional, con esta estructura:",
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequenya",
          image_prompt: "A highly aesthetic vertical infographic poster about finance, sleek dark mode style. Massive bold typography dominating the layout, containing exactly this text: 'TITLE. 1. First label. 2. Second label...'",
          items: [{
            num: "01",
            emoji: "emoji",
            label: "Titulo corto 3-6 palabras",
            text: "Descripcion practica max 15 palabras."
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
