export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, tone, visualStyle, idea, current_script, instruction } = requestBody;

    // Personaje FIJO RAFA DADDY - TIGRE FINANCIERO V3
    const characterPrompt = "character RAFA DADDY: anthropomorphic tiger, friendly financial mascot and mentor, NOT Tony the Tiger, realistic soft orange fur with distinct defined black stripes, tailored navy blue suit with subtle pinstripe, light sky blue bow tie, round glasses with thin gold frames, warm, confident and approachable expression, Pixar x photorealistic blend, consistent character design, cinematic lighting, ultra detailed, 8k, photorealistic, Pixar 3D style, --style raw";

    let prompt = "";

    if (mode === "ideas") {
      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V3. Experto en finanzas personales, psicología del dinero y viralidad en redes sociales (TikTok, Reels, Shorts).
Genera 5 ideas de alto impacto y gancho viral para videos sobre el tema: "${topic || 'por qué no te alcanza la quincena aunque ganas bien'}".

AUDIENCIA: Personas de 20 a 45 años con ingresos que sienten que el dinero se les escapa de las manos.
TONO ELEGIDO: "${tone || 'Motivacional'}"

REGLAS DE IDEAS:
- Gancho en los primeros 3 segundos directo al dolor financiero real.
- Cero clichés de autoayuda; habla de sistemas concretos (deudas, gastos hormiga, quincena, ahorro).

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
    } else if (mode === "generate_full_v3") {
      const selectedStyle = tone || "Motivacional";
      const userTopic = topic || idea || "por qué no te alcanza la quincena aunque ganas bien";

      prompt = `Eres RAFA DADDY - TIGRE FINANCIERO V3. Generador experto de prompts para IA y guiones virales de finanzas.

TU PERSONAJE FIJO:
${characterPrompt}

TEMA DEL USUARIO: "${userTopic}"
ESTILO / TONO: "${selectedStyle}"

REGLAS DEL TONO según ESTILO:
- Motivacional: directo, energético, tú puedes.
- Educativo: paso a paso, dato concreto, explica con claridad.
- Polémico: te mintieron, nadie te dijo esto, rompe mitos financieros.
- Historia Personal: a mí me pasó, yo también cometí ese error.

DEBES GENERAR OBLIGATORIAMENTE LAS 3 SECCIONES:

1) 5 PROMPTS DE IMAGEN para Flux/Midjourney/Leonardo en formato horizontal 4:3 (--ar 4:3 --style raw):
- V1: Tigre con bolsillos vacíos (shock inicial)
- V2: Tigre con ticket largo / gastos abrumadores
- V3: Tigre en pizarrón elegante explicando gráfica financiera
- V4: Tigre con alcancía / sistema de sobres de ahorro
- V5: Tigre celebrando lluvia de dinero con serenidad y éxito
Cada prompt en inglés técnico con detalle visual, iluminación cinematográfica, photorealistic, Pixar 3D style, --ar 4:3 --style raw. Incluye siempre la descripción completa del personaje RAFA DADDY.

2) 5 PROMPTS DE VIDEO para Kling/Runway/Luma/Pika en formato vertical 9:16:
- Duración 5-8s, photorealistic, cinematic.
- Añadir obligatoriamente: movimiento de cámara (slow push-in, subtle dolly, smooth handheld), movimiento del personaje (blinking, breathing gently, talking gesture with hands), partículas ambientales (floating golden coins, warm dust motes, soft wind).
- En inglés técnico con la descripción completa del personaje.

3) GUION DE AUDIO V3 - SIN presentación obligatoria al inicio:
- Gancho 3s: directo al problema, SIN decir tu nombre al inicio.
- Problema 15s: El Tigre explica exactamente dónde se va el dinero.
- Solución 20s: Sistema concreto aplicable hoy mismo.
- CTA SOLO AL FINAL: "Sígueme para más del Tigre Financiero - Rafa Daddy"
- Overlay: 5 textos cortos de máximo 5 palabras cada uno para poner en pantalla con estilo viral.

IMPORTANTE: Branding solo al final. No digas "Yo soy Rafa Daddy" al inicio. El Tigre es el que explica, pero no se presenta hasta el CTA final.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "title": "TÍTULO DEL VIDEO",
  "theme": "${userTopic}",
  "style": "${selectedStyle}",
  "image_prompts": [
    {
      "version": "V1 - Bolsillos Vacíos (Shock Inicial)",
      "prompt": "English prompt: ${characterPrompt}, standing with empty turned-out pockets, looking at viewer with surprised and concerned expression, realistic modern office background, soft cinematic lighting, 8k, photorealistic, Pixar 3D style, --ar 4:3 --style raw"
    },
    {
      "version": "V2 - Ticket Largo / Gastos",
      "prompt": "English prompt: ..."
    },
    {
      "version": "V3 - Pizarrón Explicando Gráfica",
      "prompt": "English prompt: ..."
    },
    {
      "version": "V4 - Alcancía / Sistema de Sobres",
      "prompt": "English prompt: ..."
    },
    {
      "version": "V5 - Celebrando Lluvia de Dinero",
      "prompt": "English prompt: ..."
    }
  ],
  "video_prompts": [
    {
      "version": "V1 - Shock Inicial",
      "camera": "Slow push-in shot",
      "motion": "Blinking and checking pockets with surprised gentle head shake",
      "particles": "Subtle dust motes floating in warm light",
      "prompt": "English video prompt: Vertical 9:16, 6 seconds, cinematic slow push-in shot of ${characterPrompt} in empty pockets gesture, blinking with expressive eyes, photorealistic lighting..."
    },
    {
      "version": "V2 - Revisión de Gastos",
      "camera": "Subtle dolly tracking shot",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "version": "V3 - Pizarrón y Mentoría",
      "camera": "Smooth handheld shot",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "version": "V4 - Sistema de Sobres",
      "camera": "Slow pan",
      "motion": "...",
      "particles": "...",
      "prompt": "..."
    },
    {
      "version": "V5 - Éxito Financiero",
      "camera": "Hero low-angle slow push-in",
      "motion": "...",
      "particles": "Golden coins gently falling in slow motion",
      "prompt": "..."
    }
  ],
  "script_audio": {
    "hook_3s": "El gancho directo al problema de 3 segundos sin decir nombre...",
    "problem_15s": "La explicación de dónde se va el dinero en 15 segundos...",
    "solution_20s": "El sistema concreto aplicable en 20 segundos...",
    "cta_final": "Sígueme para más del Tigre Financiero - Rafa Daddy",
    "full_speech": "Texto completo unificado listo para locución de corrido...",
    "overlays": [
      "Texto 1 (máx 5 palabras)",
      "Texto 2 (máx 5 palabras)",
      "Texto 3 (máx 5 palabras)",
      "Texto 4 (máx 5 palabras)",
      "Texto 5 (máx 5 palabras)"
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

    const data = JSON.parse(cleanJson);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error generating tiger finance:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
