import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea } = body;

    if (action === "ideas") {
      const prompt = `Actúa como un experto creador de contenido viral especializado en "listicles" (listas numeradas) para redes sociales.
El usuario quiere crear un video de lista (listicle) para el nicho: "${niche}" con un tono "${tone}".
Genera 3 ideas de títulos (hooks) ultra-virales. Los títulos deben empezar con un número (ej. "7 Formas de...", "10 Hábitos que...").
Aplica estrategias psicológicas: usa variaciones como "Los Mejores", "Errores", "Razones", "Señales", o "Cosas que no sabías".

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "ideas": [
    {
      "title": "TÍTULO GANCHERO",
      "description": "Breve descripción del valor y por qué se hará viral"
    }
  ]
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      const cleanJson = response.replace(/^[\s\S]*?```json\n?|```\s*$/g, '').trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    if (action === "list") {
      const prompt = `Eres un experto creador de contenido viral especializado en "listicles" para videos verticales (TikTok/Reels) y también en prompts de IA para imágenes.
Crea el contenido exacto para un video "Infographic Listicle" estático basado en este título: "${selectedIdea.title}".

REGLAS ESTRICTAS DE VIRALIDAD:
1. Genera entre 7 y 12 puntos (ideal para que la gente tarde en leerlo y el video haga loop).
2. Los primeros 3 items deben ser extremadamente fuertes y de alto valor.
3. El último item debe ser el más polémico, memorable o sorprendente (para generar comentarios).
4. El Título del item (label) debe tener de 3 a 6 palabras máximo.
5. La descripción práctica (text) debe ser concreta y aportar valor tangible (máximo 15 palabras).
6. Para cada item, genera un "image_prompt" en INGLÉS para crear una imagen estilo infografía viral en Midjourney/DALL-E. El prompt debe describir un visual impactante, oscuro, moderno, con texto overlay. Máximo 30 palabras.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, y nada más:
{
  "title": "${selectedIdea.title}",
  "category": "Una o dos palabras en MAYÚSCULAS (ej. PSICOLOGÍA, FINANZAS, HACKS)",
  "subhook": "Frase de curiosidad pequeña (ej. 'Lee el último dos veces' o 'El #7 te salvará')",
  "items": [
    {
      "num": "01",
      "emoji": "💡",
      "label": "Título Corto (3-6 palabras)",
      "text": "Beneficio concreto o explicación (máx 15 palabras).",
      "image_prompt": "viral infographic dark background, bold white text overlay, [visual concept], TikTok style, neon accents, 9:16 vertical"
    }
  ],
  "cta": "Call to action específico (comenta/comparte/guarda)",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "music": "Sugerencia del tipo de música trending (ej. 'Upbeat motivacional', 'Phonk lofi')"
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      const cleanJson = response.replace(/^[\s\S]*?```json\n?|```\s*$/g, '').trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error generating infographic:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
