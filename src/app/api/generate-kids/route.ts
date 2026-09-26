export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

const clean = (r: string) => r.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();

function robustParseJson(raw: string) {
  let cleanJson = raw.trim();
  // Strip code fences
  cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const firstBrace = cleanJson.indexOf('{');
  const firstBracket = cleanJson.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleanJson.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBrace + 1);
    } else {
      cleanJson = cleanJson.substring(startIdx);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleanJson.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBracket + 1);
    } else {
      cleanJson = cleanJson.substring(startIdx);
    }
  }

  // 1. Try direct parse
  try {
    return JSON.parse(cleanJson);
  } catch (e1) {
    // 2. Common JSON repairs: remove trailing commas, unescaped newlines in strings
    let sanitized = cleanJson
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*([}\]])/g, "$1")
      // Replace non-standard single quotes or smart quotes around keys
      .replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');

    // Balance unclosed quotes if truncated
    const quoteCount = (sanitized.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      sanitized += '"';
    }

    // Balance braces if truncated
    const openBraces = (sanitized.match(/{/g) || []).length;
    const closeBraces = (sanitized.match(/}/g) || []).length;
    if (openBraces > closeBraces) {
      sanitized += "}".repeat(openBraces - closeBraces);
    }
    const openBrackets = (sanitized.match(/\[/g) || []).length;
    const closeBrackets = (sanitized.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      sanitized += "]".repeat(openBrackets - closeBrackets);
    }

    try {
      return JSON.parse(sanitized);
    } catch (e2) {
      // Throw original error so caller can trigger semantic fallback
      throw e1;
    }
  }
}

