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
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres un director creativo y guionista especializado en diálogos conmovedores y tiernos entre dos personajes minimalistas estilo 'blob' (monigotes masita blanca con mejillas rosadas).",
        `Dinámica del diálogo: "${dialogueDynamic || 'Amigos incondicionales apoyándose'}".`,
        customTopic ? `Tema o dilema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Conmovedor y Tierno'}".`,
        `Semilla única: ${seed}.`,
        "",
        "REQUISITOS DEL DIÁLOGO (Alta retención para Reels / TikTok / Carrusel):",
        "1. Estructura de 3 a 4 réplicas emotivas de ida y vuelta entre 'Personaje A' y 'Personaje B'.",
        "2. El diálogo debe ser natural, profundo y tierno, tocando temas como la autoexigencia, el cansancio, el amor sincero o superar el miedo.",
        "3. 'dialogue_text': El diálogo completo formateado línea por línea.",
        "4. 'image_prompt': Prompt maestro en inglés con los DOS PERSONAJES BLANCOS interactuando tiernamente con la tipografía y el diálogo integrado arriba.",
        "   - ESTRUCTURA EXACTA:",
        "     'SAME CHARACTER LOCKED: two cute minimalist white blob characters, bald, no hair, no clothes, no human skin, smooth white bodies, thick bold black outlines, flat simple colors, no shading, 5 to 8 years old child proportions, big round heads, short chubby limbs, tiny closed eyes as simple black curved lines, small smiles, rosy pink round cheeks, sticker style, wholesome, [ACCIÓN DE INTERACCIÓN ENTRE AMBOS PERSONAJES], background is soft photorealistic [FONDO CÁLIDO FOTORREALISTA], 2D flat characters over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, soft organic uneven baseline, very legible, bold weight, dialogue lines with speaker labels in warm terracotta #8B3A3A and dialogue text in crisp black #000000, high contrast against background, serene emotional atmosphere.'",
        "5. 'image_prompt_clean': Prompt idéntico sin texto para quienes prefieren colocar los bocadillos de diálogo manualmente en Canva o CapCut.",
        "6. 'script_narration': Guion de locución con voces o narrador para TikTok/Reels.",
        "7. 'soundtrack': Música recomendada.",
        "8. 'hashtags': 5 hashtags virales.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          title: "A veces no tienes que resolver todo hoy",
          dialogue_lines: [
            { speaker: "Personaje A", text: "¿Y si nunca es suficiente lo que hago?" },
            { speaker: "Personaje B", text: "Para mí, que existas ya es suficiente." },
            { speaker: "Personaje A", text: "¿De verdad?" },
            { speaker: "Personaje B", text: "De verdad. Las flores no compiten por florecer primero; solo esperan su primavera." }
          ],
          dialogue_text: "— ¿Y si nunca es suficiente lo que hago?\n— Para mí, que existas ya es suficiente.\n— ¿De verdad?\n— De verdad. Las flores no compiten por florecer; solo esperan su primavera. ♡",
          metaphor_description: "Dos personajes blancos sentados juntos al atardecer en una banca de madera; uno cabizbajo y el otro apoyando con ternura su manita sobre su hombro con una sonrisa calmada.",
          image_prompt: "SAME CHARACTER LOCKED: two cute minimalist white blob characters, bald, no hair, no clothes, no human skin, smooth white bodies, thick bold black outlines, flat simple colors, no shading, 5 to 8 years old child proportions, big round heads, short chubby limbs, tiny closed eyes as simple black curved lines, small smiles, rosy pink round cheeks, sticker style, wholesome, sitting together on a rustic wooden bench during golden hour, left character looking down softly pensive while right character gently places a tiny hand on its shoulder with a loving warm smile, background is soft photorealistic tranquil garden at sunset with golden bokeh and wildflowers, 2D flat characters over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, soft organic uneven baseline, very legible, bold weight, dialogue reading: \"— ¿Y si nunca es suficiente?\\n— Para mí, que existas ya es suficiente. ♡\" in crisp black #000000 with warm terracotta #8B3A3A accent, serene emotional atmosphere.",
          image_prompt_clean: "SAME CHARACTER LOCKED: two cute minimalist white blob characters, bald, no hair, no clothes, no human skin, smooth white bodies, thick bold black outlines, flat simple colors, no shading, 5 to 8 years old child proportions, big round heads, short chubby limbs, tiny closed eyes as simple black curved lines, small smiles, rosy pink round cheeks, sticker style, wholesome, sitting together on a rustic wooden bench during golden hour, left character looking down softly pensive while right character gently places a tiny hand on its shoulder with a loving warm smile, background is soft photorealistic tranquil garden at sunset with golden bokeh and wildflowers, 2D flat characters over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters, no text, no typography.",
          script_narration: "A veces la persona que más dudas tiene de ti, eres tú mismo...\n\nCuando sientas que vas tarde o que nada alcanza, recuerda que no tienes que demostrarle nada a nadie para merecer paz.\n\nQuédate con quien te recuerde tu valor en tus días más nublados. ♡",
          soundtrack: "Piano acústico lofi cálido con brisa suave de fondo",
          hashtags: ["#AmorPropio", "#AmistadSincera", "#PazMental", "#ReflexionesEnPareja", "#ComicsTiernos"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Acción para generar REEL MULTIESCENA / HISTORIA DE 3-4 ESCENAS CONSECUTIVAS
    if (action === "multiscene") {
      const { sceneCount = 3 } = body;
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres un director de cortometrajes virales y animaciones conmovedoras para TikTok, Instagram Reels y YouTube Shorts.",
        `Crea una historia visual secuencial de exactamente ${sceneCount} escenas con el personaje blanco tierno minimalista (blob).`,
        `Categoría: "${category || 'Superar la Ansiedad y Encontrar Paz'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Esperanzador y Cálido'}".`,
        `Semilla: ${seed}.`,
        "",
        "REQUISITOS DE LA HISTORIA MULTIESCENA:",
        "1. Estructura narrativa de transformación emocional:",
        "   - Escena 1 (Inicio / Dolor o Pregunta): El personaje enfrentando una carga, duda o soledad.",
        "   - Escena 2 (El Detalle / Giro): Un hallazgo, un descanso, soltar algo o una pequeña luz.",
        sceneCount >= 4 ? "   - Escena 3 (Transformación): El proceso de sanar, respirar o levantarse." : "",
        `   - Escena ${sceneCount} (Cierre / Victoria Emocional): Paz mental, sonrisa serena y conclusión poderosa.`,
        "2. Para CADA ESCENA genera:",
        "   - 'scene_number': Número de escena.",
        "   - 'slide_text': Frase corta que va arriba de la imagen (máximo 8-10 palabras).",
        "   - 'narration_snippet': Frase de locución que dice la voz en off en esa escena.",
        "   - 'image_prompt': Prompt maestro con 'SAME CHARACTER LOCKED' manteniendo al personaje idéntico pero cambiando solo su acción/entorno.",
        "   - 'image_prompt_clean': Versión limpia sin texto de la escena.",
        "3. 'full_script': El guion completo continuo para leerlo en el video.",
        "4. 'soundtrack': Música cinematográfica suave.",
        "5. 'hashtags': 5 hashtags virales.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          title: "Aprender a soltar para volver a respirar",
          scenes: [
            {
              scene_number: 1,
              slide_text: "Hay días donde la mente pesa más que el cuerpo.",
              narration_snippet: "Nos enseñaron que resistir es de fuertes, pero nadie nos dijo que sostener tanto desgasta el alma.",
              image_prompt: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, sad gentle expression, rosy pink round cheeks, sticker style, wholesome, walking slowly carrying an oversized heavy grey backpack, shoulders down, background is soft photorealistic misty foggy road during cloudy dawn, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, very legible, Text: \"Hay días donde la mente pesa más que el cuerpo.\", in solid black #000000, high contrast against sky.",
              image_prompt_clean: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, sad gentle expression, rosy pink round cheeks, sticker style, wholesome, walking slowly carrying an oversized heavy grey backpack, shoulders down, background is soft photorealistic misty foggy road during cloudy dawn, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters."
            },
            {
              scene_number: 2,
              slide_text: "Hasta que entiendes que está bien soltar.",
              narration_snippet: "Y hoy decides dejar en el camino lo que no te corresponde cargar.",
              image_prompt: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle peaceful smile, rosy pink round cheeks, sticker style, wholesome, sitting down on a grassy hill having unstrapped the heavy backpack, resting hands peacefully on knees, background is soft photorealistic sun breaking through clouds over golden meadow, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, very legible, Text: \"Hasta que entiendes que está bien soltar.\", in solid black #000000 with warm terracotta #8B3A3A accent.",
              image_prompt_clean: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle peaceful smile, rosy pink round cheeks, sticker style, wholesome, sitting down on a grassy hill having unstrapped the heavy backpack, resting hands peacefully on knees, background is soft photorealistic sun breaking through clouds over golden meadow, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters."
            },
            {
              scene_number: 3,
              slide_text: "Respira. Tu paz vale más que cualquier peso.",
              narration_snippet: "No perdiste nada... hoy por fin te recuperas a ti. Descansa. ♡",
              image_prompt: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, happy radiant smile, rosy pink round cheeks, sticker style, wholesome, standing with tiny open arms facing a glorious warm golden sunset, breeze blowing softly, background is soft photorealistic stunning golden hour horizon with wildflowers and warm glow, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, very legible, Text: \"Respira. Tu paz vale más que cualquier peso. ♡\", in solid black #000000 with warm pastel peach #F5C48E accent.",
              image_prompt_clean: "SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, happy radiant smile, rosy pink round cheeks, sticker style, wholesome, standing with tiny open arms facing a glorious warm golden sunset, breeze blowing softly, background is soft photorealistic stunning golden hour horizon with wildflowers and warm glow, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters."
            }
          ],
          full_script: "Hay días donde la mente pesa más que el cuerpo.\n\nNos enseñaron que resistir siempre es de valientes, pero nadie nos dijo que sostener tanto desgasta el alma.\n\nHasta que entiendes que soltar no es perder. Respira... hoy tu paz vale más que cualquier peso. Mañana será otro día. ♡",
          soundtrack: "Melodía melancólica de piano que se vuelve esperanzadora hacia el final",
          hashtags: ["#ReelsDeSuperación", "#Soltar", "#AmorPropio", "#PazMental", "#ComicsVirales"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en generate-illustration-reflection:", error);
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 });
  }
}
