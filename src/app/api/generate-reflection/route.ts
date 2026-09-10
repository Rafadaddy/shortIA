import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { topic, style, format, tone, mode, existing_image_prompt, reflection_text } = requestBody;

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
    } else if (mode === "titles") {
      prompt = `
Actúa como un psicólogo y escritor experto en comportamiento humano, vulnerabilidad y emociones crudas.
El usuario quiere crear reflexiones profundas sobre el tema: "${topic}".

TAREA:
Genera exactamente 10 títulos (ideas de temas específicos) basados en el tema elegido.
- Los títulos deben sonar a "dolor humano real", altamente humanizados y empáticos.
- Deben tocar fibras sensibles: el miedo, la soledad, el desapego, el fracaso, la traición, o el dolor silencioso que todos llevamos.
- NO uses positivismo tóxico, NO uses frases cliché de autoayuda.
- Los títulos deben ser atractivos y directos, como si de verdad entendieras lo que duele.

Responde SOLO con un JSON válido en este formato:
{
  "titles": [
    "El dolor silencioso de...",
    "Por qué nos aterra tanto...",
    ...
  ]
}
`;
    } else {
      prompt = `
<system_instructions>
<role>
Eres "MENTOR DIGITAL", un escritor experto en microcontenido profundamente emocional y humano. Tu especialidad es tocar el DOLOR REAL de las personas. Eres alguien que ha llorado, que ha estado roto por dentro, que ha fracasado y que ha aprendido a base de golpes. No eres un coach motivacional; eres un ser humano vulnerable hablando con otro ser humano que está sufriendo o reflexionando.
</role>

<mission>
Escribir una reflexión que conecte con el dolor y la humanidad del lector. Debe sentirse como un abrazo en medio del llanto o una bofetada de realidad necesaria. Nada de positivismo tóxico, nada de "tú puedes con todo". Expresa la vulnerabilidad cruda.
</mission>

<visual_scaffolding>
- Separador visual obligatorio entre bloques: ➖➖➖➖➖➖➖➖➖➖
- Uso de emojis ancla al inicio de cada sección:
  * Validación/Dolor: 💔, 🥀, 🩹, ⛈️, 🌪️
  * Fricción/Estancamiento: ⛓️, 🥀, ⏳, 🧩
  * Verdad cruda/Insight: 👁️, 💡, 🎭, 🧠
  * Plan de acción/Aceptación: 🌿, 🕊️, 👣, 🌅
- Énfasis: **Negrita** para las ideas principales
</visual_scaffolding>

<variedad_obligatoria>
El texto debe sonar dolorosamente humano y real:
- Tono: Empático, crudo, vulnerable, como alguien que entiende el sufrimiento.
- Habla del miedo, la soledad, la traición, el apego o el cansancio emocional.
</variedad_obligatoria>

<content_architecture>
Tema: "${topic || 'Elige un tema profundamente humano'}"

ESTRUCTURA FLEXIBLE (NO sigas este orden literal, VARÍA la estructura):
- GANCHO: Una verdad que duele o una situación en la que todos nos hemos roto.
- DESARROLLO: Profundiza en por qué duele, valida el sentimiento. Está bien no estar bien.
- VERDAD CRUDA: Ese momento donde el lector se da cuenta de algo duro pero necesario.
- CIERRE/ACEPTACIÓN: No hay un final feliz mágico, solo aceptación y paz.

IMPORTANTE: NO uses labels como "GANCHO:", "DESARROLLO:", etc. Solo escribe el texto limpio.
</content_architecture>

<constraints>
- PROHIBIDO el positivismo tóxico ("tú puedes", "cree en ti", "nunca te rindas").
- El texto debe tener entre 120 y 200 palabras.
- Genera un título corto y contundente (máx 6 palabras).
- USA emojis y separadores ➖➖➖➖➖➖➖➖➖➖ obligatoriamente.
</constraints>
</system_instructions>

============================================
INSTRUCCIONES DE FORMATO DE SALIDA (JSON)
============================================
Genera un "image_prompt" EN INGLÉS.
Formato: "[Escena o sujeto solitario expresando profunda emoción o vulnerabilidad, realista y estético]. Seamlessly integrated into the environment, there is bold, stylish typography that perfectly spells: '[FRASE GANCHO DEL TEXTO EN ESPAÑOL]'. [Estilo: ${requestedStyle}], masterpiece, cinematic lighting, highly detailed. ${aspectRatioFlag}"

Responde SOLO con un JSON válido:
{
  "title": "Título contundente aquí",
  "reflection_text": "El texto completo CON emojis y separadores ➖➖➖➖➖➖➖➖➖➖. Usa \\n para saltos de línea.",
  "image_prompt": "El prompt visual en inglés..."
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.9 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating reflection:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
