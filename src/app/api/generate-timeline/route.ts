import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { mode, topic, characterRef, stepCount } = await req.json();

    const count = stepCount || 8;
    let prompt = "";

    if (mode === "ideas") {
      prompt = `
Eres un generador de Shorts virales de líneas temporales hipotéticas.
El usuario quiere ideas para videos del tipo "¿Qué pasa si..." o "Y si...".
Debes generar 10 ideas fuertes de videos hipotéticos.
Las ideas deben ser impulsadas por la curiosidad, visualmente interesantes, capaces de desarrollarse con el tiempo y adecuadas para una progresión en línea temporal.
Responde ÚNICAMENTE con un JSON válido con la siguiente estructura:
{
  "ideas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5", "Idea 6", "Idea 7", "Idea 8", "Idea 9", "Idea 10"]
}
`;
    } else {
      prompt = `
Eres un creador de contenido viral especializado en videos del tipo "¿Qué pasaría si...?" o "¿Qué le pasaría a tu cuerpo si...?".

Tu trabajo es generar guiones que sean INFORMATIVOS, ESPECÍFICOS y VISUALMENTE IMPACTANTES. No son historias abstractas; son explicaciones CONCRETAS de qué pasaría en una situación hipotética.

Tema: "${topic}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 CÓMO FUNCIONAN ESTOS VIDEOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El video debe explicar qué pasaría REALMENTE en una situación hipotética, paso a paso, como si estuvieras contándole a alguien qué le espera.

EJEMPLO DE CÓMO FUNCIONA:
Tema: "¿Qué pasaría si la tierra se detuviera 2 segundos?"

❌ MAL (genérico y aburrido):
- "Nuestro esqueleto se siente raro"
- "Todo se va a la izquierda"
- "Sería peligroso"

✅ BUENO (específico y visual):
- "En el segundo 1, todo se detiene. Pero tu cuerpo no. Sigues girando a 1,670 km/h. Es como si te sacudieran de golpe"
- "Sentirías una fuerza brutal tirando de ti hacia el este. Tus órganos internos seguirían moviéndose aunque tú estés parado"
- "Las cosas alrededor tuyo saldrían volando. Autos, personas, árboles. Todo en la misma dirección"
- "Si sobrevives a esos 2 segundos, el mundo no sería el mismo. Y tú tampoco"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 FORMATO DE NARRACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CADA paso debe incluir:

1. QUÉ PASA (acción/consecuencia específica)
2. CÓMO SE SIENTE (sensación física o emocional)
3. POR QUÉ OCURRE (explicación breve y clara)

NO uses frases genéricas como:
- "Sentirías algo raro"
- "Todo cambiaría"
- "Sería intenso"
- "Tu cuerpo reacciona"

SÍ usa frases específicas como:
- "Sentirías una presión brutal en el pecho"
- "Tus piernas se doblarían sin control"
- "El aire entraría tan rápido que tus pulmones no darían abasto"
- "Verías todo a tu alrededor moverse en cámara lenta"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 ESTRUCTURA DEL GUION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El guion debe tener esta progresión:

INICIO (Primeros pasos): Describe qué pasa en los primeros momentos. Sé específico: qué siente el cuerpo, qué ve, qué pasa alrededor.

DESARROLLO (Medio): La situación se intensifica. Los efectos se vuelven más graves. Complicaciones adicionales.

FINAL (Últimos pasos): El clímax o desenlace. Puede ser la recuperación, la consecuencia final, o el punto más impactante.

IMPORTANTE: NO siempre empieces con "Nuestro esqueleto" o "Imagina que eres un esqueleto". VARÍA los inicios.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 PROMPTS VISUALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada paso genera un prompt visual EN INGLÉS que muestre:
- La ESCENA específica que se está describiendo
- Las consecuencias VISUALES de lo que pasa
- El personaje (si apara) experimentando lo que se narra

Formato del prompt:
"[Describe la escena específica: qué pasa, cómo se ve, qué elementos hay]. Cinematic lighting, highly detailed, 8k. --ar 9:16"

Responde SOLO con un JSON válido:
{
  "title": "Título que genere curiosidad (tipo '¿Qué pasaría si...?')",
  "timeline": [
    {
      "step_name": "Nombre del paso (ej: 'Los primeros 3 segundos', 'Minuto 1', 'Hora 1')",
      "narration": "Narración específica y detallada en español...",
      "image_prompt": "English prompt ending in --ar 9:16"
    }
  ]
}

Genera EXACTAMENTE ${count} pasos en el timeline.
`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.85,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating timeline:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
