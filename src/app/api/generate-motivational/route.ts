export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, niche, idea, tone, duration, style, sceneCount, prompt_type, scene_number, narration, existing_prompt, current_script, instruction } = requestBody;

    let prompt = "";
    const requestedStyle = style || "Cinemático Oscuro";
    const requestedTone = tone || "Emotivo y Profundo";
    const count = sceneCount || 5;
    const requestedDuration = duration || "10 Segundos";

    let styleInstruction = "";
    if (requestedStyle.includes("Aleatorio") || requestedStyle.includes("IA decida")) {
      styleInstruction = "Dynamic visual style tailored specifically to the narrative. Period-accurate settings. Highly coherent, visually stunning, avoiding generic metaphors.";
    } else if (requestedStyle.includes("Cinemático Oscuro")) {
      styleInstruction = "Dark cinematic style, dramatic shadows, moody lighting, high contrast, film grain.";
    } else if (requestedStyle.includes("Paisajes Épicos")) {
      styleInstruction = "Epic landscape cinematography, golden hour lighting, vast open spaces, drone-style aerial shots.";
    } else if (requestedStyle.includes("Urbano / Calle")) {
      styleInstruction = "Urban street photography style, neon lights, rain-slicked streets, gritty aesthetic.";
    } else if (requestedStyle.includes("Minimalista")) {
      styleInstruction = "Minimalist clean aesthetic, soft neutral tones, lots of negative space.";
    } else if (requestedStyle.includes("Natural / Bosque")) {
      styleInstruction = "Nature cinematography, lush green forests, sunlight filtering through trees.";
    } else if (requestedStyle.includes("Noir / B&W")) {
      styleInstruction = "Black and white noir cinematography, high contrast, dramatic shadows.";
    } else if (requestedStyle.includes("Colorido / Vibrante")) {
      styleInstruction = "Vibrant saturated colors, dynamic lighting, energetic and uplifting visual style.";
    } else {
      styleInstruction = `Cinematic visual style: ${requestedStyle}. Professional lighting, dramatic composition.`;
    }

    if (mode === "ideas") {
      prompt = `Eres un guionista y copywriter experto en contenido viral para TikTok, Reels y Shorts, especializado en videos motivacionales con tono crudo, realista y directo. Tu estilo se parece a creadores que dicen verdades incómodas, no a coaches de autoayuda genéricos.
Genera 8 ideas de videos altamente clicables para el siguiente tema.

Nicho/Tema: "${niche || 'Desarrollo personal y motivación'}"

REGLAS OBLIGATORIAS PARA LOS GANCHOS (TÍTULOS):
- Máximo 15 palabras.
- Debe sonar como algo que diría una persona REAL, lenguaje coloquial y directo.
- PROHIBIDO CLICHÉS: "tú puedes", "cree en ti", "el cielo es el límite", "eres un guerrero", "vibra alto".
- Usa técnicas variadas: Dolor emocional específico, curiosidad, historias reales, contradicciones o urgencia.

[VARIEDAD ALEATORIA: ${Math.random()}] IMPORTANTE: NUNCA generes la misma historia o enfoque.

Responde SOLO con un JSON válido:
{
  "ideas": [
    {
      "title": "Título corto y crudo (el gancho)",
      "hook": "La técnica usada",
      "focus": "Breve explicación de por qué funciona este enfoque"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista y copywriter experto en contenido viral para TikTok y Shorts. Tu estilo es crudo, realista y directo, como un amigo diciendo verdades incómodas. Cero autoayuda genérica.
  
Tema/Nicho: "${niche || 'Desarrollo personal y motivación'}"
Idea base (Gancho elegido): "${idea}"
Tono Emocional: "${requestedTone} (Crudo y directo)"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS:
- La narración debe ser un MONÓLOGO directo.
- Tensión inicial: Amplía el dolor o curiosidad del gancho.
- Desarrollo: Aporta el valor real usando historias concretas, edades, lugares o datos contra-intuitivos.
- Clímax: Un momento de revelación o verdad incómoda.
- Cierre y CTA: Una frase potente memorable y una invitación final.
- PROHIBIDO CLICHÉS: nada de "tú puedes", "vibra alto", "nunca te rindas".
- DEBES incluir al menos UN número concreto en el guion.
- Usa pausas naturales marcadas con "..."

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del guion, escrito como un solo bloque de texto narrativo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido viral.
Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"
(Por ejemplo: "Hazlo más largo", "Hazlo más corto", "Hazlo más agresivo", etc.)

Reescribe el guion completo aplicando la instrucción. Mantén el tono realista y directo.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
      const scenesTemplate = Array.from({ length: count }).map((_, i) => `{
        "scene_number": ${i + 1},
        "narration": "Línea exacta del guion que corresponde a esta escena...",
        "visual_concept": "Qué se ve en pantalla...",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt...",
        "duration": "~10s"
      }`).join(',\\n      ');

      prompt = `Eres un director visual experto en crear videos virales para TikTok y Shorts.
El usuario ya aprobó el siguiente guion:
"${current_script}"

TU TAREA MATEMÁTICA ESTRICTA:
1. Divide el guion en EXACTAMENTE ${count} escenas. ¡ESTO ES UNA REGLA MATEMÁTICA INQUEBRANTABLE!
   - Si el guion es muy corto, pon menos palabras por escena, pero NO reduzcas el número de escenas. 
   - El arreglo JSON "scenes" DEBE tener ${count} elementos físicos. Ni uno más, ni uno menos.
2. Genera los prompts visuales para cada escena.
3. Genera la metadata de publicación.

Estilo Visual: "${requestedStyle}"
Duración por escena: ${requestedDuration}

REGLAS PARA LOS PROMPTS:
- Cada escena visual debe ser vertical (9:16).
- ${styleInstruction}
- image_prompt: Prompt MUY DETALLADO en inglés (mínimo 30 palabras). [Sujeto] + [Entorno] + [Iluminación] + [Cámara] + [Calidad].
- animation_prompt: Prompt en inglés para animar el video (Runway/Veo3).

🚀 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- ES ESTRICTAMENTE OBLIGATORIO generar los campos "caption", "music_recommendation" y "hashtags" en la respuesta JSON.
- "caption": Texto para redes sociales (30-50 palabras).
- "music_recommendation": Pista de fondo ideal.
- "hashtags": Array de 5 a 8 hashtags.

Responde SOLO con un JSON válido:
{
  "title": "Título impactante del video",
  "full_narration": "El guion completo intacto",
  "scenes": [
      ${scenesTemplate}
    ],
  "caption": "El texto persuasivo para redes sociales...",
  "music_recommendation": "Tipo de música sugerida",
  "hashtags": ["#motivacion", "#desarrollopersonal", "#frases"]
}`;
    } else if (mode === "single_prompt") {
      // (Omitted unchanged code for brevity, handling single prompts if needed)
      // I will keep the original implementation for single prompts just to not break existing buttons.
      if (prompt_type === "image") {
        prompt = `Eres un director de arte visual... Regenera SOLO el prompt de imagen para la escena ${scene_number}... 
Narración: "${narration}"
Prompt anterior: "${existing_prompt}"
Estilo Visual: ${requestedStyle}
${styleInstruction}

Responde SOLO con un JSON válido:
{ "image_prompt": "El nuevo prompt visual en inglés..." }`;
      } else {
        prompt = `Eres un director de arte visual... Regenera SOLO el prompt de animación para la escena ${scene_number}...
Narración: "${narration}"
Prompt anterior: "${existing_prompt}"

Responde SOLO con un JSON válido:
{ "animation_prompt": "El nuevo prompt de animación en inglés..." }`;
      }
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: mode.includes("script") ? 0.9 : 0.7 });
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();
    
    const data = JSON.parse(cleanJson);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating motivational video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
