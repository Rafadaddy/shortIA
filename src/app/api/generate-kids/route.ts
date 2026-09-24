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
      countdownSeconds
    } = body;

    const timerSecs = countdownSeconds ? Number(countdownSeconds) : 10;

    // 1. GENERAR IDEAS
    if (action === "ideas") {
      const charLine = character ? `Tema específico, reto o personaje: "${character}".` : "Elige preguntas escolares, retos educativos o personajes adorables y variados.";
      const moralLine = moral ? `Área de aprendizaje o valor a transmitir: "${moral}".` : "Enfoque educativo interactivo y alegre.";
      const isTriviaOrMath = (formatType || "").toLowerCase().includes("trivia") || 
                             (formatType || "").toLowerCase().includes("matemáticas") || 
                             (formatType || "").toLowerCase().includes("adivinanza") ||
                             (formatType || "").toLowerCase().includes("escolar");

      const triviaInstruction = isTriviaOrMath
        ? `IMPORTANTE PARA TRIVIA ESCOLAR / RETO EDUCATIVO CON 3 OPCIONES:
- Plantea preguntas de materias escolares reales (Historia, Matemáticas, Español/Gramática, Ciencias, Geografía, etc., por ejemplo: "¿Quién descubrió América?", "¿Cuánto es 8x7?", "¿Cuál es el sujeto en esta oración?").
- Cada idea debe incluir la pregunta detonante y 3 OPCIONES (A, B y C) bien estructuradas donde una sea la correcta y dos sean distractores creíbles.
- Especifica el tiempo de cuenta regresiva de ${timerSecs} segundos.`
        : "";

      const prompt = `Eres un experto creador de contenido infantil y educativo viral para YouTube Kids, YouTube Shorts y TikTok en español.
El usuario quiere generar 4 ideas super atrapantes y educativas para videos infantiles.

PARÁMETROS:
- Rango de Edad: "${ageGroup || 'Preescolar (4 a 6 años)'}"
- Formato / Tipo: "${formatType || 'Trivia Escolar Educativa con Cuenta Regresiva'}"
- Tiempo de Cuenta Regresiva para responder: ${timerSecs} segundos
- Estilo Visual: "${visualStyle || '3D Pixar / Disney Tierno'}"
${charLine}
${moralLine}
${triviaInstruction}
Semilla de aleatoriedad: ${Date.now()}-${Math.random()}

REGLAS INFANTILES ESTRICTAS:
- Idioma: Español neutro limpio, entusiasta y cariñoso. CERO lenguaje violento, grosero o aterrador.
- Ganchos con preguntas directas, retos de conocimiento escolar o misterios simpáticos que involucren al niño o a la familia.
- Formato adaptado a la edad seleccionada.

Responde ÚNICAMENTE con un JSON válido:
{
  "ideas": [
    {
      "title": "Título llamativo y divertido con emojis",
      "hook": "La frase o pregunta inicial exacta para los primeros 3 segundos",
      "description": "De qué trata la pregunta o reto y qué aprenderá el niño",
      "options": [
        { "letter": "A", "text": "Primera opción", "is_correct": false },
        { "letter": "B", "text": "Segunda opción (ejemplo la correcta)", "is_correct": true },
        { "letter": "C", "text": "Tercera opción", "is_correct": false }
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

    // 2. GENERAR GUION NARRATIVO COMPLETO
    if (action === "script_only") {
      const ideaTitle = selectedIdea?.title || (typeof selectedIdea === "string" ? selectedIdea : "Cuento Infantil");
      const ideaHook = selectedIdea?.hook || "";
      const ideaDesc = selectedIdea?.description || "";
      const isTriviaOrMath = (formatType || "").toLowerCase().includes("trivia") || 
                             (formatType || "").toLowerCase().includes("matemáticas") || 
                             (formatType || "").toLowerCase().includes("adivinanza") ||
                             (formatType || "").toLowerCase().includes("escolar");

      const structureGuide = isTriviaOrMath
        ? `ESTRUCTURA EXACTA DE TRIVIA ESCOLAR CON 3 OPCIONES Y CUENTA REGRESIVA DE ${timerSecs} SEGUNDOS:
1. PREGUNTA RETO Y 3 OPCIONES (0-15s):
   - Saludo entusiasta y planteamiento claro de la pregunta.
   - Enunciar las 3 opciones de manera divertida:
     "¿Será la opción A: [Opción A], la opción B: [Opción B], o la opción C: [Opción C]?"
2. CUENTA REGRESIVA EN PANTALLA (${timerSecs} segundos):
   - Incluir la pauta sonora y visual: "[Aparecen en pantalla las opciones A, B y C con reloj de ${timerSecs} segundos: ⏳ ${Array.from({length: Math.min(timerSecs, 10)}, (_, i) => timerSecs - i).join('... ')}...]".
   - El locutor puede decir brevemente: "¡Corre el tiempo! ¿Cuál eliges? ¡Déjala en los comentarios antes de que se acabe!".
3. REVELACIÓN Y EFECTO VISUAL (después del conteo):
   - Anuncio triunfal: "[¡Tiempo terminado! ¡La opción correcta se ilumina en verde brillante ✅!] ¡Exacto, la respuesta correcta es la opción [Letra]!".
   - Explicación didáctica: Explicar en 2 frases sencillas y atractivas el por qué, dando un dato curioso que enriquezca el aprendizaje del niño.
4. LLAMADA A LA ACCIÓN (últimos 5s):
   - Preguntar con calidez: "¿Acertaste? ¡Dale like al video si elegiste la correcta y suscríbete para más retos diarios!".`
        : `PAUTAS DE NARRACIÓN INFANTIL:
1. INICIO (0-5s): Saludo cálido y gancho entusiasta ("¡Hola amiguito! ¿Listo para una aventura?").
2. DESARROLLO (5-35s): Frases cortas, rítmicas y claras. Si hay cuenta regresiva, incluye: "[Cuenta regresiva sonora: ${timerSecs}... 3... 2... 1...]". Si es cuento o fábula, presenta al personaje y su pequeña travesura o descubrimiento.
3. CLÍMAX / REVELACIÓN (35-50s): Celebración alegre y explicación clara.
4. CIERRE AMABLE (50-60s): Pregunta cariñosa y llamado a la acción familiar.`;

      const prompt = `Eres un talentoso educador infantil y guionista de videos para niños (YouTube Kids, Shorts y TikTok).
Escribe un guion narrativo continuo para un video de 45 a 60 segundos.

DATOS DEL VIDEO:
- Título/Idea: "${ideaTitle}"
- Gancho sugerido: "${ideaHook}"
- Descripción: "${ideaDesc}"
- Edad objetivo: "${ageGroup || 'Preescolar (4 a 6 años)'}"
- Formato: "${formatType || 'Trivia Escolar Educativa'}"
- Tiempo de cuenta regresiva: ${timerSecs} segundos
- Valor / Aprendizaje: "${moral || 'Conocimiento escolar y curiosidad'}"

${structureGuide}

REGLAS:
- Idioma: Español neutro impecable, tildes correctas, sin palabras difíciles ni garabatos.
- Tono: Alegre, didáctico, dulce y muy estimulante.

Responde ÚNICAMENTE con un JSON válido:
{
  "script": "Texto narrativo continuo de la locución infantil con indicaciones entre corchetes..."
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
    "question": "Pregunta exacta de la trivia",
    "countdown_seconds": 10,
    "options": [
      { "letter": "A", "text": "Texto opción A", "is_correct": false },
      { "letter": "B", "text": "Texto opción B (correcta)", "is_correct": true },
      { "letter": "C", "text": "Texto opción C", "is_correct": false }
    ],
    "explanation": "Breve explicación didáctica de por qué es la correcta"
  },
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
