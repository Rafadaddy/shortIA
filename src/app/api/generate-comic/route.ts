import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { niche, idea, panels, style, characterDesc, mode, panel_number, dialogue, existing_prompt } = requestBody;

    const panelCount = panels || 4;
    const requestedStyle = style || "Estilo Cómic Web / Webtoon";

    const aspectRatioFlag = "--ar 1:1";

    let styleInstruction = "";
    if (requestedStyle.includes("Webtoon")) {
      styleInstruction = "A modern webtoon digital comic style, clean lines, vibrant colors.";
    } else if (requestedStyle.includes("Stickman")) {
      styleInstruction = "A minimalist stickman line-art drawing style on a clean off-white background. Simple, cute, and highly expressive stick figures. NO speech bubbles. The text MUST be floating cleanly at the top or in the empty space, written in a neat handwriting font.";
    } else if (requestedStyle.includes("Anime")) {
      styleInstruction = "A high-quality Japanese anime/manga aesthetic, detailed shading, expressive characters.";
    } else if (requestedStyle.includes("Dibujo Tierno")) {
      styleInstruction = "A cozy, cute, aesthetic hand-drawn illustration style. Pastel colors, very soft and emotive.";
    } else if (requestedStyle.includes("3D")) {
      styleInstruction = "A 3D Pixar/Disney style animation render, highly detailed, expressive features, cinematic lighting.";
    } else if (requestedStyle.includes("Animación 2D")) {
      styleInstruction = "A classic 2D animated cartoon style. Flat colors, expressive and dynamic character designs, traditional western animation aesthetics.";
    } else if (requestedStyle.includes("Lápiz")) {
      styleInstruction = "A traditional pencil sketch drawing style. Highly detailed graphite shading, monochromatic, visible pencil strokes on textured paper, professional sketchbook aesthetic.";
    } else if (requestedStyle.includes("Noir")) {
      styleInstruction = "A dark noir comic style, black and white, heavy inking, dramatic shadows, Frank Miller style.";
    } else {
      styleInstruction = `A high quality visual artwork in the style of ${requestedStyle}.`;
    }

    const charInstruction = characterDesc
      ? `CRÍTICO PARA CONSISTENCIA DE PERSONAJE: El personaje principal es: "${characterDesc}". DEBES incluir esta descripción visual EXACTA en cada uno de los "image_prompt" para garantizar que la IA lo dibuje idéntico en todas las viñetas.`
      : "";

    if (mode === "single_prompt") {
      const prompt = `
Eres un director de arte experto en crear cómics virales para redes sociales.
Regenera SOLO el prompt de imagen para la viñeta ${panel_number} de una historieta.

Estilo Visual: "${requestedStyle}"
${charInstruction}
Diálogo de la viñeta: "${dialogue}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener el diálogo "${dialogue}" en español dentro del prompt
- Mantener el estilo visual solicitado
- El prompt debe estar en inglés
- Incluir una escena específica y dinámica, no genérica

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
      const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.9 });
      const data = JSON.parse(jsonText);
      return NextResponse.json(data);
    }

    // Build narrative role instructions per panel
    const narrativeGuide = buildNarrativeGuide(panelCount);

    const prompt = `
Eres un guionista de historietas virales para redes sociales con 20 años de experiencia escribiendo historias que hacen que la gente diga "esto me pasó a mí".

Tu misión ahora es crear una historieta de ${panelCount} viñetas con una ESTRUCTURA NARRATIVA REAL Y COMPLETA que enganche desde el primer panel y deje una sensación o reflexión al final.

Temática: "${niche}"
${idea ? `Idea del usuario: "${idea}"` : `Genera una historia original basada en este nicho. Elige una situación MUY CONCRETA y cotidiana, no algo vago o abstracto.`}
Estilo Visual Solicitado: "${requestedStyle}"

${charInstruction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 REGLAS DE ORO PARA UNA BUENA HISTORIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CADA VIÑETA DEBE TENER UN DIÁLOGO ESPECÍFICO Y COHERENTE:
   - NADA de frases genéricas como "la vida es difícil" o "todo pasa por algo"
   - Los diálogos deben ser como si hablaras con un amigo: naturales, con personalidad, con emoción
   - Ejemplos de Buenos Diálogos:
     * "Mamá, ¿tú también finges que estás bien cuando no lo estás?"
     * "Mi mejor amigo se fue sin decir adiós. Solo un mensaje: 'Ya no puedo más'"
     * "El día que dejé de buscar aprobación, todos me empezaron a buscar a mí"
   - Ejemplos de MALOS Diálogos (NUNCA hagas esto):
     * "La vida es un camino"
     * "Todo tiene un propósito"
     * "Debemos ser fuertes"

2. CADA VIÑETA DEBE TENER UNA ACCIÓN VISUAL CLARA:
   - No pongas personajes estáticos "pensando" o "mirando al vacío"
   - Cada panel debe mostrar una ESCENA ESPECÍFICA: alguien haciendo algo, un momento concreto, una interacción
   - Ejemplo: En vez de "Un chico triste sentado", pon "Un chico borrando el contacto de su ex en el teléfono mientras come solo en un restaurante"

3. LA HISTORIA DEBE TENER GIRO EMOCIONAL:
   - El primer panel engancha con una situación recognizable
   - Los paneles del medio complican la situación o muestran la evolución
   - El último panel deja ALGO: una verdad, un giro, una emoción que se queda contigo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 ESTRUCTURA NARRATIVA POR VIÑETA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${narrativeGuide}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ PROHIBIDO:
- Diálogos genéricos o filosóficos vacíos
- Historias que empiezan y terminan igual
- Personajes sin personalidad ni emoción
- Viñetas repetitivas sin avance en la trama

✅ DEBES LOGRAR:
- Que cada diálogo suene a persona real hablando
- Que las imágenes cuenten una historia por sí solas
- Progresión emocional clara: algo cambia entre el primer y último panel
- El último panel debe dejar ALGO en el lector
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada viñeta proporciona:
1. "panel_number": El número de viñeta (1 al ${panelCount}). ¡DEBEN SER EXACTAMENTE ${panelCount} VIÑETAS!
2. "scene_role": El rol narrativo en UNA PALABRA: "INICIO", "DESARROLLO", o "FINAL".
3. "dialogue": El diálogo EXACTO en ESPAÑOL. Debe ser ESPECÍFICO, con PERSONALIDAD y EMOCIÓN. Máximo 20 palabras. NADA de frases genéricas.
4. "image_prompt": EL PROMPT EN INGLÉS PARA DALL-E 3.
   FORMATO: "${styleInstruction} [Describe la ESCENA ESPECÍFICA: quién, qué hace, dónde, expresión facial, iluminación]. Integrated into the artwork, there is a clear speech bubble or caption box containing bold typography that reads exactly: '[DIALOGUE EN ESPAÑOL]'. Masterpiece, highly detailed. ${aspectRatioFlag}"

IMPORTANTE: El prompt DEBE estar en inglés, pero la frase dentro de las comillas DEBE estar en el ESPAÑOL EXACTO del campo "dialogue".

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido:
{
  "title": "Un título atractivo que genera intriga sin spoilear el final",
  "panels": [
    {
      "panel_number": 1,
      "scene_role": "INICIO",
      "dialogue": "...",
      "image_prompt": "..."
    }
  ],
  "caption": "Un pie de foto para redes sociales (20-40 palabras) invitando a comentar, con emojis 🔥.",
  "music_recommendation": "Describe qué tipo de música exacta deben ponerle al video/carrusel (ej. Beat de phonk oscuro, piano triste y lento, etc.)"
}
`;

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.85 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating comic:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

function buildNarrativeGuide(panelCount: number): string {
  const roles: { role: string; label: string; instruction: string }[] = [];

  if (panelCount <= 3) {
    roles.push({
      role: "INICIO",
      label: "Viñeta 1 — INICIO (Planteamiento)",
      instruction: "Presenta la situación cotidiana de forma que el lector se identifique al instante. Establece el contexto.",
    });
    roles.push({
      role: "DESARROLLO",
      label: `Viñeta 2 — DESARROLLO (Tensión)`,
      instruction: "Introduce el problema, el conflicto o la complicación central de la historia.",
    });
    roles.push({
      role: "FINAL",
      label: `Viñeta ${panelCount} — FINAL (Desenlace)`,
      instruction: "Cierra la historia con una resolución clara, un giro emocional o una conclusión impactante.",
    });
  } else {
    roles.push({
      role: "INICIO",
      label: "Viñeta 1 — INICIO (Gancho)",
      instruction: "Presenta a los personajes y el contexto. Atrapa la atención.",
    });

    // Middle panels: development and climax
    const middleCount = panelCount - 2;
    const climaxIndex = Math.ceil(middleCount / 2); // which middle panel becomes the climax

    for (let i = 1; i <= middleCount; i++) {
      const panelNum = i + 1;
      if (i === climaxIndex) {
        roles.push({
          role: "DESARROLLO",
          label: `Viñeta ${panelNum} — DESARROLLO (Clímax)`,
          instruction: "El punto de mayor tensión de la historia, el enfrentamiento del problema principal o el giro inesperado.",
        });
      } else {
        roles.push({
          role: "DESARROLLO",
          label: `Viñeta ${panelNum} — DESARROLLO (Progresión)`,
          instruction: "Avanza la trama, complica la situación o profundiza en las emociones de los personajes.",
        });
      }
    }

    roles.push({
      role: "FINAL",
      label: `Viñeta ${panelCount} — FINAL (Desenlace)`,
      instruction: "Cierra la historia con una resolución definitiva. Una moraleja, un alivio, o un impacto emocional que deje pensando al espectador.",
    });
  }

  return roles.map((r) => `• ${r.label}: ${r.instruction}`).join("\n");
}
