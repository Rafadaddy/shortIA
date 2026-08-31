import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, idea, panels, style, characterDesc } = await req.json();

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
🎬 REGLA FUNDAMENTAL — ARCO NARRATIVO OBLIGATORIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada viñeta tiene un ROL NARRATIVO específico que DEBES respetar:

${narrativeGuide}

❌ ESTÁ PROHIBIDO:
- Que la historia empiece y se acabe en el panel 1 sin drama
- Que los paneles del medio sean repetitivos o no aumenten la tensión
- Que el final no entregue algo: un giro, una emoción, una verdad, un chiste que golpea
- Usar frases vagas o filosóficas genéricas ("la vida es así", "todo pasa por algo")

✅ DEBES LOGRAR:
- Que el lector sienta que conoce a ese personaje o vivió esa situación
- Que haya una progresión emocional clara: estado inicial → problema/tensión → resolución
- Que el último panel deje algo: risa, nostalgia, revelación, o una verdad incómoda
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para cada viñeta proporciona:
1. "panel_number": El número de viñeta (1 al ${panelCount}).
2. "scene_role": El rol narrativo de esta viñeta en UNA PALABRA: "GANCHO", "DESARROLLO", "CLIMAX" o "DESENLACE".
3. "dialogue": El diálogo o narración EXACTO en ESPAÑOL. CORTO (máximo 15 palabras). Debe ser específico, humano y emotivo — no genérico.
4. "image_prompt": EL PROMPT EN INGLÉS PARA DALL-E 3.
   FORMATO ESTRICTO: "${styleInstruction} [Describe la escena, la acción y los personajes de forma detallada y cinematográfica]. Integrated into the artwork, there is a clear speech bubble or caption box containing bold typography that reads exactly: '[DIALOGUE EN ESPAÑOL]'. Masterpiece, highly detailed. ${aspectRatioFlag}"

IMPORTANTE: El prompt DEBE estar en inglés, pero la frase dentro de las comillas DEBE estar en el ESPAÑOL EXACTO del campo "dialogue".

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido:
{
  "title": "Un título atractivo que genera intriga sin spoilear el final",
  "panels": [
    {
      "panel_number": 1,
      "scene_role": "GANCHO",
      "dialogue": "...",
      "image_prompt": "..."
    }
  ],
  "caption": "Un pie de foto para redes sociales (20-40 palabras) invitando a comentar, con emojis 🔥.",
  "music_recommendation": "Describe qué tipo de música exacta deben ponerle al video/carrusel (ej. Beat de phonk oscuro, piano triste y lento, etc.)"
}
`;

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
    console.error("Error generating comic:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * Builds a per-panel narrative guide based on total panel count.
 * Distributes narrative roles: Hook → Development(s) → Climax → Ending
 */
function buildNarrativeGuide(panelCount: number): string {
  const roles: { role: string; label: string; instruction: string }[] = [];

  if (panelCount <= 3) {
    roles.push({
      role: "GANCHO",
      label: "Viñeta 1 — GANCHO",
      instruction: "Presenta la situación cotidiana de forma que el lector se identifique al instante. Debe ser específica, no genérica.",
    });
    roles.push({
      role: "CLIMAX",
      label: `Viñeta 2 — TENSIÓN`,
      instruction: "Introduce el problema, el giro o la contradicción que hace interesante la historia.",
    });
    roles.push({
      role: "DESENLACE",
      label: `Viñeta ${panelCount} — DESENLACE`,
      instruction: "Cierra con impacto: una revelación, un giro emocional, una verdad que duele o que libera. El lector debe sentir algo.",
    });
  } else {
    roles.push({
      role: "GANCHO",
      label: "Viñeta 1 — GANCHO",
      instruction: "Presenta la situación cotidiana de forma que el lector se identifique al instante. Específica, no genérica.",
    });

    // Middle panels: development and climax
    const middleCount = panelCount - 2;
    const climaxIndex = Math.ceil(middleCount / 2); // which middle panel becomes the climax

    for (let i = 1; i <= middleCount; i++) {
      const panelNum = i + 1;
      if (i === climaxIndex) {
        roles.push({
          role: "CLIMAX",
          label: `Viñeta ${panelNum} — CLÍMAX`,
          instruction: "El momento de mayor tensión, el giro inesperado, o la emoción más intensa de la historia. Debe sorprender o impactar.",
        });
      } else if (i < climaxIndex) {
        roles.push({
          role: "DESARROLLO",
          label: `Viñeta ${panelNum} — DESARROLLO`,
          instruction: "Profundiza en el conflicto o la situación. Agrega un detalle humano que hace al personaje más real y cercano.",
        });
      } else {
        roles.push({
          role: "DESARROLLO",
          label: `Viñeta ${panelNum} — DESARROLLO POST-CLÍMAX`,
          instruction: "Muestra la consecuencia o la reacción del personaje tras el clímax. La historia empieza a resolverse.",
        });
      }
    }

    roles.push({
      role: "DESENLACE",
      label: `Viñeta ${panelCount} — DESENLACE`,
      instruction: "Cierra con impacto: una revelación, un giro emocional, una verdad que duele o que libera, o el humor perfecto. El lector debe sentir algo al terminar.",
    });
  }

  return roles.map((r) => `• ${r.label}: ${r.instruction}`).join("\n");
}
