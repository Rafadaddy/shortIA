import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea } = body;

    if (action === "ideas") {
      const prompt = `Actúa como un experto en viralidad de TikTok y Reels (especialista en Infographic Listicles estáticos).
El usuario quiere crear un video de lista (listicle) para el nicho: "${niche}" con un tono "${tone}".
Genera 3 ideas de títulos (hooks) ultra-virales. Los títulos deben empezar con un número (ej. "7 Formas de...", "10 Hábitos que...").

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "ideas": [
    {
      "title": "TÍTULO GANCHERO",
      "description": "Breve descripción de qué tratará la lista y por qué se hará viral"
    }
  ]
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    if (action === "list") {
      const prompt = `Actúa como un experto en retención de TikTok y psicología humana.
Crea el contenido exacto para un video "Infographic Listicle" estático basado en este título: "${selectedIdea.title}".
Reglas estrictas basadas en la retención algorítmica:
1. Genera exactamente entre 7 y 10 puntos (ideal para que la gente tarde entre 15 y 20 segundos en leerlo y el video haga loop).
2. Cada punto debe ser corto, impactante y directo al grano.
3. El punto #7 (o el penúltimo) debe ser el más polémico, profundo o reflexivo (esto incita a los comentarios).
4. El "subhook" debe generar curiosidad (ej. "Lee el #7 dos veces", "Guarda esto para cuando te sientas perdido").
5. El CTA final debe fomentar guardar o compartir el video.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "title": "${selectedIdea.title}",
  "category": "Una o dos palabras en MAYÚSCULAS (ej. PSICOLOGÍA, FINANZAS, HACKS)",
  "subhook": "Frase de curiosidad pequeña",
  "items": [
    {
      "num": "01",
      "emoji": "🧠",
      "label": "Concepto Corto",
      "text": "Explicación de 5 a 9 palabras máximo."
    }
  ],
  "cta": "Frase corta para que guarden el video"
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      return NextResponse.json(JSON.parse(response));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error generating infographic:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
