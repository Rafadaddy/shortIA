export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, tone, visualStyle, idea, current_script, instruction } = requestBody;

    // BLOQUE DE PERSONAJE INMUTABLE V4
    const CHARACTER_BLOCK = `[CHARACTER] RAFA DADDY, anthropomorphic tiger financial mentor, NOT Tony the Tiger, not an exaggerated cartoon, soft realistic orange fur with well-defined black stripes, white muzzle and chest fur, warm amber eyes, round gold-rimmed glasses, fitted navy blue suit with subtle pinstripe, crisp white dress shirt, light sky blue bow tie, warm confident approachable expression, friendly mentor vibe, Pixar x photorealistic blend, consistent character design`;

    const NEGATIVE_PROMPT = `NEGATIVE: Tony the Tiger, cereal mascot, red neckerchief, cartoonish, exaggerated features, different outfit, missing glasses, missing bow tie, extra limbs, extra fingers, deformed paws, human hands, text, letters, watermark, logo, blurry`;

    let prompt = "";

    if (mode === "ideas") {
      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V4. Generador experto de ideas para finanzas personales y TikTok/Reels virales.
Genera 5 ideas de alto impacto y gancho viral para videos sobre el tema: "${topic || 'por qué no te alcanza la quincena aunque ganas bien'}".

AUDIENCIA: Personas de 20 a 45 años con ingresos que sienten que el dinero se les escapa de las manos.
TONO ELEGIDO: "${tone || 'Motivacional'}"

REGLAS DE IDEAS:
- Gancho en los primeros 3 segundos directo al dolor financiero real con fórmulas virales (pregunta incómoda, cálculo en vivo, contradicción, error invisible).
- Cero clichés de autoayuda genérica; habla de sistemas concretos y cotidianos.

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido en este formato:
{
  "ideas": [
    {
      "title": "TÍTULO CORTO Y POTENTE (3-5 palabras)",
      "hook": "GANCHO DE 3 SEGUNDOS (Frase demoledora que frena el scroll)",
      "pain_point": "El error financiero invisible que se aborda",
      "why_it_works": "Por qué conecta psicológicamente con la audiencia"
    }
  ]
}`;
    } else if (mode === "script_only") {
      const selectedStyle = tone || "Motivacional";
      const userTopic = topic || idea || "por qué no te alcanza la quincena aunque ganas bien";

      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V4. Redactor experto de guiones virales para TikTok y Reels de finanzas personales.
Genera el GUION DE AUDIO estructurado y combinación de variedad para:
TEMA / IDEA ELEGIDA: "${userTopic}"
ESTILO / TONO: "${selectedStyle}"

REGLAS OBLIGATORIAS:
- Duración total ≈38s hablados.
- GANCHO (0-3s): directo al problema, SIN decir tu nombre al inicio.
- PROBLEMA (3-18s): El Tigre explica dónde se va el dinero con 1-2 ejemplos cotidianos MX (Uber, Oxxo, tandas, MSI, café diario).
- SOLUCIÓN (18-38s): sistema concreto con números específicos y una frase memorable.
- CTA OBLIGATORIO SOLO AL FINAL: "Sígueme para más del Tigre Financiero - Rafa Daddy"
- OVERLAY: 5 textos cortos de máximo 5 palabras estilo viral (pregunta, número, orden, contraste, resultado).
- PROHIBIDO antes del CTA: "¿Sabías que...?", "Si eres de los que...", "Hola a todos", "En este video", "Yo soy Rafa Daddy".

Responde ÚNICAMENTE con un JSON válido:
{
  "title": "${userTopic}",
  "combination": {
    "format": "Formato de serie elegido (ej. El Tigre Mentor)",
    "structure": "Estructura elegida (ej. Problema-Agitación-Solución)",
    "hook_formula": "Fórmula de gancho usada",
    "palette": "Paleta visual recomendada (ej. Navy & Gold / Teal & Orange)"
  },
  "script_audio": {
    "hook_3s": "Gancho demoledor directo al problema...",
    "problem_15s": "Explicación del problema con ejemplos cotidianos...",
    "solution_20s": "Sistema concreto con números y frase memorable...",
    "cta_final": "Sígueme para más del Tigre Financiero - Rafa Daddy",
    "full_speech": "Texto completo unificado de corrido listo para locución...",
    "overlays": [
      "Texto 1 Pregunta",
      "Texto 2 Número",
      "Texto 3 Orden",
      "Texto 4 Contraste",
      "Texto 5 Resultado"
    ]
  }
}`;
    } else if (mode === "prompts_images") {
      const selectedStyle = tone || "Motivacional";
      const userTopic = topic || idea || "Finanzas Personales";
      const scriptText = current_script || "";

      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V4. Director visual de IA.
Crea 5 PROMPTS DE IMAGEN en formato VERTICAL 9:16 para TikTok/Reels basados en este guion:
TEMA: "${userTopic}"
GUION: "${scriptText}"

Prioridad #1: el personaje se ve IDÉNTICO en las 5 imágenes.
Prioridad #2: 5 escenas, emociones, ángulos e iluminación distintos (Arco: SHOCK → PROBLEMA → EXPLICACIÓN → SOLUCIÓN → VICTORIA).

Copia EXACTO este bloque al inicio de CADA prompt:
"${CHARACTER_BLOCK}"

Y al final de cada prompt agrega:
"${NEGATIVE_PROMPT}"

Orden exacto de cada prompt:
[CHARACTER block] + ", " + [emoción] + ", " + [acción/pose] + ", " + [metáfora visual ligada al tema con utilería] + ", " + [escenario detallado] + ", " + [ángulo] + ", " + [iluminación] + ", vertical portrait format 9:16 for TikTok, photorealistic, Pixar 3D style, cinematic lighting, ultra detailed, 8k --ar 9:16 --style raw\\n\\n${NEGATIVE_PROMPT}"

Responde ÚNICAMENTE con un JSON válido:
{
  "image_prompts": [
    { "step": "SHOCK", "version": "V1 - Shock Inicial", "metaphor": "Metáfora...", "prompt": "..." },
    { "step": "PROBLEMA", "version": "V2 - Problema / Fuga", "metaphor": "...", "prompt": "..." },
    { "step": "EXPLICACIÓN", "version": "V3 - Diagnóstico / Explicación", "metaphor": "...", "prompt": "..." },
    { "step": "SOLUCIÓN", "version": "V4 - Sistema / Solución", "metaphor": "...", "prompt": "..." },
    { "step": "VICTORIA", "version": "V5 - Éxito / Victoria", "metaphor": "...", "prompt": "..." }
  ]
}`;
    } else if (mode === "prompts_videos") {
      const selectedStyle = tone || "Motivacional";
      const userTopic = topic || idea || "Finanzas Personales";

      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V4. Director de animación y video para IA (Kling / Runway / Luma / Pika).
Crea 5 PROMPTS DE VIDEO VERTICAL 9:16 pensados para IMAGE-TO-VIDEO basados en las 5 escenas del Tigre Financiero sobre: "${userTopic}".

Copia EXACTO este bloque al inicio de CADA prompt:
"${CHARACTER_BLOCK}"

Estructura de cada prompt:
[CHARACTER block] + ", same character as reference image, " + [acción principal clara] + ", " + [movimiento del personaje] + ", " + [movimiento de cámara] + ", " + [partículas/ambiente] + ", 6 seconds, vertical 9:16, photorealistic, consistent character, smooth motion, no morphing, no outfit change"

Responde ÚNICAMENTE con un JSON válido:
{
  "video_prompts": [
    { "step": "SHOCK", "version": "V1 - Shock Inicial", "camera": "Slow push-in", "motion": "Blinking and checking pockets", "particles": "Warm dust motes", "prompt": "..." },
    { "step": "PROBLEMA", "version": "V2 - Problema", "camera": "...", "motion": "...", "particles": "...", "prompt": "..." },
    { "step": "EXPLICACIÓN", "version": "V3 - Explicación", "camera": "...", "motion": "...", "particles": "...", "prompt": "..." },
    { "step": "SOLUCIÓN", "version": "V4 - Solución", "camera": "...", "motion": "...", "particles": "...", "prompt": "..." },
    { "step": "VICTORIA", "version": "V5 - Victoria", "camera": "...", "motion": "...", "particles": "...", "prompt": "..." }
  ]
}`;
    } else if (mode === "generate_full_v3" || mode === "generate_full_v4") {
      const selectedStyle = tone || "Motivacional";
      const userTopic = topic || idea || "por qué no te alcanza la quincena aunque ganas bien";
      const userSeed = requestBody.seed || Math.floor(Math.random() * 999999);

      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V4. Generador experto de prompts para IA de imagen y video.
Tu prioridad #1: el personaje se ve IDÉNTICO en todo.
Tu prioridad #2: cada generación es DIFERENTE a las anteriores (escenas, cámara, luz, gancho, frases).

══════════════════════════════════════
A) BLOQUE DE PERSONAJE (INMUTABLE)
══════════════════════════════════════
Copia este bloque EXACTO, palabra por palabra, al inicio de CADA prompt de imagen y video.
Nunca lo resumas, traduzcas, reordenes ni le cambies nada:

