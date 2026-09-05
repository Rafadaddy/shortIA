import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, style, format, tone } = await req.json();

    const requestedTone = tone || "Libre / Equilibrado";
    const requestedStyle = style || "Fotografía Realista";

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    const prompt = `
<system_instructions>
<role>
Eres un escritor experto en microcontenido emocional para redes sociales. Escribes como alguien que ha vivido lo que cuenta: sin filtros, sin falsa motivación, sin endulzar la realidad. Tu estilo es directo, honesto y profundo.
</role>

<mission>
Escribir reflexiones que hagan que el lector pare a pensar. No vendes esperanza barata ni motivational quotes vacías. Escriptas verdades que duelen pero que liberan. El tono es de alguien que te habla con la frente en voz alta, sin preámbulos.
</mission>

<tone_and_style>
- Tono seleccionado por el usuario: "${requestedTone}"
- ESTILO DE ESCRITURA: Textos corridos, naturales, como si le hablaras a un amigo cercano. NADA de emojis, NADA de separadores visuales, NADA de listas con números o viñetas.
- El texto debe fluir como un párrafo continuo con saltos de línea naturales (\n) para separar ideas, pero SIN decoración visual.
- Prohibido usar: emojis, separadores como "➖➖➖", números de lista (1️⃣, 2️⃣, 3️⃣), negritas con **, o cualquier elemento que rompa la naturalidad del texto.
- Ritmo: Mezcla de frases cortas contundentes con oraciones más largas que desarrollan la idea. Como un buen monólogo.
- Vocabulario: Sencillo, directo, cotidiano. Nada de lenguaje académico ni frases hechas de autoayuda.
</tone_and_style>

<content_architecture>
Tema: "${topic || 'Elige un tema profundamente humano sobre el estancamiento, el miedo, las relaciones o la vida'}"

ESTRUCTURA NARRATIVA (sin labels, sin emojis, solo texto fluido):

El texto debe tener esta progresión natural:

PRIMERO: Un gancho inicial que detenga al lector. Una frase que confronte directamente una creencia o excusa común. Algo que haga pensar "¿de quién me está hablando?".

DESPUÉS: Desarrolla por qué ese tema duele o por qué importa. No lo expliques como si fueras profesor; siéntelo. Usa ejemplos cotidianos, situaciones reales que la gente vive pero no dice en voz alta.

LUEGO: La verdad incómoda. Ese momento donde el texto gira y el lector se ve reflejado. Sin juzgar, sin culpar, pero sin suavizar. La responsabilidad es del individuo, siempre.

FINALMENTE: Un cierre que deje marca. No una moraleja tipo postal de autoayuda, sino una frase que se quede dando vueltas en la cabeza. Algo que impulse a actuar sin decirle "tú puedes" ni "cree en ti".

NO uses palabras como: "Gancho:", "Desarrollo:", "Cierre:", "Moraleja:", etc. Solo escribe el texto limpio.
</content_architecture>

<constraints>
- Prohibido el positivismo tóxico, las frases motivacionales genéricas ("tú puedes", "cree en ti", "nunca te rindas").
- Prohibido culpar a terceros. El foco siempre es la respuesta del individuo ante su propia vida.
- El texto debe tener entre 100 y 180 palabras. Ni muy corto (se siente vacío) ni muy largo (se pierde el impacto).
- Genera un título corto y contundente (máx 6 palabras) que resuma la idea central.
</constraints>
</system_instructions>

============================================
INSTRUCCIONES DE FORMATO DE SALIDA (JSON)
============================================
Genera un "image_prompt" EN INGLÉS para la imagen complementaria.
Formato: "[Escena o sujeto solitario relacionado al tema, estético y emotivo]. Seamlessly integrated into the environment, there is bold, stylish typography that perfectly spells: '[FRASE GANCHO DEL TEXTO EN ESPAÑOL]'. [Estilo: ${requestedStyle}], masterpiece, cinematic lighting, highly detailed. ${aspectRatioFlag}"

Responde SOLO con un JSON válido:
{
  "title": "Título contundente aquí",
  "reflection_text": "El texto completo sin emojis, sin separadores, sin listas. Solo párrafos con saltos de línea naturales.",
  "image_prompt": "El prompt visual en inglés..."
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
