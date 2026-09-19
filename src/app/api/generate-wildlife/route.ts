export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

function parseJsonResponse(raw: string) {
  let cleanJson = raw.trim();
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
  else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
  cleanJson = cleanJson.trim();

  // Buscar primer { o [ y último } o ] si el modelo agregó comentarios antes o después
  const firstBrace = cleanJson.indexOf('{');
  const firstBracket = cleanJson.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleanJson.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleanJson.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleanJson = cleanJson.substring(startIdx, lastBracket + 1);
    }
  }

  return JSON.parse(cleanJson);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tone, animalA, animalB, selectedIdea, customScript } = body;

    // 1. GENERAR IDEAS
    if (action === "ideas") {
      let animalLine = "Inventa 4 batallas salvajes super virales e hipotéticas (ej. Gorila vs Oso Grizzly, Hipopótamo vs Cocodrilo del Nilo, Jaguar vs Pitón, Lobo Alfa vs Hiena).";
      if (animalA && animalB) {
        animalLine = `Los animales a enfrentar son específicamente: ${animalA} vs ${animalB}.`;
      } else if (animalA) {
        animalLine = `El protagonista es: ${animalA}. Sugiérele 4 rivales letales e intrigantes de la naturaleza.`;
      }

      const prompt = `Eres un experto biólogo y estratega de contenido viral de estilo Discovery Channel, Animal Planet y National Geographic Showdowns.
El usuario quiere generar ideas de batallas y encuentros épicos de animales.
Tono narrativo: "${tone || 'Documental Científico y Épico'}".
${animalLine}
Semilla de variedad: ${Date.now()}-${Math.random()}

REGLAS OBLIGATORIAS:
- Idioma: Español neutro impecable, tildes y ortografía correcta.
- Genera exactamente 4 ideas variadas y sumamente atractivas para YouTube Shorts y TikTok.
- Cada idea debe incluir un título de combate y una descripción de los factores clave (fuerza de mordida, peso, velocidad o armadura biológica).

Responde ÚNICAMENTE con un JSON válido:
{
  "ideas": [
    {
      "title": "Animal A vs Animal B: El Duelo Definitivo",
      "description": "Explicación del choque biológico: PSI de mordida, ventaja de terreno y agresividad."
    }
  ]
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        return NextResponse.json(parseJsonResponse(response));
      } catch {
        return NextResponse.json(JSON.parse(clean(response)));
      }
    }

    // 2. GENERAR GUION NARRATIVO
    if (action === "script_only") {
      const ideaTitle = selectedIdea?.title || (typeof selectedIdea === "string" ? selectedIdea : "Batalla Animal Salvaje");
      const ideaDesc = selectedIdea?.description || "";
      const prompt = `Eres un guionista y narrador cinematográfico de documentales de animales salvajes para YouTube Shorts y TikTok (60 seg).
Escribe un guion viral electrizante para este enfrentamiento: "${ideaTitle}" (${ideaDesc}).
Tono del narrador: "${tone || 'Épico y Documental'}".

ESTRUCTURA DE ALTA RETENCIÓN:
1. GANCHO (0-3s): Pregunta o afirmación de shock que obligue a ver hasta el final.
2. CONTRINCANTE 1 (3-12s): Presentación, tamaño, peso y arma letal (fuerza de mordida PSI, garras, veneno).
3. CONTRINCANTE 2 (12-22s): Presentación del rival, ventajas defensivas y armadura.
4. CHOQUE Y ESTRATEGIA (22-45s): Reconstrucción vívida del combate y choque físico.
5. VEREDICTO FINAL Y GANADOR (45-60s): Porcentaje de victoria justificado biológicamente y pregunta final para que comenten.

REGLAS:
- Idioma: Español neutro limpio y fluido, con ritmo rápido para locución.
- Cero clichés aburridos. Datos y números concretos.

Responde ÚNICAMENTE con un JSON válido:
{
  "script": "Texto narrativo completo de la locución continua con indicaciones de ritmo..."
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        const parsed = parseJsonResponse(response);
        return NextResponse.json(parsed);
      } catch {
        // Fallback: si el modelo respondió texto directo en vez de JSON
        const rawText = clean(response);
        return NextResponse.json({ script: rawText });
      }
    }

    // 3. MEJORAR GUION
    if (action === "improve_script") {
      const prompt = `Eres un guionista experto en videos virales de naturaleza salvaje.
Guion actual:
"${customScript}"

Instrucción del usuario para modificarlo: "${body.instruction || 'Hazlo más dinámico y atrapante'}"

Reescribe el guion completo aplicando la instrucción manteniendo el estilo de alta retención. Español neutro impecable.

Responde ÚNICAMENTE con un JSON válido:
{
  "script": "El nuevo guion modificado..."
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.85 });
      try {
        const parsed = parseJsonResponse(response);
        return NextResponse.json(parsed);
      } catch {
        const rawText = clean(response);
        return NextResponse.json({ script: rawText });
      }
    }

    // 4. GENERAR ESCENAS Y PROMPTS
    if (action === "full_from_script") {
      const prompt = `Eres un director cinematográfico de documentales de National Geographic y BBC Wildlife.
Desglosa el siguiente guion en 5 a 6 escenas estructuradas con prompts visuales de máxima calidad fotográfica.

GUION BASE:
"${customScript}"

REGLAS:
- image_prompt: En INGLÉS fotográfico impecable para Midjourney v6 / Flux. "National Geographic wildlife photography, cinematic lighting, 8k, hyper-detailed, shallow depth of field". CERO texto en la imagen. Relación de aspecto 9:16 vertical.
- animation_prompt: En INGLÉS cinematográfico para Runway Gen-3 / Kling / Luma. Describe acción física, movimiento de cámara y tensión animal.
- narration: Asigna el fragmento exacto del guion a cada escena.

Responde ÚNICAMENTE con un JSON válido:
{
  "title": "Título épico del video con emojis",
  "music": "Música orquestal o tribal recomendada",
  "hashtags": ["#animales", "#naturalezasalvaje", "#shorts"],
  "winner_stats": "Ganador estimado y porcentaje",
  "cta": "¿Estás de acuerdo con el ganador? Comenta abajo.",
  "scenes": [
    {
      "scene_number": 1,
      "timestamp": "0:00-0:08",
      "narration": "Texto narrativo de la escena...",
      "text_overlay": "Texto corto en pantalla",
      "visual_concept": "Qué ocurre en pantalla en español",
      "camera_movement": "Movimiento de cámara cinematográfico",
      "audio_cues": "Efectos sonoros (rugido, tensión, agua)",
      "image_prompt": "Ultra realistic National Geographic wildlife photography...",
      "animation_prompt": "Cinematic camera movement and realistic wildlife action..."
    }
  ]
}`;

      const response = await chatCompletion(body, prompt, { temperature: 0.75 });
      return NextResponse.json(parseJsonResponse(response));
    }

    // 5. PROMPT INDIVIDUAL
    if (action === "single_prompt") {
      const { narration, visual_concept, prompt_type } = body;
      const prompt = prompt_type === "animation"
        ? `Create an advanced Runway Gen-3 / Luma animation prompt for this wildlife scene: "${visual_concept || narration}". Style: National Geographic cinematic motion, ultra-realistic physics, 8k, photorealistic.`
        : `Create an advanced Midjourney v6 image prompt for this wildlife scene: "${visual_concept || narration}". Style: National Geographic wildlife photography, dramatic atmospheric lighting, 8k, photorealistic, vertical 9:16.`;

      const response = await chatCompletion(body, `${prompt}\nRespond ONLY with valid JSON: { "${prompt_type === 'animation' ? 'animation_prompt' : 'image_prompt'}": "..." }`, { temperature: 0.8 });
      return NextResponse.json(parseJsonResponse(response));
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.error("[API generate-wildlife Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}