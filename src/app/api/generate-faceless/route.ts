export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, bodyColor, shortsColor, sceneCount, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type } = requestBody;

    const count = sceneCount || 8;
    let prompt = "";
    const scenesTemplate = Array.from({ length: count }).map((_, i) => `{
      "scene_number": ${i + 1},
      "narration": "Línea de la narración...",
      "visual_concept": "Qué se ve en pantalla...",
      "image_prompt": "English prompt...",
      "animation_prompt": "English animation prompt...",
      "duration": "~10s"
    }`).join(',\n      ');

    const characterBase = `Stylized muscular humanoid character with smooth ${bodyColor || 'yellow'} skin, simple oval head with no facial features except two white oval eyes. Clean line art, thick black outlines, flat solid colors. Very defined but simplified musculature on chest, arms, and abs. Wearing short ${shortsColor || 'black'} athletic shorts. Body proportions heroic and slightly exaggerated. Minimalist digital illustration style, no gradients, no detailed shading, only subtle contour lines. Soft pastel background. Modern, comic-like, simple, clean aesthetic.`;

    if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `
Eres un director de arte experto en animación para YouTube.
Regenera SOLO el prompt de imagen para la escena ${scene_number} de un video faceless.

Personaje Base: ${characterBase}
Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener la descripción del personaje base
- Mantener la narración y concepto visual
- El prompt debe estar en inglés
- Incluir pose, cámara, entorno e iluminación


🌟 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- ES OBLIGATORIO incluir "caption", "music_recommendation" y "hashtags".
- "caption": Un texto persuasivo para la descripción del video en redes (30-50 palabras).
- "music_recommendation": Describe una canción específica y su vibra (ej: "Beat phonk oscuro y rápido").
- "hashtags": Lista de 5 a 8 hashtags virales.

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
      } else {
        prompt = `
Eres un director de arte experto en animación para YouTube.
Regenera SOLO el prompt de animación/video para la escena ${scene_number} de un video faceless.

Narración: "${narration}"
Concepto visual: "${visual_concept}"
Prompt anterior (NO repetir): "${existing_image_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Describir el movimiento y la cámara
- Duración: 5 segundos
- El prompt debe estar en inglés

Responde SOLO con un JSON válido:
{
  "animation_prompt": "El nuevo prompt de animación en inglés..."
}
`;
      }
    } else if (mode === "ideas") {
      prompt = `
Eres un creador experto de contenido para YouTube.
Genera 5 ideas de video altamente atractivas y muy clicables para un canal de YouTube faceless con animación (Público objetivo: jóvenes/adultos interesados en historias, reflexiones o fitness).
Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "Título del Video",
      "hook": "Hook emocional en una sola frase",
      "pain_point": "El dolor o problema del público objetivo que resuelve",
      "why_it_works": "Por qué funcionará bien"
    }
  ]
}
`;
    } else {
      prompt = `
Eres un guionista y director de animación para un canal de YouTube de Historias Faceless.
Tema: "${topic}"

Personaje Base: ${characterBase}

Debes generar un guion narrativo completo basado en este tema. IMPORTANTE: EL GUION DEBE DIVIDIRSE EN EXACTAMENTE ${count} ESCENAS. Distribuye el arco narrativo (Inicio, Desarrollo, Clímax, Final) a lo largo de las ${count} escenas solicitadas.
El guion debe tener un tono conversacional, directo, envolvente y emocional.
Divide el guion en EXACTAMENTE ${count} escenas que representen los momentos visuales más importantes. Cada escena dura unos 5 segundos.

Para cada escena, necesitas generar:
1. Líneas de narración (el texto).
2. Concepto visual (lo que pasa).
3. Prompt de imagen en INGLÉS (usando la descripción base del personaje, alterando pose, cámara, entorno).
4. Prompt de animación en INGLÉS para herramientas como Runway/Veo3.

Además, genera UNA miniatura (Thumbnail) con alto CTR.

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido con esta estructura:
{
  "title": "Título llamativo",
  "thumbnail": {
    "text": "TEXTO CORTO EN ESPAÑOL PARA LA MINIATURA",
    "image_prompt": "English prompt: You are generating A YOUTUBE THUMBNAIL. AIM: Maximize CTR. SUBJECT: ${characterBase} with [strong emotion/pose]. LIGHTING: Cinematic 3-point lighting, strong rim light. BACKGROUND: Simple gradient or bokeh. STYLE: Clean cartoon illustration, high contrast. NO small text, NO cluttered background. --ar 16:9"
  },
  "script_sections": {
    "hook": "Inicio: Gancho y contexto inicial (los primeros segundos que atrapan)",
    "development": "Desarrollo: La progresión de la historia o el problema",
    "climax": "Clímax: El punto de mayor tensión, impacto o revelación",
    "ending": "Final: El desenlace y la moraleja o cierre"
  },
  "scenes": [
      ${scenesTemplate}
    ]. Environment: [env]. Lighting: neutral soft light with hard shadows. Camera: [angle].",
      "animation_prompt": "Camera: [type]. Action: [movement]. Environment: [env]. Duration: 5 seconds.",
      "duration": "5s"
    }
  ]
}
Asegúrate de incluir EXACTAMENTE ${count} escenas en el arreglo 'scenes'. Las narraciones de las escenas, si se leen juntas, deben formar la historia completa.
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.7 });
        // Safely parse JSON in case of markdown backticks
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();
    
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating faceless youtube:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
