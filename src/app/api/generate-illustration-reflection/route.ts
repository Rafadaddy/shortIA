import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

// Banco diverso de arquetipos de metáforas visuales, expresiones y composiciones
const METAPHOR_ARCHETYPES = [
  {
    theme: "Desamor e indiferencia en un parque",
    characters: "left white blob walking away carrying a small brown backpack with head down, sad downturned mouth, expressive solid black oval eyes looking at ground with soft arched sad eyebrows floating above; right white blob sitting backward on the bench absorbed in a glowing smartphone with aloof indifferent expression",
    setting: "wooden park bench on a warm autumn street at golden hour sunset, fallen maple leaves on cobblestone ground, vintage glowing lamppost, soft blurred trees in background, cinematic shallow depth of field",
    camera: "eye-level medium wide shot, wide negative space sky at upper third"
  },
  {
    theme: "Abrazo sanador a una roca (amor propio y soltar)",
    characters: "cute minimalist white blob sitting cross-legged on the soft grass, tenderly embracing a round grey garden stone, open gentle black oval eyes with soft friendly curved eyebrows and a sweet serene smile, rosy pink blushing cheeks",
    setting: "golden meadow at late afternoon, warm backlight glowing on the characters outlines, wildflowers, bokeh sunlight filtering through trees",
    camera: "centered low angle shot with clean spacious pastel sky in top third"
  },
  {
    theme: "La silla vacía y la taza caliente (paz en la soledad)",
    characters: "cute white blob curled up comfortably in a cozy armchair holding a pastel mug with both hands, closed eyes curved in peaceful relief, small gentle smile, beside it is an empty chair with a faint dashed outline of someone who left",
    setting: "warm hygge living room, sunset light streaming through window, wooden floor, soft blanket, floating dust motes",
    camera: "cozy indoor shot, calm uncluttered wall space at upper third"
  },
  {
    theme: "Caminar ligero hacia el sol (cerrar ciclos)",
    characters: "cute white blob with a very tiny light satchel walking briskly forward with determination, open wide curious black oval eyes, confident slight smile, leaving behind an oversized heavy grey backpack lying open on the trail",
    setting: "scenic mountain trail at sunrise, misty morning light, golden sun breaking through clouds",
    camera: "wide cinematic shot, expansive clean morning sky in upper half"
  },
  {
    theme: "Soltar el hilo que quema las manos",
    characters: "white blob standing on a grassy hill gently opening both small hands, letting go of a bright red floating balloon drifting into the vast sky, expressive open eyes looking up with relief and quiet wonder, soft curved eyebrows",
    setting: "windy grassy hilltop under a dramatic warm sunset sky, gentle breeze swaying grass",
    camera: "atmospheric vertical composition, clean gradient sky above"
  },
  {
    theme: "Regar el propio jardín interior (paciencia con uno mismo)",
    characters: "white blob kneeling lovingly beside a tiny terracotta pot holding a little green watering can, smiling affectionately with rosy cheeks, watching a glowing green sprout bloom",
    setting: "quaint sunlit greenhouse or balcony garden with hanging plants, warm golden sunlight streaming from the side",
    camera: "eye-level tender shot, soft negative space at upper third"
  },
  {
    theme: "Cosiéndose la herida dorada (Kintsugi emocional)",
    characters: "white blob sitting peacefully cross-legged, holding a small golden needle and glowing thread, gently mending a soft hairline crack on its doughy chest with a calm courageous smile, tiny closed peaceful eyes",
    setting: "warm serene room lit by fairy lights and candlelight, cozy minimalist hygge vibe",
    camera: "intimate medium shot, clean soft bokeh background above"
  },
  {
    theme: "El paraguas amarillo bajo la tormenta pasajera",
    characters: "cute white blob standing cheerfully puddles holding a vibrant yellow umbrella, open solid black oval eyes looking playfully sideways, rosy blushing cheeks, smiling while rain falls around it but not on its head",
    setting: "cozy city street after rain, wet pavement reflecting warm streetlights, gentle mist, golden hour dusk",
    camera: "vertical street view, soft overcast sky at top third"
  },
  {
    theme: "Dos amigos en una fogata bajo las estrellas",
    characters: "two cute white blob characters sitting on a wooden log beside a tiny crackling campfire, wrapped in a chunky knit blanket, toast marshmallows, one resting head on the other's shoulder in complete safety and trust",
    setting: "forest clearing at twilight, warm campfire glow, fairy-tale twilight sky",
    camera: "warm atmospheric wide shot, spacious dusk sky above"
  },
  {
    theme: "Mirarse al espejo y sonreírse con perdón",
    characters: "white blob standing in front of an oval mirror on the grass, touching its own cheek, while its reflection smiles back warmly with open bright eyes, surrounded by tiny sprouting daisies",
    setting: "serene peaceful garden at sunset, soft ethereal warm light",
    camera: "delicate centered composition, empty pastel sky at top"
  },
  {
    theme: "La semilla y el árbol del interés compuesto (ahorro e inversión)",
    characters: "cute minimalist white blob kneeling tenderly on soft soil, holding a tiny pastel watering can, watering a small glowing golden coin sprouting from the ground with two little green leaves, smiling with proud rosy blushing cheeks and gentle open black oval eyes",
    setting: "peaceful sunlit countryside with an ethereal giant golden glowing oak tree in the background providing vast comforting shade, warm amber sunlight, magical dust particles",
    camera: "eye-level heartwarming shot, clear spacious cream-colored sky in upper third"
  },
  {
    theme: "El paraguas de la tranquilidad (fondo de emergencia y paz mental)",
    characters: "cute chubby white blob peacefully sitting on a sturdy wooden stool sipping hot tea from a steaming pastel mug with curved closed eyes of total relief and content smile, sheltered completely under a large glowing golden umbrella",
    setting: "dramatic dark rainy day outside with misty grey clouds and lightning in the distance, but the character is completely dry and bathed in warm amber light under the umbrella",
    camera: "centered eye-level vertical shot, ample negative space at upper third"
  },
  {
    theme: "El reloj de arena y el tiempo de vida (tiempo vs dinero)",
    characters: "cute white blob holding a large elegant hourglass where falling golden coins transform into fluttering glowing butterflies at the bottom, expressive open black oval eyes looking with deep philosophical wonder and serene realization",
    setting: "tranquil lakeside dock at golden hour sunset, soft ripples in the water, gentle mountain silhouette in background",
    camera: "poetic medium vertical shot, clean gradient sunset sky above"
  },
  {
    theme: "Rompiendo las cadenas de las deudas (libertad financiera)",
    characters: "white blob standing tall with joyful open arms, small smile and happy curved eyes, celebrating as heavy dark metal chains attached to an oversized credit card shatter into glowing floating sparkles",
    setting: "bright open green meadow under a fresh radiant morning sun breaking through clouds, fresh breeze",
    camera: "triumphant dynamic shot, expansive airy morning sky in upper half"
  },
  {
    theme: "El saco con goteras (gastos hormiga y consciencia)",
    characters: "thoughtful white blob with curious expressive open dot eyes, examining with a golden needle and thread a small pinhole on a vintage burlap sack, while tiny glittering coins leave a subtle trail on the path",
    setting: "charming winding cobblestone village lane in soft warm morning light, quaint stone walls and climbing ivy",
    camera: "storytelling medium wide shot, uncluttered upper third"
  },
  {
    theme: "Ser rico en silencio vs aparentar (el espejo del ego)",
    characters: "on the left, a cute minimalist white blob in simple clean posture looking forward in complete peace with light backpack; on the right, a heavy ornate golden mirror showing a burdensome cape made of glowing debt chains which the blob calmly steps away from",
    setting: "minimalist serene marble terrace overlooking a calm ocean at dawn, clean pastel sky",
    camera: "side-by-side comparative shot, wide clear negative space above"
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, customTopic, tone, watermarkText, aspect = "9:16" } = body;

    // Acción para generar ideas y temas variados
    if (action === "ideas") {
      const prompt = [
        "Eres un creador viral de cómics y reflexiones ilustradas estilo 'Chispas de Inspiración', 'The Psychology of Money' y 'Wholesome Webcomics'.",
        "Tu objetivo es proponer 4 conceptos de reflexiones ilustradas con un personaje tierno minimalista blanco (estilo masita / blobby con mejillas rosadas y ojos expresivos).",
        `Categoría solicitada: "${category || 'Superación Personal y Amor Propio'}".`,
        customTopic ? `Tema específico del usuario: "${customTopic}".` : "",
        `Tono: "${tone || 'Conmovedor y Sabio'}".`,
        "",
        "Si la categoría es de Finanzas Personales (Tiempo vs Dinero, Ahorro e Interés Compuesto, Paz Mental, El Ego y Apariencias, Deudas por Impulso):",
        "- Las frases deben ser reflexiones psicológicas demoledoras sobre el dinero y la libertad (ej: 'No pagas con dinero, pagas con horas de tu vida', 'Ahorrar es comprar la sombra del futuro', 'Gastar para aparentar es el impuesto más caro a tu ego').",
        "- Las metáforas visuales deben usar objetos poéticos: moneditas doradas que brotan como árboles, relojes de arena donde las monedas son mariposas, paraguas dorados que protegen de la lluvia de cuentas, etc.",
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
              "quote": "No pagas con dinero, pagas con horas de tu vida.",
              "highlight": "horas de tu vida",
              "visual_metaphor": "El monigote blanco abrazando un reloj de arena donde las monedas caen y se convierten en mariposas de tiempo libre."
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
        "Eres un director creativo de micro-historias virales en video (TikTok, Reels, Shorts) y animación con IA (Runway Gen-3, Kling, Luma Dream Machine).",
        `Propón 4 conceptos diferentes de mini-historias para un Reel de ${requestedCount} escenas consecutivas con el personaje tierno blanco (blob) y posibles personajes secundarios entrañables (ej: una abuelita blob, un pajarito herido, una pequeña mascota, un sabio anciano, o un amigo blob).`,
        `Categoría: "${category || 'Superar el Cansancio y Encontrar Paz'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Esperanzador y Cálido'}".`,
        "",
        "Cada idea debe incluir:",
        "1. 'title': Un título o gancho de historia muy llamativo y emotivo que atrape en los primeros 2 segundos.",
        "2. 'story_premise': De qué trata la historia en 2 líneas (el conflicto inicial, el encuentro con personajes secundarios o revelación, y el alivio final).",
        "3. 'arc_summary': Breve descripción de cómo evoluciona la historia a lo largo de las escenas.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          ideas: [
            {
              title: "El día que un pequeño pajarito me enseñó a volar",
              story_premise: "El personaje blob se siente demasiado pesado para avanzar, hasta que rescata a un pajarito que le recuerda que las alas se abren con calma.",
              arc_summary: "Inicia sentado desanimado -> encuentra al pajarito -> le da agua y cariño -> ambos miran al horizonte listos para seguir."
            },
            {
              title: "Aprender a soltar lo que pesa más que tú",
              story_premise: "El personaje carga cosas del pasado hasta que un sabio anciano le enseña a vaciar su mochila en la orilla del lago.",
              arc_summary: "Inicia agotado -> encuentra al anciano sabio -> vacía las piedras al agua -> respira ligero al atardecer."
            }
          ]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.9 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Acción para proponer ideas de DIÁLOGOS / CHATS CON GANCHO (antes de generar las viñetas)
    if (action === "dialogue_ideas") {
      const { dialogueDynamic } = body;
      const prompt = [
        "Eres un guionista viral de cómics y micro-diálogos emocionales para redes sociales (estilo webcomics de parejas, amigos incondicionales y reflexiones profundas).",
        "Propón 4 conceptos de conversaciones o diálogos con gancho magnético entre dos personajes tiernos minimalistas blancos (blobs).",
        `Dinámica: "${dialogueDynamic || 'Amigos incondicionales apoyándose'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Conmovedor y Tierno'}".`,
        "",
        "Cada idea debe incluir:",
        "1. 'title': Título o gancho de la conversación sumamente atractivo (ej: 'Lo que nunca nos atrevemos a decir en voz alta', 'Cuando el silencio dice más que mil palabras').",
        "2. 'hook_question': La primera pregunta o detonante que abre la conversación y genera curiosidad inmediata.",
        "3. 'dialogue_premise': De qué trata el intercambio y qué dilema o sentimiento resuelve.",
        "4. 'emotional_punchline': La frase de cierre conmovedora o remate emocional del diálogo.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          ideas: [
            {
              title: "El refugio de no tener que fingir",
              hook_question: "¿Por qué siempre sonríes cuando en realidad estás cansado?",
              dialogue_premise: "Uno de los personajes nota la tristeza oculta del otro y le ofrece un espacio seguro donde no necesita ser fuerte.",
              emotional_punchline: "Conmigo no tienes que ser valiente. Puedes simplemente descansar. ♡"
            },
            {
              title: "Promesas que se dicen sin hablar",
              hook_question: "¿Podemos simplemente quedarnos aquí y no decir nada?",
              dialogue_premise: "Conversación íntima al atardecer donde descubren que la mejor compañía es quien hace del silencio un hogar.",
              emotional_punchline: "Elegir quedarme a tu lado es la decisión más fácil del mundo."
            }
          ]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.88 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Acción para generar la pieza completa: Frase + Metáfora + Prompt Profesional + Guion de Video
    if (action === "create") {
      const chosenArchetype = METAPHOR_ARCHETYPES[Math.floor(Math.random() * METAPHOR_ARCHETYPES.length)];
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        "Eres el director de arte y guionista principal de páginas virales como 'Chispas de Inspiración', 'Cosas Bonitas' y webcomics minimalistas de reflexión profunda.",
        "PERSONAJES: Personajes blancos de masa/blob extremadamente tiernos, con contorno negro limpio y grueso, sin pelo, sin ropa, proporciones chibi de 5 a 8 años.",
        "IMPORTANTE SOBRE LOS OJOS Y EXPRESIONES: Los personajes NO siempre tienen los ojos cerrados. Varían según la emoción de la escena:",
        "- En momentos de tristeza/soledad/duda: ojos abiertos expresivos formados por dos óvalos negros verticales sólidos (solid black vertical oval dots), con cejitas curvas flotantes arriba que transmiten melancolía o vulnerabilidad, y boca pequeña hacia abajo.",
        "- En momentos de curiosidad o asombro: ojos abiertos redondos con cejas arqueadas hacia arriba.",
        "- En momentos de frialdad/distancia del otro personaje: ojos de hendidura o mirada fija en el teléfono con ceja plana indiferente.",
        "- En momentos de paz profunda, alivio o meditación: ojos cerrados en líneas curvas hacia arriba sonrientes.",
        "",
        `Categoría: "${category || 'Cerrar Ciclos y Soltar'}".`,
        customTopic ? `Tema o idea base solicitada por el usuario: "${customTopic}".` : "",
        `Arquetipo visual de inspiración (para garantizar máxima originalidad y variedad): "${chosenArchetype.theme}". Personajes: "${chosenArchetype.characters}". Escenario: "${chosenArchetype.setting}".`,
        `Semilla única: ${seed}.`,
        "",
        "ESTRUCTURA EXACTA DE LA FRASE Y TIPOGRAFÍA (ESTILO CHISPAS DE INSPIRACIÓN):",
        "La frase debe distribuirse armoniosamente en 3 o 4 líneas centradas en el tercio superior:",
        "- Línea 1 (Contexto/Setup): Letras en serif elegante y sobria, color negro #000000 (Ej: 'No mendigues')",
        "- Línea 2 (Palabra Clave Emocional 1): Tipografía caligráfica cursiva gruesa (brush script), color terracota cálido #8B3A3A o caramelo tostado #A04000 (Ej: 'presencia')",
        "- Línea 3 (Conector/Contraste): Letras en serif sobria, color negro #000000 (Ej: 'donde sobra')",
        "- Línea 4 (Palabra Clave Emocional 2): Tipografía cursiva gruesa negra #000000 con un trazo orgánico de pincelada o subrayado abajo (Ej: 'indiferencia.')",
        "",
        "CAMPOS REQUERIDOS EN EL JSON:",
        "1. 'quote': La frase completa (ej: 'No mendigues presencia donde sobra indiferencia.').",
        "2. 'quote_lines': Array de 3 a 4 líneas con la estructura exacta: [{ 'text': 'No mendigues', 'style': 'serif', 'color': 'black' }, { 'text': 'presencia', 'style': 'brush_script', 'color': 'terracotta' }, { 'text': 'donde sobra', 'style': 'serif', 'color': 'black' }, { 'text': 'indiferencia.', 'style': 'brush_script_underlined', 'color': 'black' }]",
        "3. 'highlight_word': La palabra emocional principal (ej: 'presencia').",
        "4. 'eye_expression': Descripción en español del tipo de ojos y expresión que tienen los personajes en esta escena (ej: 'Ojos abiertos en óvalos negros con cejas tristes caídas para el que se marcha, y mirada fija indiferente para el que mira el móvil').",
        "5. 'metaphor_description': Explicación en español de la escena, los personajes y el mensaje poético.",
        "6. 'image_prompt': PROMPT MAESTRO COMPLETO CON TEXTO INTEGRADO (Ideogram / Midjourney / DALL-E):",
        "   Debe incluir la composición de los personajes (poses, ojos abiertos o cerrados según la emoción, ropa si aplica o accesorios como mochila/taza), fondo fotorrealista cálido, y la descripción exacta de la tipografía bicolor en el tercio superior despejado.",
        "7. 'image_prompt_clean': PROMPT LIMPIO (SIN TEXTO NI TIPOGRAFÍA) con espacio libre en el tercio superior.",
        "8. 'script_narration': Guion de locución de 20 a 30 segundos (Gancho emotivo -> Desarrollo con voz cálida -> Cierre reflexivo).",
        "9. 'soundtrack': Música recomendada.",
        "10. 'hashtags': 5 hashtags virales.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          quote: "No mendigues presencia donde sobra indiferencia.",
          quote_lines: [
            { text: "No mendigues", style: "serif", color: "black" },
            { text: "presencia", style: "brush_script", color: "terracotta" },
            { text: "donde sobra", style: "serif", color: "black" },
            { text: "indiferencia.", style: "brush_script_underlined", color: "black" }
          ],
          highlight_word: "presencia",
          eye_expression: "Ojos abiertos en óvalos negros verticales con cejitas curvas tristes flotando arriba para el personaje que camina; y mirada distante e indiferente hacia la pantalla para el otro personaje.",
          metaphor_description: "En una banca de parque de madera bajo la luz dorada del atardecer otoñal, un personaje blanco con una pequeña mochila camina cabizbajo alejándose con tristeza pero dignidad, mientras en la banca otro personaje le da la espalda ensimismado en su teléfono celular.",
          image_prompt: "SAME CHARACTER LOCKED, SAME STYLE LOCKED: cute minimalist white dough blob characters, thick clean black outlines, flat simple colors. On the left, a white blob character walks away carrying a brown backpack, head slightly tilted down, expressive open solid black oval eyes looking at ground, soft arched sad curved eyebrows floating above, tiny downturned mouth, rosy pink cheeks, melancholic vulnerable expression. On the right, another white blob sits backward on a weathered wooden park bench completely absorbed in a glowing smartphone, indifferent aloof posture. Setting: beautiful autumn park path at golden hour sunset, fallen orange maple leaves scattered on cobblestone ground, glowing vintage streetlamp, soft warm bokeh trees in background, cinematic depth of field, 2D flat comic characters over photorealistic warm background. Vertical 9:16 composition with wide clear negative space sky in upper third. Typography style LOCKED: centered at upper third, elegant multi-line composition: Line 1 'No mendigues' in clean elegant serif font black #000000, Line 2 'presencia' in prominent thick casual brush script calligraphy in warm terracotta reddish-brown #8B3A3A, Line 3 'donde sobra' in clean serif font black #000000, Line 4 'indiferencia.' in bold brush script with a subtle organic brush underline stroke underneath, perfectly legible, high contrast against sky, emotional storytelling, masterpiece, 8k.",
          image_prompt_clean: "SAME CHARACTER LOCKED, SAME STYLE LOCKED: cute minimalist white dough blob characters, thick clean black outlines, flat simple colors. On the left, a white blob character walks away carrying a brown backpack, head slightly tilted down, expressive open solid black oval eyes looking at ground, soft arched sad curved eyebrows floating above, tiny downturned mouth, rosy pink cheeks, melancholic vulnerable expression. On the right, another white blob sits backward on a weathered wooden park bench completely absorbed in a glowing smartphone, indifferent aloof posture. Setting: beautiful autumn park path at golden hour sunset, fallen orange maple leaves scattered on cobblestone ground, glowing vintage streetlamp, soft warm bokeh trees in background, cinematic depth of field, 2D flat comic characters over photorealistic warm background. Vertical 9:16 composition, clean empty sky in upper third, negative space for text, no letters, no typography, no words, no text.",
          script_narration: "¿Por qué insistimos en quedarnos donde ya no nos miran?\n\nA veces, el mayor acto de amor propio no es pedir que te elijan... es darte la media vuelta, respirar hondo y entender que tu valor no depende de la atención que alguien más no quiso darte.\n\nNo mendigues presencia donde sobra indiferencia. Tu paz está al final de ese camino. ♡",
          soundtrack: "Piano acústico melancólico con sutil violonchelo que pasa a una melodía de alivio y superación",
          hashtags: ["#ChispasDeInspiracion", "#AmorPropio", "#Soltar", "#CerrarCiclos", "#PazMental"]
        }, null, 2)
      ].filter(Boolean).join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.88 });
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
        "Eres un director de cortometrajes virales y animaciones conmovedoras para TikTok, Instagram Reels, YouTube Shorts y herramientas de animación por IA (Runway Gen-3 Alpha, Luma Dream Machine, Kling AI, Pika).",
        `Crea el contenido narrativo para una mini-historia visual secuencial de EXACTAMENTE ${requestedCount} escenas consecutivas con el personaje blanco tierno minimalista (blob). En la historia pueden interactuar personajes secundarios entrañables (ejemplo: un pajarito o mariposa que lo acompaña, un gatito, un sabio anciano o abuelita blob, una plantita viviente, etc.) para darle dinamismo visual y riqueza narrativa.`,
        `Categoría: "${category || 'Superar la Ansiedad y Encontrar Paz'}".`,
        customTopic ? `Tema específico: "${customTopic}".` : "",
        `Tono: "${tone || 'Esperanzador y Cálido'}".`,
        `Semilla: ${seed}.`,
        "",
        "REQUISITOS DE LA HISTORIA MULTIESCENA Y VIDEO CON MOVIMIENTO:",
        `1. El array 'scenes' DEBE contener EXACTAMENTE ${requestedCount} objetos ordenados cronológicamente del 1 al ${requestedCount}:`,
        "   - 'scene_number': Número entero de escena (1, 2, ...).",
        "   - 'slide_text': Frase corta que va en la imagen (máximo 8 palabras).",
        "   - 'narration_snippet': Frase que dice la voz en off en esta escena (10-15 palabras).",
        "   - 'action_description': Descripción detallada en inglés de qué hace el personaje principal, si interactúa con algún personaje secundario (ej: tiny injured bird, friendly puppy, wise elderly blob mentor) y el escenario (ej: 'blob gently cupping hands to feed a tiny wounded sparrow under warm glowing tree').",
        "   - 'video_motion_prompt': Prompt profesional de movimiento y cámara en inglés para herramientas Image-to-Video (Runway Gen-3 / Kling / Luma). Debe especificar tipo de movimiento de cámara, respiración, parpadeo o acción suave del personaje, partículas o luz ambiental, y fps (ej: 'Cinematic slow push-in shot, the white blob character gently blinks and looks at the tiny sparrow hopping on its palm, golden particles floating in warm evening light, smooth fluid 24fps motion, photorealistic bokeh background').",
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
              action_description: "walking slowly carrying an oversized heavy grey backpack, shoulders down, misty road at dawn",
              video_motion_prompt: "Cinematic slow steady tracking shot from the side, the white blob walks sluggishly with drooping shoulders under the heavy backpack, subtle fog drifting, soft ambient morning light, ultra smooth animation, 4k"
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
          action_description: nextNum === requestedCount ? "standing with tiny open arms facing warm golden sunset, smiling peacefully with a cute tiny bird resting on shoulder" : "sitting quietly on a grass meadow looking at a bright glowing flower",
          video_motion_prompt: "Smooth slow cinematic zoom in, gentle breeze moving surrounding grass, the cute blob smiles warmly and blinks slowly, golden hour warm lighting, cinematic 24fps"
        });
      }

      if (parsed.scenes.length > requestedCount) {
        parsed.scenes = parsed.scenes.slice(0, requestedCount);
      }

      // Sintetizar con precisión matemática los prompts para cada escena
      parsed.scenes.forEach((sc: any, idx: number) => {
        sc.scene_number = idx + 1;
        const actionDesc = sc.action_description || "peacefully walking through a serene natural landscape";
        const text = sc.slide_text || "Respira profundo y confía.";

        // Prompt de imagen con texto
        sc.image_prompt = `SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle smile, rosy pink round cheeks, sticker style, wholesome, ${actionDesc}, background is soft photorealistic warm scenic landscape with cinematic lighting, 2D flat character over photorealistic background, vertical 9:16, Typography style LOCKED for all images: centered at upper third, handwritten casual bold rounded marker font, very legible, Text: "${text}", in solid black #000000 with warm terracotta #8B3A3A accent, high contrast against sky.`;
        
        // Prompt de imagen limpio sin texto (ideal para video y animación)
        sc.image_prompt_clean = `SAME CHARACTER LOCKED: cute minimalist white blob character, bald, no hair, no clothes, no human skin, white body, thick bold black outline, flat simple colors, no shading, 5 to 8 years old child proportions, big round head, short chubby limbs, tiny closed eyes as simple black curved lines, gentle smile, rosy pink round cheeks, sticker style, wholesome, ${actionDesc}, background is soft photorealistic warm scenic landscape with cinematic lighting, 2D flat character over photorealistic background, vertical 9:16, empty space top third for text, clean background, no letters, no text, no typography.`;

        // Prompt de video con movimiento (I2V)
        if (!sc.video_motion_prompt) {
          sc.video_motion_prompt = `Cinematic slow push-in shot, the character gently animates with subtle body breathing and a warm peaceful blink, ${actionDesc}, soft ambient particles floating in golden light, smooth realistic motion, 24fps cinematic animation.`;
        }
      });

      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en generate-illustration-reflection:", error);
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 });
  }
}