"${CHARACTER_BLOCK}"

Reglas del personaje:
- El traje, el moño, los lentes y el pelaje NO cambian nunca. No hay disfraces, gorras ni ropa extra.
- Lo único que cambia es: escena, pose, acción, emoción, utilería, luz, cámara y paleta.
- Al final de cada prompt de imagen agrega el NEGATIVE en línea aparte:
"${NEGATIVE_PROMPT}"

══════════════════════════════════════
B) ENTRADA QUE RECIBES
══════════════════════════════════════
- TEMA: "${userTopic}"
- ESTILO: "${selectedStyle}" (Motivacional | Educativo | Polémico | Historia Personal)
- SEMILLA: ${userSeed} (Úsala para decidir tus elecciones de los bancos de variedad de modo que cada corrida sea única)

══════════════════════════════════════
C) PROCESO DE VARIEDAD (hazlo internamente)
══════════════════════════════════════
1. Elige 1 FORMATO de serie, 1 ESTRUCTURA de guion, 1 FÓRMULA DE GANCHO y 1 PALETA.
2. Crea 5 escenas siguiendo el arco: SHOCK → PROBLEMA → EXPLICACIÓN → SOLUCIÓN → VICTORIA.
3. Cada una de las 5 escenas debe tener un ESCENARIO, ÁNGULO e ILUMINACIÓN distintos. Ninguna se repite entre las 5.
4. Para cada paso inventa una METÁFORA VISUAL ligada al TEMA específico. Usa los bancos como inspiración y mejóralos; no te quedes siempre con la primera opción de la lista. Evita clichés por defecto (bolsillos vacíos, ticket largo, pizarrón, alcancía, lluvia de dinero) a menos que la semilla o el tema lo justifiquen.
5. Los 5 videos usan movimientos de cámara, movimientos del personaje y partículas distintos.

