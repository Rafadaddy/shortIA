import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, niche, idea, tone, duration, style, sceneCount, prompt_type, scene_number, narration, existing_prompt } = requestBody;

    let prompt = "";
    const requestedStyle = style || "Cinemático Oscuro";
    const requestedTone = tone || "Emotivo y Profundo";
    const count = sceneCount || 5;
    const requestedDuration = duration || "10 Segundos";

    let styleInstruction = "";
    if (requestedStyle.includes("Aleatorio") || requestedStyle.includes("IA decida")) {
      styleInstruction = "Dynamic visual style tailored specifically to the narrative. Period-accurate settings (e.g. 19th-century workshop for Edison, 90s court for Jordan). Highly coherent, visually stunning, avoiding generic metaphors.";
    } else if (requestedStyle.includes("Cinemático Oscuro")) {
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
  Eres un guionista y copywriter experto en contenido viral para TikTok, Reels y Shorts, especializado en videos motivacionales con tono crudo, realista y directo. Tu estilo se parece a creadores que dicen verdades incómodas, no a coaches de autoayuda genéricos.
  Genera 8 ideas de videos altamente clicables para el siguiente tema.
  
  Nicho/Tema: "${niche || 'Desarrollo personal y motivación'}"
  
  REGLAS OBLIGATORIAS PARA LOS GANCHOS (TÍTULOS):
  - Máximo 15 palabras (se lee en menos de 2 segundos).
  - Debe sonar como algo que diría una persona REAL, lenguaje coloquial y directo.
  - PROHIBIDO CLICHÉS: "tú puedes", "cree en ti", "el cielo es el límite", "eres un guerrero", "vibra alto".
  - Usa técnicas variadas: Dolor emocional específico, curiosidad, historias reales con números/edades, contradicciones o urgencia temporal.
  - Prohibido empezar dos ganchos igual.
  
  [VARIEDAD ALEATORIA: ${Math.random()}] IMPORTANTE: NUNCA generes la misma historia o enfoque. Huye de lo genérico.
  
  Responde SOLO con un JSON válido:
  {
    "ideas": [
      {
        "title": "Título corto y crudo (el gancho)",
        "hook": "La técnica usada (ej: Dolor emocional, Contradicción, Historia con números)",
        "focus": "Breve explicación de por qué funciona este enfoque"
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
- El prompt debe estar en inglés y ser ALTAMENTE DETALLADO (mínimo 30 palabras).
- Usa estructura avanzada: [Main subject] + [Environment] + [Lighting details] + [Camera shot] + [Atmosphere] + [Quality tags].
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
Eres un guionista y director visual experto en crear videos motivacionales virales para TikTok y Shorts. Tu estilo es crudo, realista y directo, como un amigo diciendo verdades incómodas. Cero autoayuda genérica.
  
  Tema/Nicho: "${niche || 'Desarrollo personal y motivación'}"
  [VARIEDAD ALEATORIA: ${Math.random()}] IMPORTANTE: NUNCA generes la misma historia o enfoque. Huye de los clichés.
  ${idea ? `Idea base (Gancho elegido): "${idea}"` : "Genera un gancho original basado en el nicho."}
  Tono Emocional: "${requestedTone} (Crudo y directo)"
  Duración objetivo: ${requestedDuration}
  Estilo Visual: "${requestedStyle}"
  
  🔥🔥🔥 REGLAS PARA EL GUION (NARRACIÓN) 🔥🔥🔥
  
  La narración debe ser un MONÓLOGO directo, como si le hablaras directamente al espectador.
  
  ESTRUCTURA (A DISTRIBUIR A LO LARGO DE LAS ${count} ESCENAS SOLICITADAS):
    El arco narrativo debe distribuirse en estas fases, pero fragmentándolo para llenar EXACTAMENTE ${count} escenas (no comprimas la historia, alárgala para cumplir el número exacto):
    - Tensión inicial: Amplía el dolor o curiosidad del gancho para atrapar al espectador.
      - Desarrollo: Aporta el valor real usando historias concretas, edades, lugares o datos contra-intuitivos.
      - Clímax: Un momento de revelación o verdad incómoda.
      - Cierre y CTA: Una frase potente memorable y una invitación final.
      
      MUY IMPORTANTE: ESTAS FASES NARRATIVAS SON SOLO UNA GUÍA. TU OBLIGACIÓN MATEMÁTICA ES GENERAR EXACTAMENTE ${count} ESCENAS EN EL ARREGLO JSON. DEBES DIVIDIR EL TEXTO PARA RELLENAR EXACTAMENTE ESE NÚMERO DE ESCENAS.
      
      REGLAS TRANSVERSALES DE COPYWRITING:
  - PROHIBIDO CLICHÉS: nada de "tú puedes", "vibra alto", "nunca te rindas".
  - DEBES incluir al menos UN número concreto en el guion (una edad, años, horas, dólares, porcentajes).
  - El tono debe ser DIRECTO, como un amigo hablándote con verdad.
  - LONGITUD OBLIGATORIA POR ESCENA: Cada escena debe durar exactamente ${requestedDuration}. 
  * Si es "5 Segundos": Escribe entre 15 y 20 palabras POR ESCENA.
  * Si es "10 Segundos": Escribe entre 30 y 40 palabras POR ESCENA.
  * Si es "15 Segundos": Escribe entre 45 y 55 palabras POR ESCENA.
  * Si es "20 Segundos": Escribe entre 60 y 75 palabras POR ESCENA.
  * ¡Esto es crucial! No escribas guiones de 3 segundos si te piden 10. Expándete en la narración de cada punto.
- Usa pausas naturales marcadas con "..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 REGLAS PARA LOS PROMPTS DE IMAGEN/VIDEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cada escena visual debe:
- Ser vertical (9:16)
- Tener iluminación cinematográfica
- Mostrar una ESCENA ESPECÍFICA, no genérica
- Coherencia visual entre todas las escenas
- ${styleInstruction}

IMPORTANTE: DEBES GENERAR EXACTAMENTE ${count} ESCENAS EN EL ARREGLO "scenes". ¡ES OBLIGATORIO! Ni una más, ni una menos. Para cada escena:
1. "scene_number": Número de escena
2. "narration": Línea exacta de la narración para esta escena
3. "visual_concept": Descripción en español de qué se ve en pantalla
4. "image_prompt": Prompt MUY DETALLADO en inglés para Midjourney/DALL-E (mínimo 30 palabras). Estructura obligatoria: [Sujeto principal/Acción] + [Entorno/Fondo] + [Iluminación, ej: cinematic lighting, golden hour] + [Ángulo de cámara, ej: close-up, wide angle] + [Atmósfera/Emoción] + [Calidad, ej: 8k, photorealistic].
5. "animation_prompt": Prompt en inglés para animar el video (Runway/Veo3)
6. "duration": Duración estimada de la escena

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


🌟 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- ES OBLIGATORIO generar los campos "caption", "music_recommendation" y "hashtags" en la respuesta JSON.
- "caption": Un texto reflexivo o persuasivo para la descripción del video en redes sociales (30-50 palabras).
- "music_recommendation": Describe una canción o pista de audio específica y su vibra (ej: "Piano nostálgico cinemático", "Phonk agresivo para entrenar").
- "hashtags": Proporciona una lista de 5 a 8 hashtags virales relevantes.

Responde SOLO con un JSON válido:
{
  "title": "Título impactante del video",
  "full_narration": "La narración completa del video (para copiar y narrar)",
  "scenes": [
      // OBLIGATORIO: ESTE ARREGLO DEBE CONTENER EXACTAMENTE ${count} OBJETOS (ESCENAS).
      {
        "scene_number": 1,
        "narration": "Línea de la narración...",
        "visual_concept": "Qué se ve en pantalla...",
        "image_prompt": "Prompt en inglés para imagen...",
        "animation_prompt": "Prompt en inglés para animación...",
        "duration": "~10s"
      }
      // ... repite hasta la escena ${count}
    ],
  "caption": "Caption para redes sociales (20-30 palabras) con hashtags",
  "music_recommendation": "Tipo de música sugerida",
  "hashtags": ["#motivacion", "#desarrollopersonal", "#frases"]
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: mode === "single_prompt" ? 0.9 : 0.98 });
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
    console.error("Error generating motivational video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