function parseJsonResponse(raw: string) {
  return robustParseJson(raw);
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
      const style = visualStyle || "🌈 Super Quiz Colorido";
      const isTriviaOrQuiz = (formatType || "").toLowerCase().includes("trivia") || 
                             (formatType || "").toLowerCase().includes("escolar") ||
                             (formatType || "").toLowerCase().includes("matemáticas") ||
                             style.includes("Super Quiz") ||
                             style.includes("Quiz Escolar") ||
                             style.includes("Enciclopedia");
      
      let styleDescriptor = "Ultra vibrant colorful visual, deep saturated glowing colors, high contrast, visually striking and exciting for young learners, 8k, National Geographic and BBC Earth vivid style, crisp detail, joyful dynamic lighting";
      
      if (style.includes("Super Quiz") || style.includes("Enciclopedia") || style.includes("Quiz Escolar")) {
        styleDescriptor = "Vibrant hyper-colorful educational visual for a dynamic kids/teen quiz video. Deep vivid neon colors, glowing lighting, saturated rich hues (deep space cosmic purples, glowing neon sun gold, vibrant emerald leaf veins with translucent backlight, bright azure skies). Extremely eye-catching, energetic and stimulating visual, ultra-detailed 8k render/photography, clean isolated centerpiece subject. ABSOLUTELY NEVER generate a boring grey television news studio, TV cameras, or a studio set. Focus 100% on the exciting subject itself.";
      } else if (style.includes("Pixar") || style.includes("Disney")) {
        styleDescriptor = "3D Pixar animation style, adorable cute character, big sparkling expressive eyes, soft rounded shapes, subsurface scattering, vibrant joyful pastel palette, volumetric warm sunlight, Unreal Engine 5 render, wholesome, Disney quality, 8k";
      } else if (style.includes("Acuarela") || style.includes("Ilustrado")) {
        styleDescriptor = "Whimsical children's picture book illustration, soft watercolor and ink textures, delicate pencil lines on textured paper, sweet gentle pastel colors, storybook warmth, charming and adorable nursery art style";
      } else if (style.includes("Plastilina") || style.includes("Claymation")) {
        styleDescriptor = "Charming claymation 3D stop-motion style, handcrafted plasticine texture, subtle organic fingerprints, cute chunky proportions, warm studio lighting, playful tactile feel, Aardman inspired animation style";
      } else if (style.includes("Fieltro") || style.includes("Lana")) {
        styleDescriptor = "Adorable handcrafted wool felt puppet in a miniature cozy diorama, fluffy needle-felted textures, warm woven fabric details, soft glowing background, ultra-cute handmade tactile craftsmanship";
      } else if (style.includes("Kawaii") || style.includes("2D")) {
        styleDescriptor = "Ultra cute 2D kawaii children vector illustration, bold clean outlines, vibrant pastel flat colors, sparkling joyful atmosphere, playful and welcoming design";
      }

      const promptRules = isTriviaOrQuiz
        ? `REGLAS CRÍTICAS PARA GENERACIÓN DE PROMPTS (SUPER QUIZ COLORIDO Y VIBRANTE):
- El objetivo es atrapar al espectador al instante con IMÁGENES COLORIDAS, LLAMATIVAS Y FASCINANTES (como un eclipse de fuego dorado con corona solar brillante, el Sistema Solar con planetas saturados y nebulosas cósmicas púrpuras y azul eléctrico, una hoja en macro con venas fluorescentes brillando en esmeralda, o un animal exótico de colores vivos).
- PROHIBIDO TERMINANTEMENTE: Cero sets de televisión, cero estudios de grabación de noticias grises, cero cámaras de estudio, cero fondos aburridos apagados, cero pantallas de televisión dentro de una habitación.
- image_prompt: En INGLÉS para Midjourney v6 / Flux / Imagen. Describe directamente el OBJETO CIENTÍFICO O HISTÓRICO con COLORES SÚPER VIBRANTES y VIVOS:
  * Ejemplo Espacio: "A breathtaking glowing solar eclipse in deep space, fiery golden solar flares bursting into dark nebula, glowing cosmic corona, hyper-vibrant saturated orange and deep purple space clouds, cinematic 8k, awe-inspiring educational visual, no text."
  * Ejemplo Tierra/Órbitas: "Stunning 3D scientific diagram of the solar system with vivid colorful planetary orbits, hyper-detailed bright glowing Sun with radiant golden light, Earth glowing blue and green in 3rd orbital position, surrounded by sparkling colorful starfield, 8k."
  * Ejemplo Plantas/Ciencias: "Extreme macro photography of a lush vibrant green leaf with glowing translucent veins conducting sunlight, electric chlorophyll luminescence, deep emerald and golden rays, hyper-detailed nature photography, colorful and energetic."
  * Ejemplo Monumento: "The majestic Statue of Liberty standing proudly under an intense vivid azure blue sky with golden sunlight, vibrant copper-green patina glowing in sunlight, high saturation crisp travel photography, 8k."
  * CERO texto o letras en la imagen. La imagen debe ser el contenido puro del recuadro.
- animation_prompt: En INGLÉS para Runway Gen-3 / Kling. Describe movimiento cinematográfico suave y fluido del elemento cósmico, natural o histórico con destellos y partículas sutiles de luz.`
        : `REGLAS DE GENERACIÓN DE PROMPTS:
- image_prompt: En INGLÉS fotográfico/artístico impecable para Midjourney v6 / Flux. Formato horizontal 16:9 o vertical 9:16. Describe al sujeto con colores vivos, iluminación hermosa y entorno alegre. CERO textos en la imagen.
- animation_prompt: En INGLÉS para Runway Gen-3 / Kling / Luma. Describe movimientos suaves, simpáticos y naturales.
- narration: Asigna el fragmento exacto del guion a cada escena.
- text_overlay: Texto cortito y divertido en español que pueda aparecer en pantalla.`;

      const prompt = `Eres un director visual de trivias educativas de alto nivel para YouTube, Shorts y TikTok (estilo canales como Super Quiz).
Desglosa el siguiente guion en 5 o 6 escenas secuenciales impecables para el video.

GUION:
"${customScript}"

ESTILO VISUAL SOLICITADO:
${styleDescriptor}

${promptRules}
- audio_cues: Efectos de sonido sugeridos (reloj tic-tac con suspenso de 5 a 10s, campanita ding de acierto, sonido de zumbido o acierto).

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
      try {
        const parsed = parseJsonResponse(response);
        if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          return NextResponse.json(parsed);
        }
        if (parsed) {
          return NextResponse.json(parsed);
        }
      } catch (parseErr) {
        console.warn("[API generate-kids] JSON parse failed in full_from_script, running fallback extraction...", parseErr);
      }

      // FALLBACK PARSER: Si el JSON vino truncado o con sintaxis inválida, rescatamos las escenas y datos
      try {
        const titleMatch = response.match(/"title"\s*:\s*"([^"]+)"/i);
        const musicMatch = response.match(/"music_recommendation"\s*:\s*"([^"]+)"/i);
        const learningMatch = response.match(/"learning_value"\s*:\s*"([^"]+)"/i);

        // Extraer escenas mediante bloques regex
        const scenes: any[] = [];
        const sceneRegex = /\{\s*"scene_number"\s*:\s*(\d+)[\s\S]*?"narration"\s*:\s*"([^"]*)"[\s\S]*?"visual_concept"\s*:\s*"([^"]*)"[\s\S]*?"image_prompt"\s*:\s*"([^"]*)"[\s\S]*?"animation_prompt"\s*:\s*"([^"]*)"/gi;
        
        let match;
        let count = 1;
        while ((match = sceneRegex.exec(response)) !== null) {
          scenes.push({
            scene_number: Number(match[1]) || count,
            timestamp: `0:0${(count - 1) * 8}-0:0${count * 8}`,
            narration: match[2] || "",
            text_overlay: "",
            visual_concept: match[3] || "",
            camera_movement: "Smooth camera motion",
            audio_cues: "Sonido alegre infantil",
            image_prompt: match[4] || `${styleDescriptor}, cute wholesome scene`,
            animation_prompt: match[5] || "Smooth Disney style character movement",
          });
          count++;
        }

        // Si la regex estricta no encontró escenas, dividir el guion en escenas automáticamente
        if (scenes.length === 0) {
          const scriptLines = String(customScript || "")
            .split(/\n+/)
            .map(l => l.trim())
            .filter(l => l.length > 10);

          const total = Math.min(Math.max(scriptLines.length, 3), 6);
          for (let i = 0; i < total; i++) {
            const line = scriptLines[i] || `Parte ${i + 1} de la aventura educativa`;
            scenes.push({
              scene_number: i + 1,
              timestamp: `0:0${i * 8}-0:0${(i + 1) * 8}`,
              narration: line,
              text_overlay: line.length > 30 ? line.substring(0, 30) + "..." : line,
              visual_concept: `Escena tierna ilustrando: ${line}`,
              camera_movement: "Suave paneo cinematográfico",
              audio_cues: i === 0 ? "Campanita alegre" : "Tic-tac suave y ding de respuesta",
              image_prompt: `${styleDescriptor}, ${line}. Wholesome, cheerful atmosphere, 8k, vertical 9:16`,
              animation_prompt: `Smooth character movement, friendly blinking and smiling, warm lighting, Disney quality.`,
            });
          }
        }

        return NextResponse.json({
          title: titleMatch ? titleMatch[1] : "Aventura y Reto Infantil",
          music_recommendation: musicMatch ? musicMatch[1] : "Marimba alegre infantil",
          hashtags: ["#paraniños", "#youtubekids", "#adivinanzas", "#retosinfantiles"],
          learning_value: learningMatch ? learningMatch[1] : "Conocimiento, agilidad mental y diversión",
          scenes,
        });
      } catch (fallbackErr) {
        console.error("[API generate-kids] Fallback also failed:", fallbackErr);
        throw fallbackErr;
      }
    }



    // 5. REGENERAR PROMPT INDIVIDUAL
    if (action === "single_prompt") {
      const { narration, visual_concept, prompt_type, visualStyle } = body;
      const isQuiz = (visualStyle || "").includes("Super Quiz") || (visualStyle || "").includes("Quiz Escolar");
      
      const prompt = prompt_type === "animation"
        ? (isQuiz
            ? `Create a cinematic, subtle Runway Gen-3 / Kling camera animation prompt for this educational quiz visual: "${visual_concept || narration}". Style: Slow cinematic camera movement, slow motion reveal or gentle rotation, clean studio lighting, realistic documentary quality, absolutely no cartoon characters.`
            : `Create an advanced Runway Gen-3 / Kling animation prompt for this children's scene: "${visual_concept || narration}". Style: Smooth Disney-quality character animation, gentle motion, kid-safe and delightful.`)
        : (isQuiz
            ? `Create an advanced Midjourney v6 / Flux prompt for an educational quiz showcase visual about: "${visual_concept || narration}". Style: Authentic high-detail documentary photography or ultra-sharp 3D scientific/astronomy diagram, National Geographic textbook quality, vivid lighting, crisp focus, isolated frame for quiz display, 8k, horizontal/vertical format, no cartoons, no text.`
            : `Create an advanced Midjourney v6 image prompt for this wholesome scene: "${visual_concept || narration}". Style: ${visualStyle || '3D Pixar Disney style'}, warm pastel lighting, joyful background, 8k, vertical 9:16 aspect ratio.`);

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
