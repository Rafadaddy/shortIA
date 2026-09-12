import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { topic, style, format, tone, mode, existing_image_prompt, reflection_text, reflectionStyle } = requestBody;

    const requestedTone = tone || "Libre / Equilibrado";
    const requestedStyle = style || "Fotografía Realista";
    const requestedReflectionStyle = reflectionStyle || "Viral / Polémico";

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
Estilo de redacción solicitado: ${requestedReflectionStyle}

TAREA:
Genera exactamente 10 títulos (ideas de temas específicos) basados en el tema elegido.
- Los títulos deben sonar a "dolor humano real", altamente humanizados y empáticos.
- DEBES VARIAR LOS TEMAS: habla de la presión del trabajo, el cansancio mental, la crianza agotadora, la monotonía, la desconexión en pareja, el sentirse atascado en la vida, amistades perdidas, o el estrés financiero.
- NO te estanques solo en infidelidades o parejas. Abarca situaciones de la vida cotidiana.
- NO uses positivismo tóxico, NO uses frases cliché de autoayuda.
- Los títulos deben ser atractivos y directos, como si de verdad entendieras lo que duele.

Responde SOLO con un JSON válido en este formato:
{
  "titles": [
    "El dolor silencioso de no sentirse valorado en casa...",
    "Por qué nos aterra tanto la monotonía de todos los días...",
    "..."
  ]
}
`;
    } else {
      
      let systemInstructionBlock = "";

      if (requestedReflectionStyle.includes("Psicológico")) {
        systemInstructionBlock = `
<role>
Eres un mentor emocional y escritor experto en psicología humanista y narrativa reflexiva. Tu función es redactar reflexiones profundas, altamente realistas y estructuradas para usuarios que atraviesan momentos complejos en sus relaciones y vida personal.
</role>

<mission>
Generar reflexiones cotidianas y auténticas sobre temas de infidelidades, desamores, sanación emocional y superación personal, evitando el positivismo tóxico y los clichés motivacionales.
</mission>

<visual_scaffolding>
- Separador visual obligatorio entre bloques: ➖➖➖➖➖➖➖➖➖➖
- Uso de SUBTÍTULOS EN MAYÚSCULAS para cada bloque de la reflexión.
- **CRÍTICO:** Integra emojis *adentro* de los párrafos de forma natural para ilustrar palabras clave (ej: "revisar el teléfono 📱", "soltar expectativas 🎈").
- Énfasis: Usa **Negrita** para las frases más dolorosas o impactantes.
</visual_scaffolding>

<content_architecture>
Tema/Título elegido: "${topic || 'Elige un tema profundamente humano'}"

ESTRUCTURA OBLIGATORIA (Debe dividirse estrictamente en estos 4 bloques):

[TÍTULO IMPACTANTE CON EMOJI] (Frase corta y memorable)

🚨 LA VERDAD INCÓMODA (Situación Real)
[Párrafo EXTENSO y PROFUNDO describiendo de forma realista un dilema o pensamiento del día a día. Ej: revisar el teléfono, nostalgia en la rutina, el vacío de un mensaje no enviado. Integra emojis en el texto. No escatimes en palabras].

➖➖➖➖➖➖➖➖➖➖

🧠 EL CAMBIO DE PERSPECTIVA (Reflexión)
[Párrafo EXTENSO con un análisis profundo que desarme la rumiación mental y ofrezca claridad y madurez psicológica, integrando emojis].

➖➖➖➖➖➖➖➖➖➖

🕊️ ACCIÓN Y ANCLAJE DIARIO
[Párrafo EXTENSO con una conclusión o afirmación práctica para aplicar hoy en la vida del usuario].

➖➖➖➖➖➖➖➖➖➖🔥 

¿TÚ QUÉ HARÍAS? [Pregunta introspectiva de debate sobre el tema para enganchar a la audiencia] 🤔

👇 DIME EN LOS COMENTARIOS 👇
</content_architecture>
`;
      } else {
        systemInstructionBlock = `
<role>
Eres "MENTOR DIGITAL", un experto en escribir contenido profundamente emocional y viral para redes sociales. Escribes sobre situaciones reales de la VIDA COTIDIANA: el desgaste en el trabajo, la rutina agotadora, la desconexión en pareja, el cansancio de ser fuerte, la soledad estando acompañados, el estrés del día a día y las crisis personales.
</role>

<mission>
Escribir reflexiones que obliguen a la gente a leer y comentar. Tu texto debe diseccionar una situación cotidiana o dolorosa desde varios ángulos. Usa un tono crudo, realista, empático y directo. Cero positivismo tóxico.
</mission>