BANCOS DE INSPIRACIÓN A USAR:
• Escenarios: modern Mexico City skyscraper office | Mexican home kitchen with talavera tiles | traditional market with papel picado | urban rooftop at sunset | specialty coffee shop | neon podcast studio | convenience store at night | middle-class living room with TV glow | park with jacaranda trees | crowded Mexico City metro | marble bank lobby | shopping mall with SALE signs | street taco stand at night | classic library | minimalist home office | car dealership showroom | supermarket aisle | TED-style stage | bedroom at 2 AM with phone glow | colorful pueblo mágico street | bank vault | government office queue | modern gym | Caribbean beach | classroom with chalkboard | party hall with disco lights | small workshop | corporate boardroom | abstract holographic data space | rideshare back seat at night | Sunday tianguis | pawn shop counter
• Ángulos: low angle hero | over-the-shoulder | wide establishing | tight close-up | dutch angle | top-down | eye-level medium | extreme close-up on glasses reflection | three-quarter view | POV | high angle | full body with negative space | symmetrical Wes Anderson | through foreground objects | silhouette
• Iluminación: golden hour backlight | neon rim light cyan/magenta | soft window light | chiaroscuro | high-key studio | blue hour | warm tungsten lamps | volumetric god rays | cold fluorescent | stage spotlight | screen glow in darkness | overcast daylight | candlelight | split lighting | festive bokeh
• Paletas: teal & orange | warm earthy terracotta | soft pastel | navy & gold | vibrant Mexican pink/yellow/turquoise | desaturated moody | blue with orange accent | emerald & gold | cyberpunk purple/blue | clean white & light blue | retro 70s film | red alert
• Emociones: shocked | thoughtful paw on chin | mischievous smile | determined | euphoric | concerned but calm | confident arms crossed | empathetic | playfully outraged | wise adjusting glasses | relieved | proud | curious leaning in | serious eye contact | laughing
• Acciones: pointing at camera | adjusting glasses | fixing bow tie | holding phone with banking app | counting bills | writing in notebook | magnifying glass over receipt | leaning on desk | walking toward camera | sitting on coin stack | holding calculator | opening empty wallet | sipping coffee | facepalm | thumbs up | drawing on glass wall | handing an envelope | checking wristwatch | shrugging | holding coin jar
• Metáforas SHOCK: wallet turning to dust | day 20 calendar + empty balance | money flying out the window like birds | paycheck melting like ice cream | hole in pocket | red "saldo insuficiente" notification | cracked empty piggy bank | ATM showing $0.00 | nearly empty fridge | deflating "quincena" balloon
• Metáforas PROBLEMA: leaking bucket labeled salary | subscription logos chasing him like bugs | receipt rolling down stairs | credit card chain on ankle | vending machine eating money | iceberg of hidden expenses | tiny "antojo" monsters stealing coins | treadmill going nowhere | maze of bills | hamster wheel of coins
• Metáforas EXPLICACIÓN: holographic pie chart | flow diagram on glass wall | bar chart made of coin stacks | big screen slides | giant magnifying glass over bank statement | jars with percentages | chalkboard math | budget block tower | budgeting app | money route map
• Metáforas SOLUCIÓN: labeled cash envelopes | five jars filling at different levels | plugging bucket holes | golden scissors cutting card chain | planting a coin that grows | automatic transfer click on phone | brick wall "fondo de emergencia" | colored drawers | money tap valve | lock on wallet
• Metáforas VICTORIA: gentle golden coin rain | mountain of coins at sunrise | hammock with full piggy bank | blooming money tree | finish line confetti | trophy | balance going up with green arrow | family dinner toast | living room dance | door to bright landscape
• Cámara video: slow push-in | 180° orbit | dolly out reveal | subtle handheld | crane up | whip pan | rack focus | lateral tracking | dolly zoom | locked-off static | tilt up from paws to face | snap zoom | FPV drone fly-through | slow motion drift | parallax
• Movimiento personaje: blinking and breathing | talking gesture open paws | nodding | turning to camera and smiling | adjusting glasses then pointing | laughing shoulders | confident stride | leaning in like a secret | arms raised celebration | tapping phone and reacting | shaking head in disbelief | counting on fingers | crossing arms smirking | tail swaying | ears twitching
• Partículas: falling gold coins | dust in light beams | fluttering bills | sparkles | confetti | steam | rain on window | holographic numbers | bokeh orbs | receipts like leaves | smoke wisps | glitter | wind-blown leaves | dissolving digital particles | flares
• Fórmulas de gancho: pregunta incómoda | dato impactante con % | "este error te roba X" | contradicción | escena cotidiana ("es día 20 y...") | reto | secreto | orden directa | cálculo en vivo ("$50 al día son $18,250 al año") | señales de alerta | mito | comparación de dos personas | confesión | cuenta regresiva "3 cosas" | imagina que... | pregunta al espectador | alerta | promesa "en 30s te digo" | absurdo exagerado | antes/después
• Estructuras: Problema-Agitación-Solución | Mito vs Realidad | 3 errores + 1 solución | Antes/Después | Mini historia de un caso | Cálculo en vivo | Pregunta-Respuesta rápida | Regla simple con ejemplo
• Formatos: El Tigre reacciona | Tigre en la calle | Tigre vs tu yo del futuro | Cuentas claras en 30s | Mitos financieros | La fuga del día | Consultorio del Tigre | Reto de 7 días | Diccionario financiero | Historias de quincena
• Ejemplos cotidianos MX: café de cadena diario | tacos de salida | Uber/DiDi por flojera | streaming sin usar | meses sin intereses acumulados | Oxxo diario | comida por app | tanda | préstamo al compadre | Buen Fin | aguinaldo en diciembre | recargas | gym sin ir | antojos del tianguis | tiendas departamentales a meses | comisiones bancarias | cuesta de enero | regalos de compromiso | gasolina sin planear | celular a 24 meses

