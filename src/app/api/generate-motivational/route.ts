import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, niche, idea, tone, duration, style, sceneCount, prompt_type, scene_number, narration, existing_prompt } = requestBody;

    let prompt = "";
    const requestedDuration = duration || "40 segundos";
    const requestedStyle = style || "Cinemático Oscuro";
    const requestedTone = tone || "Emotivo y Profundo";
    const count = sceneCount || 5;

    let styleInstruction = "";
    if (requestedStyle.includes("Cinemático Oscuro")) {
      styleInstruction = "Dark cinematic style, dramatic shadows, moody lighting, high contrast, film grain. Moody atmosphere with deep blacks and warm highlights.";
    } else if (requestedStyle.includes("Paisajes Épicos")) {
      styleInstruction = "Epic landscape cinematography, golden hour lighting, vast open spaces, drone-style aerial shots, majestic mountains or oceans, warm sunset tones.";
    } else if (requestedStyle.includes("Urbano / Calle")) {
      styleInstruction = "Urban street photography style, neon lights, rain-slicked streets, city skyline at night, gritty aesthetic, moody atmospheric fog.";
    } else if (requestedStyle.includes("Minimalista")) {
      styleInstruction = "Minimalist clean aesthetic, soft neutral tones, lots of negative space, gentle natural light, serene and contemplative mood.";
    } else if (requestedStyle.includes("Natural / Bosque")) {
      styleInstruction = "Nature cinematography, lush green forests, sunlight filtering through trees, morning mist, peaceful and organic atmosphere.";
    } else if (requestedStyle.includes("Noir / B&W")) {
      styleInstruction = "Black and white noir cinematography, high contrast, dramatic shadows, film noir aesthetic, timeless and powerful.";
    } else if (requestedStyle.includes("Colorido / Vibrante")) {
      styleInstruction = "Vibrant saturated colors, dynamic lighting, energetic and uplifting visual style, bright and alive atmosphere.";
    } else {
      styleInstruction = `Cinematic visual style: ${requestedStyle}. Professional lighting, dramatic composition.`;
    }

    if (mode === "ideas") {
      prompt = `
Eres un creador de contenido motivacional viral para TikTok/Instagram/YouTube Shorts.
Genera 8 ideas de videos motivacionales cortos (~40 segundos) para un nicho específico.

Nicho: "${niche || 'Desarrollo personal y motivación'}"

Cada idea debe ser ÚNICA y tener un ENFOQUE DIFERENTE:
- Algunas enfocadas en dolor/fracaso
- Algunas en superación personal
- Algunas en reflexión filosófica
- Algunas en datos curiosos que inspiran
- Algunas en historias reales o hipotéticas

Responde SOLO con un JSON válido:
{
  "ideas": [
    {
      "title": "Título corto y impactante",
      "hook": "Frase gancho de 1 línea que detenga al lector",
      "focus": "Enfoque del video (dolor, superación, reflexión, etc.)"
    }
  ]
}
`;
    } else if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `
Eres un director de arte visual para contenido motivacional en redes sociales.
Regenera SOLO el prompt de imagen para la escena ${scene_number} de un video motivacional.

Nicho: "${niche || 'Desarrollo personal'}"
Estilo Visual: ${requestedStyle}
Narración: "${narration}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener la narración como inspiración para la escena
- El prompt debe estar en inglés
- Formato vertical 9:16
- ${styleInstruction}

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
      } else {
        prompt = `
Eres un director de arte visual para contenido motivacional en redes sociales.
Regenera SOLO el prompt de animación/video para la escena ${scene_number} de un video motivacional.

Narración: "${narration}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Describir el movimiento suave y cinematográfico
- Duración: 5-8 segundos
- El prompt debe estar en inglés
- Transiciones suaves entre escenas

Responde SOLO con un JSON válido:
{
  "animation_prompt": "El nuevo prompt de animación en inglés..."
}
`;
      }
    } else {
      prompt = `
Eres un guionista y director visual experto en crear videos motivacionales virales para TikTok, Instagram Reels y YouTube Shorts.

Tema/Nicho: "${niche || 'Desarrollo personal y motivación'}"
${idea ? `Idea específica: "${idea}"` : "Genera una idea original y poderosa basada en el nicho."}
Tono Emocional: "${requestedTone}"
Duración objetivo: ${requestedDuration}
Estilo Visual: "${requestedStyle}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 REGLAS PARA EL GUION (NARRACIÓN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

La narración debe ser un MONÓLOGO directo, como si le hablaras directamente al espectador.

ESTRUCTURA:
1. GANCHO (5 seg): Una frase que detenga el scroll. Algo que duelan o que haga pensar.
2. DESARROLLO (20 seg): Profundiza en el tema. Usa datos, comparaciones o situaciones cotidianas.
3. CLÍMAX (10 seg): La verdad más fuerte. El momento "wow".
4. CIERRE (5 seg): Una frase final que se quede en la cabeza. Algo que inspire a compartir.

REGLAS DE ORO:
- NO uses frases genéricas como "tú puedes" o "nunca te rindas"
- SÍ usa datos reales, comparaciones impactantes o situaciones que todos sienten
- El tono debe ser DIRECTO, como un amigo hablándote con verdad
- Longitud ideal: 100-150 palabras (para ~40 segundos de lectura)
- Usa NHaces pausas naturales marcadas con "..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 REGLAS PARA LOS PROMPTS DE IMAGEN/VIDEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cada escena visual debe:
- Ser vertical (9:16)
- Tener iluminación cinematográfica
- Mostrar una ESCENA ESPECÍFICA, no genérica
- Coherencia visual entre todas las escenas
- ${styleInstruction}

Para cada escena (${count} escenas):
1. "scene_number": Número de escena
2. "narration": Línea exacta de la narración para esta escena
3. "visual_concept": Descripción en español de qué se ve en pantalla
4. "image_prompt": Prompt en inglés para generar la imagen (DALL-E/Midjourney)
5. "animation_prompt": Prompt en inglés para animar el video (Runway/Veo3)
6. "duration": Duración estimada de la escena

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con un JSON válido:
{
  "title": "Título impactante del video",
  "full_narration": "La narración completa del video (para copiar y narrar)",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Línea de la narración...",
      "visual_concept": "Qué se ve en pantalla...",
      "image_prompt": "Prompt en inglés para imagen...",
      "animation_prompt": "Prompt en inglés para animación...",
      "duration": "5-8s"
    }
  ],
  "caption": "Caption para redes sociales (20-30 palabras) con hashtags",
  "music_recommendation": "Tipo de música sugerida",
  "hashtags": ["#motivacion", "#desarrollopersonal", "#frases"]
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: mode === "single_prompt" ? 0.9 : 0.85 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating motivational video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
