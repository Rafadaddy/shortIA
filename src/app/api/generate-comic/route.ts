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
Eres un director de arte experto en crear carruseles y cómics virales para redes sociales.
Regenera SOLO el prompt de imagen para la viñeta/diapositiva ${panel_number} de una historieta.

Estilo Visual: "${requestedStyle}"
${charInstruction}
Diálogo de la viñeta: "${dialogue}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener el texto o diálogo "${dialogue}" en español dentro del prompt
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

    const prompt = `
ACTÚA COMO GENERADOR DE CARRUSELES REFLEXIVOS PARA REDES SOCIALES.
OBJETIVO: Crear contenido tipo carrusel de EXACTAMENTE ${panelCount} imágenes (diapositivas) con frases reflexivas/emocionales acompañadas de descripciones de imágenes realistas.

REGLAS OBLIGATORIAS:
1. ✅ CADA GENERACIÓN DEBE SER UN TEMA COMPLETAMENTE DIFERENTE. NO repetir el mismo ángulo o concepto. NO solo cambiar palabras del mismo tema.
   Ejemplo INCORRECTO: "Cómo enamorar a tu pareja" / "Formas de conquistar a tu amor" (Es lo mismo).
   Ejemplo CORRECTO: "Detalles que mantienen el amor vivo después de 10 años" / "Señales de que te extraña aunque no lo diga" (Temas diferentes).
2. ✅ USAR SIEMPRE UN SUB-TEMA ESPECÍFICO (no genérico) basado en el nicho: "${niche || 'Amor, Desamor, Familia, Motivación, o Amistad'}". ${idea ? `Idea específica: "${idea}"` : ''}
3. ✅ VARIAR ENTRE LAS DIFERENTES CATEGORÍAS (Amor de pareja, Desamor, Familia, Motivación/Crecimiento, Amistad). Rota entre ellas y usa subtemas únicos.
4. ✅ EL NÚMERO DE DIAPOSITIVAS DEBE SER EXACTAMENTE: ${panelCount}.

ESTRUCTURA DEL CARRUSEL:

DIAPOSITIVA 1 (PORTADA):
- Título/gancho llamativo en formato pregunta o afirmación. Debe generar curiosidad o identificación inmediata. (Ej. "¿Sabes hacerle el amor a tu pareja?", "7 señales de que es amor del bueno").

DIAPOSITIVAS 2 A ${panelCount} (CONTENIDO):
- Cada imagen desarrolla UN punto específico.
- Formato recomendado: "Es [acción] + [descripción emocional/contexto]" u otras frases cortas impactantes (máximo 2-3 líneas).
- Ejemplos: "Es buscar su mano mientras van caminando por la calle", "Es darle un beso al llegar a casa aunque lleven diez años juntos".

ESTILO VISUAL (PARA LOS IMAGE_PROMPTS):
${charInstruction}
Para cada diapositiva, proporciona la descripción de la escena (image_prompt) en INGLÉS siguiendo esto:
- Imágenes realistas, cálidas, emotivas, situaciones cotidianas y reconocibles.
- Iluminación cálida (atardecer, luz natural, ambientes acogedores), colores tonos cálidos (beige, dorado, terracota, crema).
- Estilo base: ${styleInstruction}.
- FORMATO OBLIGATORIO DEL PROMPT DE IMAGEN: "A dramatic, highly realistic and emotional scene of [Descripción detallada de la escena]. Warm lighting, warm tones (beige, gold, terracotta). Masterpiece, 8k. Integrated into the artwork, there is bold elegant typography reading: '[Texto principal/Diálogo en Español]'. ${aspectRatioFlag}"

FORMATO DE SALIDA (JSON ESTRICTO):
Debes generar un JSON válido con la siguiente estructura exacta:
{
  "title": "TEMA: [Sub-tema] | CATEGORÍA: [Categoría]",
  "panels": [
    {
      "panel_number": 1,
      "scene_role": "GANCHO",
      "dialogue": "[Título/gancho principal de la portada]",
      "image_prompt": "El prompt de imagen en inglés para la portada respetando las reglas visuales..."
    },
    {
      "panel_number": 2,
      "scene_role": "DESARROLLO",
      "dialogue": "[Frase reflexiva 1]",
      "image_prompt": "El prompt de imagen en inglés para la diapositiva 2..."
    }
  ],
  "caption": "Un pie de foto emocional para redes sociales, con hashtags",
  "music_recommendation": "Sugerencia de canción o audio viral"
}

INSTRUCCIÓN FINAL:
CADA VEZ que genere contenido: Elige un SUB-TEMA ESPECÍFICO no usado antes. NO repitas conceptos. Crea EXACTAMENTE ${panelCount} paneles en el array 'panels'. Mantén el tono emocional, reflexivo, cercano, elegante. NUNCA CORTES EL JSON.
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
