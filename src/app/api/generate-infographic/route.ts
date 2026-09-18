import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea } = body;

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
        "1. Genera entre 7 y 12 puntos.",
        "2. Los primeros 3 items deben ser los mas fuertes y de mayor valor.",
        "3. El ultimo item debe ser el mas polemico o sorprendente.",
        "4. El campo label debe tener de 3 a 6 palabras maximo.",
        "5. El campo text debe ser maximo 15 palabras, concreto y practico.",
        "6. Genera un UNICO image_prompt en ENGLISH para Ideogram/DALL-E. El diseno debe ser un poster infografico vertical (9:16). INVENTA un estilo visual increible y unico que encaje perfecto con el tema (decide colores, iluminacion, estetica). Este prompt DEBE INCLUIR explicitamente el texto de la lista. Formato: 'A highly aesthetic vertical infographic poster about [TEMA], [ESTILO VISUAL, COLORES, VIBRA], containing the exact typography: [TITULO]. 1. [item1] 2. [item2]...'. Maximo 100 palabras.",
        "",
        "Responde SOLO con JSON valido, sin texto adicional, con esta estructura:",
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequenya",
          image_prompt: "A highly aesthetic vertical infographic poster about finance, sleek dark mode style with glowing cyan and purple neon accents, bold modern typography, containing the exact typography: 'TITLE. 1. First point. 2. Second point...'",
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
