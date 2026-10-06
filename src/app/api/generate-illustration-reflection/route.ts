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
        "4. 'image_prompt': PROMPT MAESTRO EN INGLÉS usando EXACTAMENTE la estructura y especificaciones solicitadas:",
        "   - ESTRUCTURA EXACTA OBLIGATORIA DEL PROMPT:",
        "     'A cute minimalist character, same character design, a small child 5 to 8 years old proportions, big round head, short chubby body, short limbs, white skin, thick bold black outline, flat simple colors, no shading, no watercolor, no gouache, sticker style, tiny closed eyes as simple curved black lines, small smile, rosy pink round blush cheeks on cheeks, simple minimal design, wholesome, [ACCIÓN EXACTA Y OBJETO METAFÓRICO], background is soft photorealistic [FONDO FOTORREALISTA CÁLIDO], 2D flat character composited over photorealistic background, vertical 9:16 composition, plenty of clean empty negative space in the upper third for quote text overlay, high aesthetic, serene emotional atmosphere.'",
        "   - En [ACCIÓN EXACTA Y OBJETO METAFÓRICO], inserta en inglés la interacción específica de la reflexión (ej. 'peacefully sitting on a cozy sofa holding a pink mug next to a dashed silhouette', 'hugging a smiling boulder in the middle of a dirt road', 'walking forward determined while another character gently pulls back', 'letting go of a red balloon into the sky', etc.).",
        "   - En [FONDO FOTORREALISTA CÁLIDO], describe el fondo cinematográfico y cálido (ej. 'warm cozy living room with soft natural lighting', 'golden hour sunset meadow with wildflowers and glowing path', 'scenic mountain trail during warm sunrise', etc.).",
        "   - PROHIBIDO texto dentro de la imagen, PROHIBIDO acuarelas o sombreados en el personaje. El personaje debe ser plano 2D blanco con contorno negro marcado (sticker style) sobre fondo suave.",
        "5. 'script_narration': Un guion de 20 a 30 segundos para video corto (TikTok / Reels / Shorts):",
        "   - Gancho emotivo",
        "   - Desarrollo con voz suave y reflexiva",
        "   - Cierre contundente invitando a guardar o reflexionar.",
        "6. 'soundtrack': Música recomendada (ej. 'Piano acústico lofi suave', 'Guitarra acústica melancólica').",
        "7. 'hashtags': 5 hashtags virales relacionados con amor propio, reflexiones y desarrollo personal.",
        "",
        "Responde SOLO con JSON válido:",
        JSON.stringify({
          quote: "Cuando la ausencia se vuelve alivio, el ciclo está cerrado.",
          highlight_word: "alivio",
          metaphor_description: "El personaje blanco sentado en un cómodo sofá tomando una taza caliente con una expresión de paz, mientras al lado en el cojín hay una silueta punteada vacía de la persona que se fue.",
          image_prompt: "A cute minimalist character, same character design, a small child 5 to 8 years old proportions, big round head, short chubby body, short limbs, white skin, thick bold black outline, flat simple colors, no shading, no watercolor, no gouache, sticker style, tiny closed eyes as simple curved black lines, small smile, rosy pink round blush cheeks on cheeks, simple minimal design, wholesome, sitting on a cozy sofa holding a pink mug with two hands next to an empty cushion with a subtle dashed outline silhouette, background is soft photorealistic warm cozy living room with indoor plants and soft natural ambient sunlight, 2D flat character composited over photorealistic background, vertical 9:16 composition, plenty of clean empty negative space in the upper third for quote text overlay, high aesthetic, serene emotional atmosphere.",
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

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en generate-illustration-reflection:", error);
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 });
  }
}
