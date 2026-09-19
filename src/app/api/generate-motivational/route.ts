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
      styleInstruction = "Dynamic cinematic visual style tailored specifically to the narrative, highly coherent, avoiding generic metaphors.";
    } else if (requestedStyle.includes("Cinemático Oscuro")) {
      styleInstruction = "Dark cinematic style, dramatic shadows, moody lighting, high contrast, cinematic atmosphere, 8k resolution.";
    } else if (requestedStyle.includes("Paisajes Épicos")) {
      styleInstruction = "Epic landscape cinematography, golden hour lighting, vast open spaces, dramatic drone aerial view, atmospheric depth.";
    } else if (requestedStyle.includes("Urbano / Calle")) {
      styleInstruction = "Cinematic urban street photography, warm streetlights, textured walls, atmospheric city depth, gritty cinematic realism.";
    } else if (requestedStyle.includes("Minimalista")) {
      styleInstruction = "Minimalist clean aesthetic, soft neutral tones, balanced negative space, high-end editorial composition.";
    } else if (requestedStyle.includes("Natural / Bosque")) {
      styleInstruction = "Lush nature cinematography, misty forest, volumetric sunbeams through ancient trees, serene cinematic atmosphere.";
    } else if (requestedStyle.includes("Noir / B&W")) {
      styleInstruction = "Black and white noir cinematography, high contrast chiascuro lighting, sharp silhouettes, dramatic shadows.";
    } else if (requestedStyle.includes("Colorido / Vibrante")) {
      styleInstruction = "Vibrant rich colors, dynamic cinematic lighting, uplifting and powerful atmospheric visual storytelling.";
    } else {
      styleInstruction = `Cinematic visual style: ${requestedStyle}. Professional lighting, dramatic composition, photorealistic 8k.`;
    }

    if (mode === "ideas") {
      prompt = `Eres un guionista y estratega de contenido viral para TikTok, Reels y Shorts, especializado en videos motivacionales con tono crudo, realista y directo.
Genera exactamente 8 ideas de videos altamente virales para el siguiente nicho.

Nicho/Tema: "${niche || 'Desarrollo personal y motivación'}"

REGLAS OBLIGATORIAS:
- Idioma: Español neutro impecable, ortografía y tildes perfectas, sin caracteres extraños ni garabatos.
- Máximo 15 palabras por gancho/título.
- Lenguaje coloquial, directo y sin clichés de autoayuda (prohibido 'tú puedes', 'sé tu propia luz', 'vibra alto').
- Variedad: Dolor emocional específico, curiosidad psicológica, lecciones de vida duras o verdades incómodas.
- Semilla de variedad: ${Date.now()}-${Math.random()}

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "ideas": [
    {
      "title": "Título corto y crudo (el gancho)",
      "hook": "La frase gancho exacta para los primeros 3 segundos",
      "focus": "Breve explicación de por qué conecta psicológicamente con la audiencia"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista experto en contenido viral para TikTok y Shorts. Tu estilo es crudo, realista y reflexivo.
  
Tema/Nicho: "${niche || 'Desarrollo personal y motivación'}"
Idea base (Gancho elegido): "${idea}"
Tono Emocional: "${requestedTone} (Crudo y directo)"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * (parseInt(requestedDuration) || 10)} SEGUNDOS.

REGLAS DE REDACCIÓN:
- Idioma: Español neutro impecable, con puntuación limpia y tildes correctas. CERO garabatos o caracteres corruptos.
- La narración debe ser un monólogo directo y atrapante de principio a fin.
- Tensión inicial: Expande de inmediato el dolor o la curiosidad del gancho.
- Desarrollo: Argumentos contundentes, situaciones reales y verdades incómodas.
- Clímax: Un quiebre de conciencia o revelación profunda.
- Cierre: Una frase memorable para reflexionar y llamado a la acción sutil.
- Cero clichés de autoayuda barata.

Responde SOLO con un JSON válido:
{
  "script": "Texto completo del guion narrativo continuo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido viral.
Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para modificarlo: "${instruction}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono reflexivo, directo y emocionante.
Idioma: Español neutro impecable, tildes y signos de puntuación correctos, sin caracteres corruptos.

Responde SOLO con un JSON válido:
{
  "script": "Nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
      // BACKEND PRE-SPLITTING FOR 100% RELIABLE SCENE COUNT
      const sentences = current_script.split(/(?<=[.?!])\s+/).filter((s: string) => s.trim().length > 0);
      const preSplitScenes = Array.from({ length: count }, () => [] as string[]);
      
      if (sentences.length > 0) {
        sentences.forEach((s: string, i: number) => {
            const index = Math.min(Math.floor(i / (sentences.length / count)), count - 1);
            preSplitScenes[index].push(s);
        });
      } else {
        preSplitScenes[0].push(current_script);
      }

      const scenesTextBlocks = preSplitScenes.map((sentencesArr, i) => {
        return `ESCENA ${i + 1} NARRACIÓN: "${sentencesArr.join(' ')}"`;
      }).join('\n\n');

      const scenesTemplate = Array.from({ length: count }).map((_, i) => `{
        "scene_number": ${i + 1},
        "narration": "Texto exacto de la Escena ${i + 1}",
        "visual_concept": "Qué ocurre en pantalla en español claro",
        "image_prompt": "Detailed cinematic prompt in English without weird symbols or gibberish. Describes subject, background, lighting, camera angle, 8k.",
        "animation_prompt": "Cinematic camera movement and character motion description in English for Runway or Luma.",
        "duration": "${requestedDuration}"
      }`).join(',\n      ');

      prompt = `Eres un director de cine y creador audiovisual viral.
El guion ha sido pre-dividido en exactamente ${count} escenas:

${scenesTextBlocks}

TU TAREA:
1. Para cada una de las ${count} escenas, asigna su narración exacta.
2. Escribe el visual_concept en español claro explicando qué se ve.
3. Escribe image_prompt en INGLÉS LIMPIO Y PRECISO (sin caracteres raros, sin símbolos de codificación corrupta). Debe describir con claridad: el sujeto, la atmósfera, la iluminación cinematográfica, el encuadre y el estilo (${styleInstruction}). Relación de aspecto vertical (9:16).
4. Escribe animation_prompt en INGLÉS LIMPIO describiendo el movimiento de cámara suave y acción cinemática.
5. Genera la metadata de publicación (caption, música recomendada y hashtags).

REGLAS DE CALIDAD:
- CERO caracteres corruptos o garabatos.
- Texto en español neutro con ortografía impecable.
- Prompts de IA en inglés limpio y directo para Midjourney / DALL-E / Flux.

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "title": "Título impactante del video",
  "full_narration": "Guion completo",
  "scenes": [
      ${scenesTemplate}
  ],
  "caption": "Copy reflexivo para redes sociales en español con emojis adecuados",
  "music_recommendation": "Nombre del estilo o canción instrumental recomendada",
  "hashtags": ["#motivacion", "#disciplina", "#crecimientopersonal"]
}`;
    } else if (mode === "single_prompt") {
      if (prompt_type === "image") {
        prompt = `Eres un director de arte cinematográfico.
Regenera SOLO el prompt de imagen para la escena ${scene_number}.
Narración de la escena: "${narration}"
Prompt anterior (NO repetir): "${existing_prompt}"
Estilo visual: ${requestedStyle}
${styleInstruction}

REGLAS:
- El prompt DEBE estar en INGLÉS limpio y detallado (sin caracteres raros, sin garabatos).
- Vertical 9:16, iluminación cinemática, alta definición.

Responde SOLO con un JSON válido:
{ "image_prompt": "New detailed cinematic image prompt in English..." }`;
      } else {
        prompt = `Eres un director de animación cinematográfica.
Regenera SOLO el prompt de animación/cámara para la escena ${scene_number}.
Narración de la escena: "${narration}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Prompt en INGLÉS limpio describiendo movimiento de cámara y acción (sin caracteres corruptos).

Responde SOLO con un JSON válido:
{ "animation_prompt": "New detailed motion and camera prompt in English..." }`;
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