══════════════════════════════════════
D) LO QUE DEBES GENERAR
══════════════════════════════════════
0) COMBINACIÓN USADA (corta, en una línea por punto): formato, estructura, gancho, paleta y escenario de cada paso.
1) 5 PROMPTS DE IMAGEN (Flux / Midjourney / Leonardo, vertical 9:16 para TikTok/Reels), en inglés técnico, con este orden exacto:
   [CHARACTER block] + [emoción] + [acción/pose] + [metáfora visual ligada al tema, con utilería específica] + [escenario detallado] + [ángulo] + [iluminación] + [paleta] + ", vertical portrait format 9:16 for TikTok, photorealistic, Pixar 3D style, cinematic lighting, ultra detailed, 8k --ar 9:16 --style raw\\n\\n" + [NEGATIVE en línea aparte]
2) 5 PROMPTS DE VIDEO (Kling / Runway / Luma / Pika, vertical 9:16, 5-8s), pensados para IMAGE-TO-VIDEO:
   [CHARACTER block] + ", same character as reference image, " + [acción principal (1 sola acción clara)] + ", " + [movimiento del personaje] + ", " + [movimiento de cámara] + ", " + [partículas/ambiente] + ", 6 seconds, vertical 9:16, photorealistic, consistent character, smooth motion, no morphing, no outfit change"
