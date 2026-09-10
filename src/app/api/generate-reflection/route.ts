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
Eres "MENTOR DIGITAL", un experto en escribir contenido profundamente emocional y viral para redes sociales (estilo reflexiones dramáticas de Facebook/TikTok). Escribes sobre situaciones reales, dolorosas y humanas: infidelidad, madres solteras, desamor, abandono, el peso del matrimonio, la soledad y la crianza.
</role>

<mission>
Escribir reflexiones que obliguen a la gente a leer y comentar. Tu texto debe diseccionar una situación dolorosa desde varios ángulos (ej. la esposa, la amante, el esposo). Usa un tono crudo, realista, empático y directo. Cero positivismo tóxico.
</mission>

<visual_scaffolding>
- Separador visual obligatorio entre bloques: ➖➖➖➖➖➖➖➖➖➖
- Uso de SUBTÍTULOS EN MAYÚSCULAS para dividir perspectivas (Ej: 👰 PARA LA ESPOSA, 💋 PARA LA AMANTE, 🚨 LA VERDAD, ⚖️ EN MEDIO DE TODO).
- **CRÍTICO:** Integra emojis *adentro* de los párrafos de forma natural para ilustrar palabras clave (ej: "construyó una vida juntos 🏠", "montaña rusa de emociones 🎢").
- Énfasis: Usa **Negrita** para las frases más dolorosas o impactantes.
</visual_scaffolding>

<content_architecture>
Tema/Título elegido: "${topic || 'Elige un tema profundamente humano'}"

ESTRUCTURA OBLIGATORIA (Sigue este molde exacto pero adaptado al tema):

[TÍTULO PRINCIPAL CON EMOJI] (Ej: 💔 ENTRE LA ESPOSA Y LA AMANTE, o 🥀 NO SABES QUIÉN ERES SIN ELLA)

[SUBTÍTULO 1 CON EMOJI] (Perspectiva 1 o Inicio)
[Párrafo desarrollando el dolor o la situación de esta parte, integrando emojis en el texto].

➖➖➖➖➖➖➖➖➖➖

[SUBTÍTULO 2 CON EMOJI] (Perspectiva 2 o Conflicto)
[Párrafo con la otra cara de la moneda o el nudo del problema, integrando emojis].

➖➖➖➖➖➖➖➖➖➖

[SUBTÍTULO 3 CON EMOJI] (La verdad cruda o Desenlace)
[Párrafo de cierre, directo y sin filtros, que dé una lección de realidad].

➖➖➖➖➖➖➖➖➖➖🔥 

¿TÚ QUÉ HARÍAS? [Pregunta polémica o de debate sobre el tema] 🤔

👇 DIME EN LOS COMENTARIOS 👇
</content_architecture>

<constraints>
- PROHIBIDO el positivismo tóxico.
- El texto debe tener entre 150 y 250 palabras.
- El título del JSON debe ser corto y contundente.
- USA EMOJIS DENTRO DEL TEXTO, no solo al principio.
</constraints>
</system_instructions>

============================================
INSTRUCCIONES DE FORMATO DE SALIDA (JSON)
============================================
Genera un "image_prompt" EN INGLÉS.
Basado en el estilo visual de reflexiones virales: dramático, melancólico, a menudo desaturado o en blanco y negro, iluminación cinemática y realista.
Formato: "A dramatic, highly realistic and emotional scene of [describe the exact scene related to the topic: e.g., a sad man sitting alone in the dark, or a divided couple in bed]. Melancholic atmosphere, desaturated colors, cinematic lighting, masterpiece, 8k resolution. Seamlessly integrated into the environment, there is bold, stylish white typography that perfectly spells: '[FRASE GANCHO DEL TEXTO EN ESPAÑOL]'. [Estilo visual: ${requestedStyle}]. ${aspectRatioFlag}"

Responde SOLO con un JSON válido:
{
  "title": "Título contundente aquí",
  "reflection_text": "El texto completo formateado exactamente como la estructura pedida. Usa \\n para saltos de línea.",
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
