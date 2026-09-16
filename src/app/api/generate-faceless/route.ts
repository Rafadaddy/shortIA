export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, bodyColor, shortsColor, sceneCount, duration, scene_number, narration, visual_concept, existing_image_prompt, prompt_type } = requestBody;

    const count = sceneCount || 8;
    let prompt = "";

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



  🚀 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
  - ES ESTRICTAMENTE OBLIGATORIO generar los campos "caption", "music_recommendation" y "hashtags" en la respuesta JSON. Si no los incluyes, el sistema fallará.
  - "caption": Un texto reflexivo o persuasivo para la descripción del video en redes sociales (30-50 palabras).
  - "music_recommendation": Describe la pista de fondo ideal (ej: "Piano nostálgico cinemático").
  - "hashtags": Array de strings con 5 a 8 hashtags virales relevantes.

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
    {
      "scene_number": 1,
      "narration": "Línea exacta del guion que corresponde a esta escena...",
      "visual_concept": "Descripción en español de lo que se ve en pantalla...",
      "image_prompt": "English prompt: ${characterBase} performing [action]. Environment: [env]. Lighting: neutral soft light with hard shadows. Camera: [angle].",
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
