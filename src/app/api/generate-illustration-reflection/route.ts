import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

// Banco de metáforas poéticas para inyectar variedad infinita
const METAPHOR_ARCHETYPES = [
  "Abrazar una roca o piedra sonriente en medio de un camino soleado al atardecer",
  "Sentado en un sofá cálido tomando café con una taza en mano, viendo la silueta punteada vacía de alguien que se fue",
  "Caminando con paso firme y mochila ligera hacia el sol, mientras otro personaje indeciso lo jalonea hacia atrás",
  "Soltando con las manitas abiertas un globo rojo o un diente de león luminoso que vuela al cielo despejado",
  "Regando con amor y paciencia una pequeña maceta de la que nace un brote verde brillante",
  "Cosiéndose con aguja e hilo dorado (Kintsugi) una grieta suave en su pecho con una sonrisa serena",
  "Dejando caer una pesada mochila llena de piedras grises junto a un banco de madera y respirando con alivio",
  "Sentado junto a una ventana un día lluvioso, envuelto en una bufanda tejida, sosteniendo una taza humeante",
  "Saliendo de una maceta diminuta y oscura para caminar descalzo sobre un prado verde iluminado",
  "Dibujando con tiza un círculo protector suave alrededor de sí mismo en el suelo, mirando en paz",
  "Colocándose a sí mismo una bandita o curita con un pequeño corazón rojo en el pecho",
  "Sosteniendo un paraguas amarillo bajo una nube gris, sonriendo porque sus pies están a salvo",
  "Mirando su propio reflejo en un charco de agua limpia y el reflejo le sonríe de vuelta con flores",
  "Abrazándose a sí mismo con ternura bajo la luz de una farola cálida en una noche tranquila",
  "Plantando una semilla brillante en la tierra bajo la lluvia suave con esperanza en los ojos"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, customTopic, tone, watermarkText, aspect = "9:16" } = body;

    // Acción para generar ideas y temas variados
    if (action === "ideas") {
      const prompt = [
        "Eres un creador viral de cómics y reflexiones ilustradas estilo 'Chispas de Inspiración', 'Cosas Bonitas' y 'Wholesome Webcomics'.",
        "Tu objetivo es proponer 4 conceptos de reflexiones ilustradas con un personaje tierno minimalista blanco (estilo masita / blobby con mejillas rosadas).",
        `Categoría solicitada: "${category || 'Superación Personal y Amor Propio'}".`,
        customTopic ? `Tema específico del usuario: "${customTopic}".` : "",
        `Tono: "${tone || 'Conmovedor y Sabio'}".`,
        "",
        "Cada idea debe incluir:",
        "1. 'quote': Una frase corta y profunda (máximo 14 palabras) que impacte al corazón.",
        "2. 'highlight': 1 o 2 palabras clave de la frase que se resaltarán visualmente.",
        "3. 'visual_metaphor': Descripción de la metáfora visual poética y literal (qué hace el personaje blanco, con qué interactúa).",
        "",
        "Responde SOLO con JSON válido:",
        `{
          "ideas": [
            {
              "quote": "Tropezar no es malo, encariñarse con la piedra sí.",
              "highlight": "encariñarse con la piedra",
              "visual_metaphor": "El monigote blanco sentado en un camino abrazando tiernamente a una roca con mejillas rosadas."
            }
          ]
        }`
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.95 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Acción para proponer ideas de HISTORIAS / REELS MULTIESCENA (antes de generar todas las escenas)
    if (action === "multiscene_ideas") {
      const requestedCount = Math.min(Math.max(Number(body.sceneCount) || 3, 3), 8);
      const prompt = [
        "Eres un creador viral de Reels y animaciones emotivas de desarrollo personal para TikTok y YouTube Shorts.",
        `Propón 4 conceptos diferentes de historias para un Reel de ${requestedCount} escenas consecutivas con el personaje tierno blanco (blob).`,
        `Categoría: "${category || 'Superar el Cansancio y Encontrar Paz'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Esperanzador y Cálido'}".`,
        "",
        "Cada idea debe incluir:",
        "1. 'title': Un título o gancho de historia llamativo y emotivo.",
        "2. 'story_premise': De qué trata la historia en 2 líneas (el conflicto inicial y la moraleja o alivio final).",
        "3. 'arc_summary': Breve descripción de cómo evoluciona la historia a lo largo de las escenas.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          ideas: [
            {
              title: "Aprender a soltar lo que pesa más que tú",
              story_premise: "El personaje carga cosas del pasado hasta que decide descansar y vaciar su mochila.",
              arc_summary: "Inicia agotado -> encuentra una flor en el camino -> suelta las piedras -> respira al atardecer."
            },
            {
              title: "El día que dejó de compararse con los demás",
              story_premise: "Ve a otros florecer rápido mientras él siente que va lento, hasta que comprende su propio ritmo.",
              arc_summary: "Mira otros árboles floreciendo -> siente tristeza -> riega su propia semilla -> su jardín florece con amor."
            }
          ]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.9 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Acción para generar la pieza completa: Frase + Metáfora + Prompt Profesional + Guion de Video
    if (action === "create") {
      const randomArchetype = METAPHOR_ARCHETYPES[Math.floor(Math.random() * METAPHOR_ARCHETYPES.length)];
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres un director de arte y guionista de contenido viral especializado en 'Reflexiones Ilustradas con Personajes Tiernos'.",
        "Estilo de referencia: Ilustraciones estilo 'Chispas de Inspiración', webcomics minimalistas tiernos (personaje blanco redondeado tipo blob / masita con mejillas rosadas y ojos cerrados en paz).",
        "",
        `Categoría: "${category || 'Cerrar Ciclos y Soltar'}".`,
        customTopic ? `Tema o idea base: "${customTopic}".` : "",
        `Inspiración o arquetipo para variedad: "${randomArchetype}".`,
        `Semilla de originalidad: ${seed}.`,
        "",
        "REQUISITOS DEL CONTENIDO:",
        "1. 'quote': Frase de reflexión impactante y memorable de 1 a 3 líneas (máximo 12-16 palabras). Debe ser profunda, madura y fácil de compartir.",
        "2. 'highlight_word': La palabra o frase corta que llevará el resalte de color pastel en la imagen.",
        "3. 'metaphor_description': Explicación en español de la escena y la metáfora visual (qué hace el personaje y qué simboliza).",
        "4. 'image_prompt': PROMPT MAESTRO CON TEXTO INTEGRADO (Para Ideogram / Imagen 3 / DALL-E):",
        "   - ESTRUCTURA EXACTA OBLIGATORIA (PERSONAJE BLOQUEADO + TIPOGRAFÍA BLOQUEADA BICOLOR):",
        "     'SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, small smile, rosy pink round cheeks, sticker style, wholesome, [ACCIÓN EXACTA Y OBJETO METAFÓRICO], background is soft photorealistic [FONDO FOTORREALISTA CÁLIDO], 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, soft organic uneven baseline, very legible, bold weight, 3 to 4 centered lines, auto bicolor logic: the setup/context lines in solid black #000000, and the punchline/emotional keyword lines in warm terracotta reddish-brown #8B3A3A, same font family for all, no outline, no shadow, no extra colors, high contrast against sky. Text: \"[QUOTE]\", highlight the most emotional keyword of the phrase in warm pastel peach #F5C48E or terracotta #8B3A3A, rest of text in black #000000, high aesthetic, serene emotional atmosphere.'",
        "5. 'image_prompt_clean': PROMPT MAESTRO LIMPIO (SIN TEXTO, para editar en Canva o CapCut):",
        "   - 'SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, small smile, rosy pink round cheeks, sticker style, wholesome, [ACCIÓN EXACTA Y OBJETO METAFÓRICO], background is soft photorealistic [FONDO FOTORREALISTA CÁLIDO], 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters, no text, no typography.'",
        "6. 'script_narration': Un guion de 20 a 30 segundos para video corto (TikTok / Reels / Shorts):",
        "   - Gancho emotivo",
        "   - Desarrollo con voz suave y reflexiva",
        "   - Cierre contundente invitando a guardar o reflexionar.",
        "7. 'soundtrack': Música recomendada (ej. 'Piano acústico lofi suave', 'Guitarra acústica melancólica').",
        "8. 'hashtags': 5 hashtags virales relacionados con amor propio, reflexiones y desarrollo personal.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          quote: "Cuando la ausencia se vuelve alivio, el ciclo está cerrado.",
          highlight_word: "alivio",
          metaphor_description: "El personaje blanco sentado en un cómodo sofá tomando una taza caliente con una expresión de paz, mientras al lado en el cojín hay una silueta punteada vacía de la persona que se fue.",
          image_prompt: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, small smile, rosy pink round cheeks, sticker style, wholesome, sitting on a cozy sofa holding a pink mug with two hands next to an empty cushion with a subtle dashed outline silhouette, background is soft photorealistic warm cozy living room with soft natural ambient lighting, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, soft organic uneven baseline, very legible, bold weight, 3 to 4 centered lines, auto bicolor logic: the setup/context lines in solid black #000000, and the punchline/emotional keyword lines in warm terracotta reddish-brown #8B3A3A, same font family for all, no outline, no shadow, no extra colors, high contrast against sky. Text: \"Cuando la ausencia se vuelve alivio, el ciclo está cerrado.\", highlight the most emotional keyword of the phrase in warm pastel peach #F5C48E or terracotta #8B3A3A, rest of text in black #000000, high aesthetic, serene emotional atmosphere.",
          image_prompt_clean: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, small smile, rosy pink round cheeks, sticker style, wholesome, sitting on a cozy sofa holding a pink mug with two hands next to an empty cushion with a subtle dashed outline silhouette, background is soft photorealistic warm cozy living room with soft natural ambient lighting, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters, no text, no typography.",
          script_narration: "¿Alguna vez sentiste miedo de quedarte solo, pero cuando esa persona se fue, tu pecho por fin respiró en paz?\n\nNo todas las despedidas son pérdidas. A veces, la soledad es el abrazo más sincero que la vida te da para recordarte quién eres.\n\nCuando la ausencia se convierte en tranquilidad, no perdiste a nadie: te recuperaste a ti.",
          soundtrack: "Piano lofi relajante con suave sonido de lluvia de fondo",
          hashtags: ["#ReflexionesDeVida", "#AmorPropio", "#Soltar", "#PazMental", "#CerrarCiclos"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return NextResponse.json(parsed);
    }

    // Acción para generar DIÁLOGO / CHAT ENTRE 2 PERSONAJES BLOB
    if (action === "dialogue") {
      const { dialogueDynamic } = body;
      const sceneCountRequested = Math.min(Math.max(Number(body.dialogueCount) || 3, 2), 6);
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres un director creativo y guionista especializado en cómics y viñetas de diálogo secuencial entre dos personajes tiernos minimalistas blancos (SAME CHARACTER LOCKED: two cute minimalist white blob characters).",
        `Dinámica del diálogo: "${dialogueDynamic || 'Amigos incondicionales apoyándose'}".`,
        customTopic ? `Tema o dilema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Conmovedor y Tierno'}".`,
        `Número exacto de viñetas/imágenes consecutivas: ${sceneCountRequested}.`,
        `Semilla única: ${seed}.`,
        "",
        "OBJETIVO: Crear una CONVERSACIÓN SECUENCIAL TIPO CÓMIC/CARRUSEL (como en los webcomics virales de parejas y amigos):",
        "Cada viñeta/escena es una imagen individual consecutiva donde ambos personajes están presentes, pero el bocadillo de diálogo (speech bubble) muestra lo que se dicen en cada turno de la conversación, con poses y expresiones consistentes pero vivas.",
        "",
        "ESTRUCTURA DE RESPUESTA EN JSON:",
        "1. 'title': Título emotivo y llamativo.",
        "2. 'scenes': Array con exactamente " + sceneCountRequested + " escenas/viñetas consecutivas.",
        "   Cada escena debe contener:",
        "   - 'turn_number': Número del turno (1, 2, 3...)",
        "   - 'speaker': Quién habla en esta viñeta (Ej: 'Personaje Izquierdo' o 'Personaje Derecho', o nombres tiernos como 'Él' / 'Ella', 'Mente' / 'Corazón')",
        "   - 'speech_text': El texto exacto de lo que dice en este turno (máximo 2 a 3 líneas claras y conmovedoras).",
        "   - 'listener_reaction': Lo que responde o cómo reacciona el otro personaje en silencio o gestos.",
        "   - 'characters_pose_action': Descripción en inglés de las poses y expresiones de ambos personajes en esta viñeta (Ej: 'left white blob character looking up with gentle curious smile, right white blob character sitting close with a warm tender gaze resting a hand on its heart').",
        "3. 'dialogue_text': Todo el diálogo continuo transcripto línea por línea.",
        "4. 'script_narration': Guion de locución o actuación de voces por si se usa en video/Reels.",
        "5. 'soundtrack': Música suave recomendada.",
        "6. 'hashtags': 5 hashtags virales.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          title: "Promesas que se dicen sin hablar",
          scenes: [
            {
              turn_number: 1,
              speaker: "Personaje Izquierdo",
              speech_text: "¿Podemos simplemente quedarnos aquí y hablar?",
              listener_reaction: "Sonríe aliviado y asiente con ternura",
              characters_pose_action: "two white blob characters sitting together on a soft fluffy cloud against a serene golden sunset, left character looking sideways with tiny closed curved eyes asking softly, right character turning head towards it listening attentively with rosy blushing cheeks"
            },
            {
              turn_number: 2,
              speaker: "Personaje Derecho",
              speech_text: "Esperaba que tú fueras quien dijera eso de verdad.",
              listener_reaction: "Sus mejillas brillan de emoción y felicidad",
              characters_pose_action: "two white blob characters sitting very close, right character gently leaning in with a wholesome smile, left character blushing happily with hands resting on its chubby lap"
            },
            {
              turn_number: 3,
              speaker: "Personaje Izquierdo",
              speech_text: "¿Qué fue lo más importante para ti hoy?",
              listener_reaction: "La mira a los ojos con profunda paz",
              characters_pose_action: "left white blob character looking with sweet sparkling curved eyes, right character holding a tiny glowing star between its small hands"
            },
            {
              turn_number: 4,
              speaker: "Personaje Derecho",
              speech_text: "Elegir quedarme a tu lado. Y empezar el resto de nuestros días juntos. ♡",
              listener_reaction: "Ambos se abrazan con ternura infinita",
              characters_pose_action: "two cute white blob characters warmly embracing each other on the clouds, eyes closed in complete peaceful bliss, tiny pink blushing cheeks"
            }
          ],
          dialogue_text: "— ¿Podemos simplemente quedarnos aquí y hablar?\n— Esperaba que tú fueras quien dijera eso de verdad.\n— ¿Qué fue lo más importante para ti hoy?\n— Elegir quedarme a tu lado. Y empezar el resto de nuestros días juntos. ♡",
          script_narration: "A veces no necesitas grandes planes...\nSolo la persona correcta y una conversación sincera al caer la tarde. Quédate con quien haga de tu silencio un lugar seguro. ♡",
          soundtrack: "Melodía de piano acústico suave y reconfortante",
          hashtags: ["#ComicsDePareja", "#AmorSano", "#ConversacionesReales", "#BlobsTiernos", "#Webcomics"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.82 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
        parsed.scenes = [];
      }

      // Asegurar que siempre existan las escenas solicitadas
      while (parsed.scenes.length < sceneCountRequested) {
        const nextIdx = parsed.scenes.length + 1;
        parsed.scenes.push({
          turn_number: nextIdx,
          speaker: nextIdx % 2 === 1 ? "Personaje A" : "Personaje B",
          speech_text: nextIdx === sceneCountRequested ? "Aquí estoy, y no me voy a ir. ♡" : "Dime qué sientes, te escucho.",
          listener_reaction: "Sonríe en calma",
          characters_pose_action: "two white blob characters sitting closely side by side on a serene background, sharing a peaceful tender moment"
        });
      }

      if (parsed.scenes.length > sceneCountRequested) {
        parsed.scenes = parsed.scenes.slice(0, sceneCountRequested);
      }

      // Sintetizar prompts individuales para cada viñeta consecutiva con BOCADILLO DE DIÁLOGO (Speech Bubble)
      parsed.scenes.forEach((sc: any, idx: number) => {
        sc.turn_number = idx + 1;
        const poseAction = sc.characters_pose_action || "left blob sitting close on a cozy rug, right blob listening tenderly with gentle smile";
        const bubbleText = (sc.speech_text || "TE QUIERO MUCHO").toUpperCase().trim();
        const speakingBlob = sc.speaker && sc.speaker.toLowerCase().includes("derech") ? "right blob" : "left blob";

        // Prompt con bocadillo de cómic bloqueado (estilo mejorado por el usuario)
        sc.image_prompt = `SAME CHARACTER LOCKED, SAME STYLE LOCKED: two cute minimalist white blob characters, bald, no hair, no clothes, no human skin, smooth white dough bodies, thick bold black outlines, flat simple colors, no shading, no gradient, 5 to 8 years old child proportions, big round heads, short chubby limbs, tiny closed eyes as simple U-shaped black lines, small smiles, rosy pink round cheeks, sticker webcomic style, wholesome, kawaii, ultra cute, ${poseAction}, soft bokeh photorealistic background, warm cozy room with golden hour sunset light through window, plants, chunky knit blankets, fairy lights, cinematic lighting, shallow depth of field, hygge aesthetic, 2D flat comic characters over photorealistic background, sharp focus on characters, vertical 9:16, high resolution, emotional storytelling, highly shareable, 8k, Comic Speech Bubble LOCKED: a very clean prominent hand-drawn white speech bubble with extra thick bold black outline, centered at top, with a small sharp tail pointing directly to ${speakingBlob}, inside the bubble clearly reads in Spanish, handwritten casual bold rounded marker font, all caps text: "${bubbleText}", perfect spelling, high contrast, no extra text.`;

        // Prompt limpio sin bocadillo (para video/Reel doblado con voz o edición externa)
        sc.image_prompt_clean = `SAME CHARACTER LOCKED, SAME STYLE LOCKED: two cute minimalist white blob characters, bald, no hair, no clothes, no human skin, smooth white dough bodies, thick bold black outlines, flat simple colors, no shading, no gradient, 5 to 8 years old child proportions, big round heads, short chubby limbs, tiny closed eyes as simple U-shaped black lines, small smiles, rosy pink round cheeks, sticker webcomic style, wholesome, kawaii, ultra cute, ${poseAction}, soft bokeh photorealistic background, warm cozy room with golden hour sunset light through window, plants, chunky knit blankets, fairy lights, cinematic lighting, shallow depth of field, hygge aesthetic, 2D flat comic characters over photorealistic background, sharp focus on characters, vertical 9:16, high resolution, emotional storytelling, highly shareable, 8k, empty space top third, clean background, no letters, no text, no speech bubbles, no typography.`;
      });

      return NextResponse.json(parsed);
    }

    // Acción para generar REEL MULTIESCENA / HISTORIA DE 3 A 8 ESCENAS CONSECUTIVAS
    if (action === "multiscene") {
      const requestedCount = Math.min(Math.max(Number(body.sceneCount) || 3, 3), 8);
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres un director de cortometrajes virales y animaciones conmovedoras para TikTok, Instagram Reels y YouTube Shorts.",
        `Crea el contenido narrativo para una historia visual secuencial de EXACTAMENTE ${requestedCount} escenas consecutivas con el personaje blanco tierno minimalista (blob).`,
        `Categoría: "${category || 'Superar la Ansiedad y Encontrar Paz'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Esperanzador y Cálido'}".`,
        `Semilla: ${seed}.`,
        "",
        "REQUISITOS DE LA HISTORIA MULTIESCENA:",
        `1. El array 'scenes' DEBE contener EXACTAMENTE ${requestedCount} objetos ordenados cronológicamente del 1 al ${requestedCount}:`,
        "   - 'scene_number': Número entero de escena (1, 2, ...).",
        "   - 'slide_text': Frase corta que va en la imagen (máximo 8 palabras).",
        "   - 'narration_snippet': Frase que dice la voz en off en esta escena (10-15 palabras).",
        "   - 'action_description': Descripción breve en inglés de qué hace el personaje y en qué lugar está (ej: 'walking with heavy backpack on a misty road', 'sitting on a hill looking at a flower', 'smiling facing the golden sunset').",
        "2. 'full_script': El guion de locución completo y fluido.",
        "3. 'soundtrack': Música cinematográfica recomendada.",
        "4. 'hashtags': 5 hashtags virales.",
        "",
        `Responde SOLO con JSON válido con exactamente ${requestedCount} escenas en 'scenes':`,
        JSON.stringify({
          title: "Aprender a soltar para volver a respirar",
          scenes: [
            {
              scene_number: 1,
              slide_text: "Hay días donde la mente pesa más que el cuerpo.",
              narration_snippet: "Nos enseñaron que resistir siempre es de valientes, pero sostener tanto desgasta el alma.",
              action_description: "walking slowly carrying an oversized heavy grey backpack, shoulders down, misty road at dawn"
            }
          ],
          full_script: "Hay días donde la mente pesa más que el cuerpo...\n\nHasta que entiendes que soltar no es perder. Respira... hoy tu paz vale más que cualquier peso. Mañana será otro día. ♡",
          soundtrack: "Melodía melancólica de piano que se vuelve esperanzadora",
          hashtags: ["#ReelsDeSuperación", "#Soltar", "#AmorPropio", "#PazMental", "#ComicsVirales"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
        parsed.scenes = [];
      }

      // Garantizar que siempre existan exactamente requestedCount escenas
      while (parsed.scenes.length < requestedCount) {
        const nextNum = parsed.scenes.length + 1;
        parsed.scenes.push({
          scene_number: nextNum,
          slide_text: nextNum === requestedCount ? "Respira. Tu paz vale más que todo." : `Paso ${nextNum}: Encuentra tu calma interior.`,
          narration_snippet: nextNum === requestedCount ? "Hoy decides abrazar tu paz y volver a empezar con amor." : "Avanza un paso a la vez, sin prisas y cuidando de ti.",
          action_description: nextNum === requestedCount ? "standing with tiny open arms facing warm golden sunset, smiling peacefully" : "sitting quietly on a grass meadow looking at a bright glowing flower"
        });
      }

      if (parsed.scenes.length > requestedCount) {
        parsed.scenes = parsed.scenes.slice(0, requestedCount);
      }

      // Sintetizar con precisión matemática el prompt SAME CHARACTER LOCKED para cada escena
      parsed.scenes.forEach((sc: any, idx: number) => {
        sc.scene_number = idx + 1;
        const actionDesc = sc.action_description || "peacefully walking through a serene natural landscape";
        const text = sc.slide_text || "Respira profundo y confía.";

        sc.image_prompt = `SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle smile, rosy pink round cheeks, sticker style, wholesome, ${actionDesc}, background is soft photorealistic warm scenic landscape with cinematic lighting, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, very legible, Text: "${text}", in solid black #000000 with warm terracotta #8B3A3A accent, high contrast against sky.`;
        
        sc.image_prompt_clean = `SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle smile, rosy pink round cheeks, sticker style, wholesome, ${actionDesc}, background is soft photorealistic warm scenic landscape with cinematic lighting, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters, no text, no typography.`;
      });

      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en generate-illustration-reflection:", error);
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 });
  }
}
