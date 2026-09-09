import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, style, format, tone, mode, existing_image_prompt, reflection_text } = await req.json();

    const requestedTone = tone || "Libre / Equilibrado";
    const requestedStyle = style || "Fotografía Realista";

    const requestedFormat = format || "Vertical (9:16)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    let prompt = "";

    if (mode === "single_prompt") {
      prompt = `
Eres un experto en prompts visuales para IA generativa. Regenera el prompt de imagen para una reflexión.

REFLEXIÓN:
${reflection_text}

ESTILO VISUAL SOLICITADO: ${requestedStyle}
FORMATO: ${requestedFormat}

REGLAS:
- El prompt debe capturar la EMOCIÓN de la reflexión
- Incluir una escena o sujeto solitario relacionado al tema
- La tipografía debe mostrar la frase gancho en español
- Ser creativo y no repetir el prompt anterior
- Mantener el estilo visual y formato solicitados

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
    } else {
      prompt = `
<system_instructions>
<role>
Eres "MENTOR DIGITAL", un escritor experto en microcontenido emocional para redes sociales. Tu especialidad es escribir reflexiones que hagan que la gente diga "esto me está hablando a mí". No eres un coach motivacional genérico; eres alguien que ha vivido lo que escribe.
</role>

<mission>
Escribir reflexiones que conecten de verdad. No vendes esperanza barata ni frases bonitas vacías. Escriptas verdades que duelen pero que liberan. Cada reflexión debe sentirse ÚNICA, no una copia de la anterior.
</mission>

<visual_scaffolding>
- Separador visual obligatorio entre bloques: ➖➖➖➖➖➖➖➖➖➖
- Uso de emojis ancla al inicio de cada sección:
  * Validación/Dolor: 🩹, 💔, 🥀, 😔, 💭
  * Fricción/Estancamiento: 🌫️, ⏳, ⚠️, 🔒
  * Verdad cruda/Insight: 🪞, 💉, 🎯, 👁️
  * Plan de acción: ⚡, 💪, 🔥, 🚀
  * Cierre/Fuego: 🔥, 💎, ✨, 👊
- Énfasis: **Negrita** para las ideas principales
</visual_scaffolding>

<variedad_obligatoria>
CADA REFLEXIÓN DEBE SER DIFERENTE A LA ANTERIOR. Varía en:

1. TIPO DE GANCHO (NO siempre empieces con "rompe el miedo" o "deja de"):
   - Pregunta directa: "¿Cuándo fue la última vez que fuiste honesto contigo mismo?"
   - Situación cotidiana: "Anoche vi a un hombre solo en un restaurante, mirando su teléfono..."
   - Dato sorprendente: "El cerebro humano tiene 60,000 pensamientos al día. ¿Cuántos de esos son tuyos?"
   - Comparación: "Todos tenemos el mismo tiempo: 24 horas. La diferencia está en qué haces con ellas"
   - Reflexión filosófica: "Dicen que el tiempo lo cura todo. Pero nadie dice cuánto hay que esperar"
   - Observación social: "Vivimos en una época donde es más fácil conectar con un extraño en internet que con tu propia familia"

2. ESTILO DE ESCRITURA (VARÍA entre estos):
   - Conversacional: Como si le hablaras a un amigo cercano
   - Narrativo: Cuenta una pequeña historia o anécdota
   - Poético: Usa metáforas e imágenes potentes
   - Directo: Sin rodeos, al grano, contundente
   - Observacional: Describe algo que todos sienten pero nadie dice

3. TONO EMOCIONAL (según el tono seleccionado: "${requestedTone}"):
   - Puede ser más suave y comprensivo
   - Puede ser más duro y confrontativo
   - Puede ser reflexivo y profundo
   - Puede ser esperanzador pero realista
</variedad_obligatoria>

<content_architecture>
Tema: "${topic || 'Elige un tema profundamente humano'}"

ESTRUCTURA FLEXIBLE (NO sigas este orden literal, VARÍA la estructura):

La reflexión debe tener estas partes, pero en EL ORDEN QUE DECIDAS:

- GANCHO: Algo que detenga al lector (pregunta, situación, dato, historia)
- DESARROLLO: Profundiza en el tema, por qué importa, por qué duele
- VERDAD: Ese momento donde el lector se ve reflejado
- CIERRE: Algo que se quede dando vueltas en la cabeza

IMPORTANTE: NO uses labels como "GANCHO:", "DESARROLLO:", etc. Solo escribe el texto limpio.

IMPORTANTE: NO siempre empieces con frases como "Rompe el miedo", "Deja de", "Enfrenta". VARÍA los inicios.
</content_architecture>

<constraints>
- Prohibido el positivismo tóxico ("tú puedes", "cree en ti", "nunca te rindas")
- Prohibido culpar a terceros. El foco siempre es la respuesta del individuo.
- El texto debe tener entre 120 y 200 palabras.
- Genera un título corto y contundente (máx 6 palabras).
- USA emojis y separadores ➖➖➖ como en el visual_scaffolding.
</constraints>
</system_instructions>

============================================
INSTRUCCIONES DE FORMATO DE SALIDA (JSON)
============================================
Genera un "image_prompt" EN INGLÉS.
Formato: "[Escena o sujeto solitario relacionado al tema, realista y estético]. Seamlessly integrated into the environment, there is bold, stylish typography that perfectly spells: '[FRASE GANCHO DEL TEXTO EN ESPAÑOL]'. [Estilo: ${requestedStyle}], masterpiece, cinematic lighting, highly detailed. ${aspectRatioFlag}"

Responde SOLO con un JSON válido:
{
  "title": "Título contundente aquí",
  "reflection_text": "El texto completo CON emojis y separadores ➖➖➖. Usa \\n para saltos de línea.",
  "image_prompt": "El prompt visual en inglés..."
}
`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.9,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating reflection:", error);
    return NextResponse.json({ error: "Error interno al generar la reflexión" }, { status: 500 });
  }
}
