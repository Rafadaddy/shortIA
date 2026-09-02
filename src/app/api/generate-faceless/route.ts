import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { mode, topic, bodyColor, shortsColor, sceneCount } = await req.json();

    const count = sceneCount || 8;
    let prompt = "";

    const characterBase = `Stylized muscular humanoid character with smooth ${bodyColor || 'yellow'} skin, simple oval head with no facial features except two white oval eyes. Clean line art, thick black outlines, flat solid colors. Very defined but simplified musculature on chest, arms, and abs. Wearing short ${shortsColor || 'black'} athletic shorts. Body proportions heroic and slightly exaggerated. Minimalist digital illustration style, no gradients, no detailed shading, only subtle contour lines. Soft pastel background. Modern, comic-like, simple, clean aesthetic.`;

    if (mode === "ideas") {
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

Debes generar un guion narrativo completo basado en este tema, con una ESTRUCTURA DE HISTORIA CLARA (Inicio, Desarrollo, Clímax, Final).
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

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating faceless youtube:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
