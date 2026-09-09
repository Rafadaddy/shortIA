import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { niche, idea, panels, style, theme, mode, panel_number, dialogue, speaker, existing_prompt, man_appearance, woman_appearance } = requestBody;

    const panelCount = panels || 8;
    const requestedStyle = style || "Estilo Cómic Web / Webtoon";
    const requestedTheme = theme || "amor";

    const aspectRatioFlag = "--ar 1:1";

    let styleInstruction = "";
    if (requestedStyle.includes("Webtoon")) {
      styleInstruction = "A modern webtoon digital comic style, clean lines, vibrant colors. Two characters facing each other or interacting closely.";
    } else if (requestedStyle.includes("Anime")) {
      styleInstruction = "A high-quality Japanese anime/manga aesthetic, detailed shading, expressive characters. Two characters facing each other.";
    } else if (requestedStyle.includes("Dibujo Tierno")) {
      styleInstruction = "A cozy, cute, aesthetic hand-drawn illustration style. Pastel colors, very soft and emotive. Two characters in an intimate conversation.";
    } else if (requestedStyle.includes("3D")) {
      styleInstruction = "A 3D Pixar/Disney style animation render, highly detailed, expressive features. Two characters interacting.";
    } else if (requestedStyle.includes("Lápiz")) {
      styleInstruction = "A traditional pencil sketch drawing style. Highly detailed graphite shading, monochromatic. Two characters in conversation.";
    } else if (requestedStyle.includes("Noir")) {
      styleInstruction = "A dark noir comic style, black and white, heavy inking, dramatic shadows. Two characters in a tense dialogue.";
    } else {
      styleInstruction = `A high quality visual artwork in the style of ${requestedStyle}. Two characters facing each other.`;
    }

    const themeInstructions: Record<string, string> = {
      amor: "Una conversación entre exnovios que se reencuentran después de tiempo separados. Ella todavía siente algo, él intenta ser fuerte. La tensión emocional es palpable.",
      amistad: "Dos mejores amigos que se distanciaron y ahora se reencuentran. Hay cosas no dichas que pesan.",
      familia: "Un padre/madre y su hijo/hija adulta teniendo una conversación que nunca tuvieron. Dolor, comprensión y amor.",
      trabajo: "Dos compañeros de trabajo que revelan sus verdaderos sentimientos sobre la presión laboral y la vida.",
      desamor: "Una pareja que se está separando y tiene la última conversación importante. Duelo, acceptación y crecimiento.",
      nostalgia: "Dos personas que se conocieron de jóvenes y se reencuentran años después. El tiempo cambió todo.",
    };

    const themeInstruction = themeInstructions[requestedTheme] || themeInstructions.amor;

    if (mode === "single_prompt") {
      const characterAppearance = speaker === "EL HOMBRE" ? man_appearance : woman_appearance;
      const prompt = `
Eres un director de arte experto en crear cómics de conversación virales para redes sociales.
Regenera SOLO el prompt de imagen para la viñeta ${panel_number} de una conversación.

Estilo Visual: "${requestedStyle}"
El personaje que habla (${speaker}): ${characterAppearance}
Diálogo: "${dialogue}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener el diálogo "${dialogue}" en español dentro del prompt
- Mantener el estilo visual solicitado
- El prompt debe estar en inglés
- El personaje que habla debe estar en primer plano con expresión facial que refleje su emoción

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
      const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.9 });
      const data = JSON.parse(jsonText);
      return NextResponse.json(data);
    }

    const prompt = `
Eres un guionista de historietas de CONVERSACIÓN entre dos personajes. Tu especialidad son las historias que se desarrollan a través del DIÁLOGO entre un HOMBRE y una MUJER.

IMPORTANTE: Esta historieta es una CONVERSACIÓN. Cada viñeta muestra un intercambio de diálogos entre los dos personajes. No es una historia con narración, es una CONVERSACIÓN VISUAL.

TEMA: "${niche}"
${idea ? `Idea del usuario: "${idea}"` : ""}
CONTEXTO: ${themeInstruction}

ESTILO VISUAL: "${requestedStyle}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 FORMATO DE LA HISTORIETA — CONVERSACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CADA VIÑETA es un intercambio de diálogos entre EL HOMBRE y LA MUJER.
- La mujer generalmente inicia o responde con emoción
- El hombre responde con más reserva o frialdad emocional
- Cada viñeta tiene UN DIÁLOGO (puede ser de cualquiera de los dos)

EJEMPLO DE CÓMO FUNCIONA:
Viñeta 1: Ella dice "¿Cómo has estado?"
Viñeta 2: Él responde "Bien... y tú?"
Viñeta 3: Ella dice "Ya me olvidaste, ¿verdad?"
Viñeta 4: Él responde "No... aún no"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 REGLAS PARA DIÁLOGOS REALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Los diálogos deben sonar como una CONVERSACIÓN REAL entre dos personas:

✅ BUENOS DIÁLOGOS (naturales, con emoción):
- "¿Cómo has estado?" / "Bien... y tú?"
- "¿Ya me olvidaste?" / "No... aún no"
- "Te vi con alguien... ¿es él?" / "No es lo que piensas"
- "¿Por qué no me hablaste?" / "No sabía qué decirte"
- "¿Aún me recuerdas?" / "Todos los días"

❌ MALOS DIÁLOGOS (genéricos, aburridos):
- "La vida es difícil" / "Sí, lo es"
- "Todo pasa por algo" / "Tienes razón"
- "Debemos ser fuertes" / "Sí"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 ESTRUCTURA DE LA HISTORIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

La historia debe tener esta progresión:

1. INICIO (Viñetas 1-2): Saludo, reencuentro, o inicio de la conversación. Tono cordial pero con tensión subyacente.

2. DESARROLLO (Viñetas 3-${panelCount - 2}): La conversación se Profundiza. Surgen emociones, verdades, recuerdos. La tensión aumenta. Puede haber un punto de quiebre o revelación.

3. FINAL (Últimas 2 viñetas): La conversación llega a un punto de inflexión. Puede ser una verdad incómoda, una reconciliación, una despedida, o una reflexión que deja algo al lector.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LO QUE DEBES LOGRAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Que el lector sienta que está ESCUCHANDO una conversación real
- Progresión emocional: la conversación empieza en un punto y termina en otro
- Cada diálogo debe revelar algo de la personalidad o situación del personaje
- El final debe dejar ALGO: una verdad, un giro, una emoción que se queda
- Los personajes deben ser CONSISTENTES: misma ropa, mismo estilo en TODAS las viñetas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSISTENCIA DE PERSONAJES (CRÍTICO):
- EL HOMBRE: Siempre la misma apariencia en TODAS las viñetas. Describe UNA vez su apariencia y repítela EXACTAMENTE en cada image_prompt.
- LA MUJER: Siempre la misma apariencia en TODAS las viñetas. Describe UNA vez su apariencia y repítela EXACTAMENTE en cada image_prompt.
- Usa las MISMAS palabras exactas para describir a cada personaje en cada prompt de imagen.

Para cada viñeta proporciona:
1. "panel_number": Número de viñeta (1 al ${panelCount}). ¡DEBEN SER EXACTAMENTE ${panelCount}!
2. "speaker": "EL HOMBRE" o "LA MUJER" (quién habla en esta viñeta)
3. "dialogue": El diálogo EXACTO en ESPAÑOL. Corto (máx 15 palabras). Natural, con emoción.
4. "image_prompt": PROMPT EN INGLÉS para DALL-E 3.
   FORMATO: "${styleInstruction} [El personaje que habla está en primer plano, con expresión facial que refleje su emoción. El otro personaje se ve parcialmente o al fondo]. Integrated into the artwork, there is a clear speech bubble containing bold typography that reads exactly: '[DIALOGUE EN ESPAÑOL]'. Masterpiece, highly detailed. ${aspectRatioFlag}"

Responde SOLO con un JSON válido:
{
  "title": "Título que genere intriga",
  "man_appearance": "Descripción física del hombre (pelo, ropa, etc.) - USAR SIEMPRE ESTA DESCRIPCIÓN",
  "woman_appearance": "Descripción física de la mujer (pelo, ropa, etc.) - USAR SIEMPRE ESTA DESCRIPCIÓN",
  "panels": [
    {
      "panel_number": 1,
      "speaker": "LA MUJER",
      "dialogue": "...",
      "image_prompt": "..."
    }
  ],
  "caption": "Pie de foto para redes (20-30 palabras) 🔥",
  "music_recommendation": "Tipo de música para acompañar"
}
`;

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.85 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating conversation:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