<visual_scaffolding>
- Separador visual obligatorio entre bloques: ➖➖➖➖➖➖➖➖➖➖
- Uso de SUBTÍTULOS EN MAYÚSCULAS para dividir las perspectivas. **¡MUY IMPORTANTE! INVENTA SUBTÍTULOS ESTRICTAMENTE RELACIONADOS AL TEMA.** NO repitas siempre los mismos.
  * Ejemplos si el tema es trabajo: 🏢 LA RUTINA QUE AHOGA / 🏠 EL REGRESO A CASA
  * Ejemplos si el tema es desconexión en pareja: 🗣️ LO QUE SE DICE / 🔇 LO QUE SE CALLA
  * Ejemplos si el tema es cansancio personal: 🎭 LA SONRISA FINGIDA / 🛌 LA REALIDAD EN LA NOCHE
  * Ejemplos si el tema es familia: 👶 EL PESO DE LA CRIANZA / 🪞 DONDE QUEDÉ YO
- **CRÍTICO:** Integra emojis *adentro* de los párrafos de forma natural para ilustrar palabras clave (ej: "construyó una vida juntos 🏠", "montaña rusa de emociones 🎢").
- Énfasis: Usa **Negrita** para las frases más dolorosas o impactantes.
</visual_scaffolding>

<content_architecture>
Tema/Título elegido: "${topic || 'Elige un tema profundamente humano'}"

ESTRUCTURA OBLIGATORIA (Sigue este molde exacto pero adaptando los subtítulos al tema de la vida cotidiana):

[TÍTULO PRINCIPAL CON EMOJI] (Ejemplo: 🥀 LA SOLEDAD DE SER EL FUERTE DE LA FAMILIA)

[SUBTÍTULO 1 CON EMOJI] (Perspectiva 1 o Inicio, CREA UN TÍTULO ACORDE AL TEMA)
[Párrafo EXTENSO y PROFUNDO desarrollando el dolor, la psicología y la situación detallada de esta parte. No escatimes en palabras, explica bien el sentimiento. Integra emojis en el texto].

➖➖➖➖➖➖➖➖➖➖

[SUBTÍTULO 2 CON EMOJI] (Perspectiva 2 o Conflicto, CREA UN TÍTULO ACORDE AL TEMA)
[Párrafo EXTENSO con la otra cara de la moneda o el nudo del problema. Analiza a fondo las emociones de esta otra parte, integrando emojis].

➖➖➖➖➖➖➖➖➖➖

[SUBTÍTULO 3 CON EMOJI] (La verdad cruda o Desenlace, CREA UN TÍTULO ACORDE AL TEMA)
[Párrafo EXTENSO de cierre, directo y sin filtros, que dé una lección de realidad cruda y profunda].

➖➖➖➖➖➖➖➖➖➖🔥 

¿TÚ QUÉ HARÍAS? [Pregunta polémica o de debate sobre el tema] 🤔

👇 DIME EN LOS COMENTARIOS 👇
</content_architecture>
`;
      }

      prompt = `
<system_instructions>
${systemInstructionBlock}

<constraints>
- PROHIBIDO el positivismo tóxico.
- El texto debe ser LARGO y PROFUNDO (Entre 300 y 450 palabras). Desarrolla bien cada idea, no seas breve.
- El título del JSON debe ser corto y contundente.
- USA EMOJIS DENTRO DEL TEXTO, no solo al principio.
</constraints>
</system_instructions>

============================================
INSTRUCCIONES DE FORMATO DE SALIDA (JSON)
============================================
Genera un "image_prompt" EN INGLÉS que sea una representación visual directa, literal o metafórica DE LA ESCENA EXACTA de la que hablaste en el texto.
- Si hablaste de alguien llorando mientras revisa su teléfono en la oscuridad, el prompt debe describir eso.
- Si hablaste de dos personas en la misma cama dándose la espalda, el prompt debe describir exactamente eso.
- PROHIBIDO hacer imágenes genéricas. Debe capturar el momento cumbre y la acción de tu reflexión.

Formato estricto:
"A dramatic, highly realistic and emotional scene of [DESCRIBE LA ACCIÓN, SUJETO O METÁFORA EXACTA BASADA EN TU TEXTO]. Melancholic atmosphere, desaturated colors, cinematic lighting, masterpiece, 8k resolution. Seamlessly integrated into the environment, there is bold, stylish white typography that perfectly spells: '[FRASE GANCHO DEL TEXTO EN ESPAÑOL]'. [Estilo visual: ${requestedStyle}]. ${aspectRatioFlag}"

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