3) GUION DE AUDIO en español (≈38s), SIN presentación al inicio:
   - GANCHO (0-3s): fórmula elegida, directo al problema, sin decir nombre.
   - PROBLEMA (3-18s): El Tigre explica dónde se va el dinero, con 1-2 ejemplos cotidianos MX.
   - SOLUCIÓN (18-38s): sistema concreto y accionable, con al menos 1 número concreto y 1 frase memorable NUEVA.
   - CTA SOLO AL FINAL: "Sígueme para más del Tigre Financiero - Rafa Daddy"
   - OVERLAY: 5 textos de máx 5 palabras estilo viral (pregunta, número, orden, contraste, resultado).

PROHIBIDO en el guion: "¿Sabías que...?", "Si eres de los que...", "Hola a todos", "Hoy vamos a hablar de", "En este video", "Yo soy Rafa Daddy" (antes del CTA).
Branding SOLO al final.

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido con esta estructura:
{
  "combination": {
    "format": "Formato de serie elegido",
    "structure": "Estructura de guion elegida",
    "hook_formula": "Fórmula de gancho elegida",
    "palette": "Paleta elegida",
    "scene_environments": [
      "Escena 1 (Shock): ...",
      "Escena 2 (Problema): ...",
      "Escena 3 (Explicación): ...",
      "Escena 4 (Solución): ...",
      "Escena 5 (Victoria): ..."
    ]
  },
  "title": "TÍTULO DEL VIDEO",
  "theme": "${userTopic}",
  "style": "${selectedStyle}",
  "image_prompts": [
    {
      "step": "SHOCK",
      "version": "V1 - Shock Inicial",
      "metaphor": "Metáfora visual específica...",
      "prompt": "${CHARACTER_BLOCK}, [emoción], [acción], [metáfora], [escenario], [ángulo], [luz], [paleta], vertical portrait format 9:16 for TikTok, photorealistic, Pixar 3D style, cinematic lighting, ultra detailed, 8k --ar 9:16 --style raw\\n\\n${NEGATIVE_PROMPT}"
    },
    {
      "step": "PROBLEMA",
      "version": "V2 - Problema / Agitación",
      "metaphor": "...",
      "prompt": "..."
    },
    {
      "step": "EXPLICACIÓN",
      "version": "V3 - Explicación / Diagnóstico",
      "metaphor": "...",
      "prompt": "..."
    },
    {
      "step": "SOLUCIÓN",
      "version": "V4 - Solución / Sistema",
      "metaphor": "...",
      "prompt": "..."
    },
    {
      "step": "VICTORIA",
      "version": "V5 - Victoria / Éxito",
      "metaphor": "...",
      "prompt": "..."
    }
  ],
  "video_prompts": [
    {
      "step": "SHOCK",
      "version": "V1 - Shock Inicial",
      "camera": "Nombre de movimiento de cámara",
      "motion": "Movimiento del personaje",
      "particles": "Partículas / ambiente",
      "prompt": "${CHARACTER_BLOCK}, same character as reference image, [acción principal], [movimiento], [cámara], [partículas], 6 seconds, vertical 9:16, photorealistic, consistent character, smooth motion, no morphing, no outfit change"
    },
    {
      "step": "PROBLEMA",
      "version": "V2 - Problema",
      "camera": "...",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "step": "EXPLICACIÓN",
      "version": "V3 - Explicación",
      "camera": "...",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "step": "SOLUCIÓN",
      "version": "V4 - Solución",
      "camera": "...",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "step": "VICTORIA",
      "version": "V5 - Victoria",
      "camera": "...",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    }
  ],
  "script_audio": {
    "hook_3s": "Gancho demoledor 0-3s sin presentación...",
    "problem_15s": "Explicación 3-18s con 1-2 ejemplos cotidianos MX...",
    "solution_20s": "Sistema concreto 18-38s con números y frase memorable...",
    "cta_final": "Sígueme para más del Tigre Financiero - Rafa Daddy",
    "full_speech": "Guion completo corrido listo para locución...",
    "overlays": [
      "Texto 1 Pregunta (máx 5 palabras)",
      "Texto 2 Número (máx 5 palabras)",
      "Texto 3 Orden (máx 5 palabras)",
      "Texto 4 Contraste (máx 5 palabras)",
      "Texto 5 Resultado (máx 5 palabras)"
    ]
  }
}`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.85 });
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();

    // Extraer bloque JSON si el modelo incluyó texto antes o después
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(cleanJson);

    if (mode === "ideas") {
      return NextResponse.json({
        ideas: Array.isArray(data.ideas) ? data.ideas : []
      });
    }

    // Normalizar estructura si el modelo usó nombres alternativos en pack completo
    const normalizedData = {
      title: data.title || "Tigre Financiero V4",
      theme: data.theme || topic || "Finanzas Personales",
      style: data.style || tone || "Motivacional",
      combination: data.combination || {
        format: "El Tigre Mentor",
        structure: "Problema-Agitación-Solución",
        hook_formula: "Fórmula Viral",
        palette: "Navy & Gold",
        scene_environments: []
      },
      image_prompts: Array.isArray(data.image_prompts) ? data.image_prompts : [],
      video_prompts: Array.isArray(data.video_prompts) ? data.video_prompts : [],
      script_audio: data.script_audio || {
        hook_3s: "El secreto que nadie te dijo sobre tu quincena...",
        problem_15s: "Crees que ganas bien, pero las fugas invisibles te dejan sin un peso.",
        solution_20s: "Aplica la regla de separar el 20% antes de pagar cualquier servicio hoy mismo.",
        cta_final: "Sígueme para más del Tigre Financiero - Rafa Daddy",
        full_speech: "Crees que ganas bien, pero las fugas invisibles te dejan sin un peso. Aplica la regla de separar el 20% antes de pagar cualquier servicio hoy mismo. Sígueme para más del Tigre Financiero - Rafa Daddy",
        overlays: ["¿Dónde se fue?", "Aplica el 20%", "Separa primero", "No gastes todo", "Libertad financiera"]
      }
    };

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error("Error generating tiger finance:", error);
    return NextResponse.json({ error: error.message || "Error interno generando pack V4" }, { status: 500 });
  }
}
