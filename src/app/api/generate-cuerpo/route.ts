import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();
    const { mode, topic, idea, sceneCount = 5 } = requestBody;

    let prompt = "";

    const randomAngles = [
      "Línea de tiempo cronológica (Qué pasa a los 10 min, al día 1, al mes...)",
      "Viaje microscópico inmersivo (Perspectiva en primera persona desde adentro de una célula o vaso sanguíneo)",
      "Efecto dominó (Cómo un pequeño hábito desencadena una reacción en cadena masiva en varios órganos)",
      "Top curiosidades asombrosas y perturbadoras que casi nadie sabe",
      "Mito vs Realidad Clínica (Destruyendo creencias populares con brutal ciencia visual)",
      "El ángulo del 'Superpoder Oculto' (Explicar cómo el cuerpo hace algo extremo que parece magia o ciencia ficción)",
      "Perspectiva de supervivencia (Qué hace tu cuerpo en modo pánico/defensa extrema)"
    ];
    const randomAngle = randomAngles[Math.floor(Math.random() * randomAngles.length)];

    if (mode === "ideas") {
      prompt = `
Eres un productor viral de YouTube Shorts y TikTok experto en el nicho "Cuerpo Humano y Ciencia Visual".
Genera 8 ideas de videos altamente atractivos basados en el tema.

Tema: "${topic || 'El cuerpo humano, biología, nutrición o cerebro'}"

REGLA DE ORO PARA LA VARIEDAD:
CADA idea debe sentirse única y diferente. No repitas la misma estructura de título.

Responde SOLO con un JSON válido usando este formato:
{
  "ideas": [
    {
      "title": "TÍTULO CORTO Y EN MAYÚSCULAS",
      "hook": "La frase inicial de los primeros 3 segundos (Debe ser perturbadora, curiosa o romper un mito)",
      "focus": "Breve explicación de la animación 3D o enfoque científico que se usará (Ej: 'Viaje 3D por las neuronas cuando consumes azúcar')"
    }
  ]
}
`;
    } else if (mode === "script_only") {
      prompt = `
Eres un guionista experto en retención para YouTube Shorts/TikTok, especializado en "Cuerpo Humano y Ciencia Visual".
Tu objetivo es educar a través del ASOMBRO absoluto, usando lenguaje visual para que luego se anime en 3D.

TEMA / IDEA A DESARROLLAR: "${idea}"

¡¡¡INSTRUCCIÓN CRÍTICA PARA EVITAR LA REPETICIÓN!!!
Para que este video sea ÚNICO y no suene como el anterior, OBLIGATORIAMENTE debes usar este enfoque narrativo:
>> ENFOQUE NARRATIVO ASIGNADO: "${randomAngle}" <<
Aplica este enfoque en la estructura del guion.

REGLAS DE ORO:
1. Ganchos Hipnóticos: Los primeros 3 segundos deben ser brutales. Nada de saludos. Ve directo al dolor, a la pregunta morbosa o al dato asombroso.
2. Lenguaje Visual Extremo: Usa palabras que evoquen imágenes médicas 3D ("glóbulos rojos a toda velocidad", "ácido hirviendo", "conexiones neuronales brillando como relámpagos").
3. Cierre Cíclico o Sorprendente: Termina con un dato extra alucinante y un CTA sutil.

La duración es para un Short de ~60 segundos. OBLIGATORIO dividir el guion en EXACTAMENTE ${sceneCount} escenas.

Responde SOLO con un JSON válido usando este formato:
{
  "title": "Título brutal del video",
  "script": [
    {
      "scene_number": 1,
      "narration": "Voz en off impactante y con ritmo acelerado..."
    }
  ]
}
`;
    } else if (mode === "full_from_script") {
      const { current_script } = requestBody;
      
      prompt = `
Eres un director de arte y animador 3D científico médico.
Tu tarea es tomar este guion validado sobre el cuerpo humano y generar los prompts de imágenes y animaciones para cada escena.

GUION ACOTADO A ${sceneCount} ESCENAS:
${current_script}

REGLAS PARA LOS PROMPTS VISUALES:
1. El estilo visual general debe ser: "Microscópico, hiperrealista, estilo documental médico 3D, CGI brillante, iluminación cinemática, Unreal Engine 5, rayos X o renders anatómicos de altísima calidad".
2. NO escribas texto en los prompts visuales.
3. image_prompt: Prompt en inglés para Midjourney v6 detallando la escena médica/anatómica 3D.
4. animation_prompt: Prompt corto en inglés para Runway Gen-2 / Kling AI indicando el movimiento de cámara y el movimiento biológico (ej: "Blood cells rushing through a glowing vein, macro photography, slow motion").

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "Título final del video",
  "thumbnail": {
    "text": "TEXTO CORTO PARA MINIATURA (Máx 3-4 palabras impactantes)",
    "image_prompt": "Prompt en inglés para generar la miniatura perfecta (llamativa, anatómica, alto contraste)"
  },
  "scenes": [
    {
      "scene_number": 1,
      "narration": "[Copia exactamente la narración de la escena 1 del guion]",
      "visual_concept": "Concepto en español de lo que veremos en pantalla (Ej: Animación 3D de un corazón latiendo rápido)",
      "image_prompt": "El prompt en inglés para la imagen...",
      "animation_prompt": "El prompt en inglés para la animación..."
    }
  ],
  "caption": "Pie de foto viral con emojis y un dato curioso",
  "hashtags": ["CuerpoHumano", "Ciencia", "Curiosidades"]
}
`;
    } else if (mode === "improve_script") {
      const { current_script, instruction } = requestBody;
      prompt = `
Eres un guionista experto en retención para Shorts médicos y científicos.
Modifica este guion basándote EXACTAMENTE en la siguiente instrucción: "${instruction}"

MANTÉN el mismo número de escenas. MANTÉN el formato JSON idéntico.

Guion actual:
${current_script}

Responde SOLO con JSON válido:
{
  "title": "Título (puedes ajustarlo si aplica)",
  "script": [ { "scene_number": 1, "narration": "..." } ]
}
`;
    } else if (mode === "single_prompt") {
      const { prompt_type, scene_number, narration, existing_prompt } = requestBody;
      prompt = `
Eres un experto en prompts de IA médica y anatómica 3D (Midjourney/Runway).
Mejora o reescribe este prompt visual para hacerlo MUCHO más espectacular, fotorrealista y científicamente asombroso.
Tipo de prompt: ${prompt_type}
Escena ${scene_number} narración: "${narration}"
Prompt actual: "${existing_prompt}"

Estilo: "Microscópico, hiperrealista, documental médico 3D, CGI brillante".

Responde SOLO con JSON válido:
{
  "${prompt_type === "image" ? "image_prompt" : "animation_prompt"}": "Tu nuevo prompt en inglés..."
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.9 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating cuerpo humano:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
