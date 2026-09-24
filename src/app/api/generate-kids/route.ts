export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

const clean = (r: string) => r.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();

function parseJsonResponse(raw: string) {
  let cleanJson = raw.trim();
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
  else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
  cleanJson = cleanJson.trim();

  const firstBrace = cleanJson.indexOf('{');
  const firstBracket = cleanJson.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleanJson.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleanJson.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBracket + 1);
    }
  }

  return JSON.parse(cleanJson);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      action, 
      ageGroup, 
      formatType, 
      visualStyle, 
      character, 
      moral, 
      selectedIdea, 
      customScript,
      countdownSeconds,
      questionCount,
      challengeHookStyle
    } = body;

    const timerSecs = countdownSeconds ? Number(countdownSeconds) : 10;
    const qCount = questionCount ? Number(questionCount) : 5;

    // 1. GENERAR IDEAS
    if (action === "ideas") {
      const charLine = character ? `Materia o tema: "${character}".` : "Elige materias escolares populares (Geografía, Matemáticas, Historia, Ciencias, Ortografía).";
      const moralLine = moral ? `Objetivo didáctico: "${moral}".` : "Desafío de agilidad y conocimiento.";
      const isTriviaOrMath = (formatType || "").toLowerCase().includes("trivia") || 
                             (formatType || "").toLowerCase().includes("matemáticas") || 
                             (formatType || "").toLowerCase().includes("adivinanza") ||
                             (formatType || "").toLowerCase().includes("escolar");

      const triviaInstruction = isTriviaOrMath
        ? `IMPORTANTE PARA SERIE DE TRIVIA VIRAL (RETO DE ${qCount} PREGUNTAS CON OPCIONES A, B, C):
- Genera ideas con un GANCHO RETADOR AL EGO / CURIOSIDAD para los primeros 3 segundos.
- Ejemplos de ganchos virales potentes:
  * "¿Qué tanto sabes realmente de [Materia]? ¡Solo el 5% logra 5 de 5!"
  * "¿Sabes más que un estudiante de primaria? ¡Demuéstralo en este reto!"
  * "¡Pocos pasan de la pregunta 3! 5 preguntas de [Materia], ¿hasta cuál llegas?"
  * "Si fallas la primera, ¡tienes que dejar tu like! Pregunta número 1..."
- Cada idea debe ser una SERIE DE ${qCount} PREGUNTAS progresivas (de fácil a difícil).
- Cada pregunta debe tener sus 3 opciones (A, B y C) bien estructuradas (1 correcta, 2 distractores creíbles).`
        : "";

      const prompt = `Eres un estratega y creador de contenido viral #1 en TikTok, YouTube Shorts y Reels especializado en trivias escolares y retos educativos.
El usuario quiere generar 4 propuestas irresistibles de videos de trivia/retos para captar máxima retención y comentarios.

PARÁMETROS:
- Rango de Edad: "${ageGroup || 'Primaria Inicial (7 a 10 años)'}"
- Formato: "${formatType || 'Trivia Educativa / Preguntas Escolares'}"
- Cantidad de preguntas por video: ${qCount}
- Tiempo de conteo por pregunta: ${timerSecs} segundos
- Estilo de gancho: "${challengeHookStyle || 'Desafío de Orgullo / ¿Qué tanto sabes?'}"
- Estilo Visual: "${visualStyle || '3D Pixar / Disney Tierno'}"
${charLine}
${moralLine}
${triviaInstruction}
Semilla de aleatoriedad: ${Date.now()}-${Math.random()}

REGLAS DE RETENCIÓN VIRAL:
- Ganchos directos que obliguen a detener el scroll retando su conocimiento.
- Tono desafiante, alegre, motivador y 100% familiar (sin groserías ni faltas de respeto).

Responde ÚNICAMENTE con un JSON válido:
{
  "ideas": [
    {
      "title": "Título llamativo con emojis (ej. 🧠 ¿Sabes más que un niño de primaria? - 5 Preguntas)",
      "hook": "La frase de gancho retador exacta para los primeros 3 segundos",
      "description": "Explicación del reto y materias que abarcan las ${qCount} preguntas",
      "questions": [
        {
          "question_number": 1,
          "question": "Pregunta de nivel fácil...",
          "options": [
            { "letter": "A", "text": "Opción A", "is_correct": false },
            { "letter": "B", "text": "Opción B", "is_correct": true },
            { "letter": "C", "text": "Opción C", "is_correct": false }
          ]
        }
      ]
    }
  ]
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        return NextResponse.json(parseJsonResponse(response));
      } catch {
        return NextResponse.json(JSON.parse(clean(response)));
      }
    }

    // 2. GENERAR GUION NARRATIVO COMPLETO EN CADENA
    if (action === "script_only") {
      const ideaTitle = selectedIdea?.title || (typeof selectedIdea === "string" ? selectedIdea : "Trivia Educativa");
      const ideaHook = selectedIdea?.hook || "";
      const ideaDesc = selectedIdea?.description || "";
      const isTriviaOrMath = (formatType || "").toLowerCase().includes("trivia") || 
                             (formatType || "").toLowerCase().includes("matemáticas") || 
                             (formatType || "").toLowerCase().includes("adivinanza") ||
                             (formatType || "").toLowerCase().includes("escolar");

      const structureGuide = isTriviaOrMath
        ? `ESTRUCTURA DE RETO EN CADENA DE ${qCount} PREGUNTAS (CUENTA REGRESIVA DE ${timerSecs} SEGUNDOS CADA UNA):
1. GANCHO AL EGO / CURIOSIDAD (0-4s):
   - Frase retadora: "${ideaHook || `¿Qué tanto sabes realmente? ¡Solo los más inteligentes sacan ${qCount} de ${qCount}!`}"
   - "¡Empecemos con la número 1!"
2. BUCLE ENCADENADO PARA CADA UNA DE LAS ${qCount} PREGUNTAS:
   - Presentar la pregunta: "Pregunta [Número]: [Pregunta]"
   - Opciones en pantalla: "¿Será la A: [A], la B: [B], o la C: [C]?"
   - Pauta de conteo: "[Aparecen opciones A, B y C con reloj regresivo: ⏳ ${timerSecs}... 3... 2... 1...]"
   - Revelación y relleno verde: "[¡Tiempo! La opción [Letra] se ilumina en verde ✅] ¡Es la opción [Letra]: [Respuesta correcta]!"
   - Explicación de 1 frase interesante del por qué.
   - Transición rápida a la siguiente: "¡Siguiente pregunta!" o "¡Vamos por la ronda [Número], sube la dificultad!".
   - En la última pregunta: "¡Y última pregunta, la más difícil de todas!".
3. LLAMADA A LA ACCIÓN FINAL DISPARADORA DE COMENTARIOS:
   - "¡Fin del juego! ¿Cuántas acertaste: 3 de ${qCount}, 4 de ${qCount} o récord perfecto de ${qCount} de ${qCount}? ¡Escribe tu puntuación en los comentarios y suscríbete para la revancha de mañana!"`
        : `PAUTAS DE NARRACIÓN INFANTIL:
1. INICIO (0-5s): Saludo cálido y gancho entusiasta ("¡Hola amiguito! ¿Listo para una aventura?").
2. DESARROLLO (5-35s): Frases cortas, rítmicas y claras. Si hay cuenta regresiva, incluye: "[Cuenta regresiva sonora: ${timerSecs}... 3... 2... 1...]". Si es cuento o fábula, presenta al personaje y su pequeña travesura o descubrimiento.
3. CLÍMAX / REVELACIÓN (35-50s): Celebración alegre y explicación clara.
4. CIERRE AMABLE (50-60s): Pregunta cariñosa y llamado a la acción familiar.`;

      const prompt = `Eres un talentoso presentador de concursos educativos y guionista de videos virales (YouTube Kids, Shorts y TikTok).
Escribe un guion narrativo continuo y dinámico para una serie de ${qCount} preguntas.

DATOS DEL VIDEO:
- Título/Idea: "${ideaTitle}"
- Gancho sugerido: "${ideaHook}"
- Cantidad de preguntas: ${qCount}
- Tiempo de cuenta regresiva por pregunta: ${timerSecs} segundos
- Edad objetivo: "${ageGroup || 'Primaria Inicial (7 a 10 años)'}"
- Formato: "${formatType || 'Trivia Escolar Educativa'}"
- Valor / Aprendizaje: "${moral || 'Conocimiento escolar y agilidad mental'}"

${structureGuide}

REGLAS:
- Idioma: Español neutro impecable, tildes correctas, cero garabatos.
- Ritmo: Muy dinámico, competitivo y entretenido. Mantén a la audiencia enganchada de inicio a fin.

Responde ÚNICAMENTE con un JSON válido:
{
  "script": "Texto narrativo continuo completo de la locución con todas las ${qCount} preguntas encadenadas e indicaciones entre corchetes..."
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        return NextResponse.json(parseJsonResponse(response));
      } catch {
        const rawText = clean(response);
        return NextResponse.json({ script: rawText });
      }
    }

    // 3. MEJORAR GUION
    if (action === "improve_script") {
      const prompt = `Eres un guionista infantil experto.
Guion actual:
"${customScript}"

Instrucción de mejora: "${body.instruction || 'Hazlo más divertido y tierno'}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono dulce, claro y 100% seguro para niños en español neutro.

Responde ÚNICAMENTE con un JSON válido:
{
  "script": "El nuevo guion completo mejorado..."
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        return NextResponse.json(parseJsonResponse(response));
      } catch {
        const rawText = clean(response);
        return NextResponse.json({ script: rawText });
      }
    }

    // 4. DESGLOSAR EN ESCENAS Y PROMPTS
    if (action === "full_from_script") {
      const style = visualStyle || "3D Pixar / Disney Tierno";
      
      let styleDescriptor = "3D Pixar animation style, adorable cute fluffy character, big sparkling expressive eyes, soft rounded shapes, subsurface scattering, vibrant joyful pastel palette, volumetric warm sunlight, Unreal Engine 5 render, wholesome, Disney quality, 8k";
      if (style.includes("Acuarela") || style.includes("Ilustrado")) {
        styleDescriptor = "Whimsical children's picture book illustration, soft watercolor and ink textures, delicate pencil lines on textured paper, sweet gentle pastel colors, storybook warmth, charming and adorable nursery art style";
      } else if (style.includes("Plastilina") || style.includes("Claymation")) {
        styleDescriptor = "Charming claymation 3D stop-motion style, handcrafted plasticine texture, subtle organic fingerprints, cute chunky proportions, warm studio lighting, playful tactile feel, Aardman inspired animation style";
      } else if (style.includes("Fieltro") || style.includes("Lana")) {
        styleDescriptor = "Adorable handcrafted wool felt puppet in a miniature cozy diorama, fluffy needle-felted textures, warm woven fabric details, soft glowing background, ultra-cute handmade tactile craftsmanship";
      } else if (style.includes("Kawaii") || style.includes("2D")) {
        styleDescriptor = "Ultra cute 2D kawaii children vector illustration, bold clean outlines, vibrant pastel flat colors, adorable smiling chibi character, sparkling joyful atmosphere, playful and welcoming nursery design";
      }

      const prompt = `Eres un director de arte y animación especializado en contenido infantil para YouTube Kids, Disney y Nickelodeon.
Desglosa el siguiente guion infantil en 5 o 6 escenas secuenciales adorables.

GUION INFANTIL:
"${customScript}"

ESTILO VISUAL SOLICITADO:
${styleDescriptor}

REGLAS DE GENERACIÓN DE PROMPTS:
- image_prompt: En INGLÉS fotográfico/artístico impecable para Midjourney v6 / Flux. Formato vertical 9:16. Describe al personaje, sus ojos tiernos y grandes, sus colores, la iluminación soleada y suave, y el entorno alegre (flores, bosque mágico, habitación acogedora, cielo estrellado). CERO textos en la imagen.
- animation_prompt: En INGLÉS para Runway Gen-3 / Kling / Luma. Describe movimientos suaves, simpáticos y naturales (parpadear con alegría, saludar con la patita/mano a la cámara, sonreír, dar saltitos juguetones).
- narration: Asigna el fragmento exacto del guion a cada escena.
- text_overlay: Texto cortito y divertido en español que pueda aparecer en pantalla (ej. "¡Pregunta Escolar! 🎓", "A) Benito Juárez | B) Cristóbal Colón | C) Miguel Hidalgo", "⏳ 10... 9... 8...", "✅ ¡Opción B Correcta!", "¡Es el Elefantito! 🐘").
  * Si la escena es la pregunta con opciones: enumera las opciones ("A) ... B) ... C) ...").
  * Si la escena es la cuenta regresiva: contador visual con opciones activas ("⏳ 10s... 9s... [A, B, C]").
  * Si la escena es la revelación: marca con palomita y resalta la opción ganadora ("✅ Correcta: Opción [Letra]").
- audio_cues: Efectos de sonido sugeridos (reloj tic-tac con suspenso infantil, campanita mágica triunfal de acierto 'ding!', xilófono alegre, pop).

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "title": "Título encantador del video con emojis",
  "music_recommendation": "Música sugerida (ej. Marimba alegre infantil, Melodía de ukelele saltarín)",
  "hashtags": ["#paraniños", "#youtubekids", "#adivinanzas", "#cuentosinfantiles"],
  "learning_value": "Qué habilidad o valor aprendió el niño",
  "trivia_game": {
    "question": "Pregunta principal o primera pregunta",
    "countdown_seconds": 10,
    "options": [
      { "letter": "A", "text": "Texto opción A", "is_correct": false },
      { "letter": "B", "text": "Texto opción B (correcta)", "is_correct": true },
      { "letter": "C", "text": "Texto opción C", "is_correct": false }
    ],
    "explanation": "Breve explicación didáctica"
  },
  "trivia_questions": [
    {
      "question_number": 1,
      "question": "Pregunta exacta de la ronda 1",
      "options": [
        { "letter": "A", "text": "Texto opción A", "is_correct": false },
        { "letter": "B", "text": "Texto opción B", "is_correct": true },
        { "letter": "C", "text": "Texto opción C", "is_correct": false }
      ],
      "explanation": "Dato o confirmación"
    }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "timestamp": "0:00-0:08",
      "narration": "Texto de locución...",
      "text_overlay": "Texto corto en pantalla",
      "visual_concept": "Descripción de lo que se ve en español",
      "camera_movement": "Movimiento de cámara cinematográfico suave",
      "audio_cues": "Efectos sonoros infantiles",
      "image_prompt": "Prompt en inglés para Midjourney/Flux: ${styleDescriptor}...",
      "animation_prompt": "Prompt de animación suave en inglés para Runway/Kling..."
    }
  ]
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.75 });
      return NextResponse.json(parseJsonResponse(response));
    }

    // 5. REGENERAR PROMPT INDIVIDUAL
    if (action === "single_prompt") {
      const { narration, visual_concept, prompt_type, visualStyle } = body;
      const prompt = prompt_type === "animation"
        ? `Create an advanced Runway Gen-3 / Kling animation prompt for this wholesome children's scene: "${visual_concept || narration}". Style: Smooth Disney-quality character animation, gentle motion, waving, smiling, sparkling eyes, warm lighting, kid-safe and delightful.`
        : `Create an advanced Midjourney v6 image prompt for this wholesome children's scene: "${visual_concept || narration}". Style: ${visualStyle || '3D Pixar Disney style'}, adorable cute character with huge sparkling eyes, soft warm pastel lighting, whimsical joyful background, 8k, vertical 9:16 aspect ratio.`;

      const response = await chatCompletion(body, `${prompt}\nRespond ONLY with valid JSON: { "${prompt_type === 'animation' ? 'animation_prompt' : 'image_prompt'}": "..." }`, { temperature: 0.8 });
      return NextResponse.json(parseJsonResponse(response));
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("[API generate-kids Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
