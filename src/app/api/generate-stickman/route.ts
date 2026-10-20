export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatJsonCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { 
      topic, 
      mode, 
      idea, 
      sceneCount, 
      current_script, 
      instruction, 
      scene_number, 
      existing_prompt, 
      prompt_type, 
      base_prompt, 
      scene_context,
      aspectRatio = "9:16",
      visualTheme = "monochrome_yellow"
    } = requestBody;

    let prompt = "";
    const count = sceneCount || 6;

    // Directrices de Director Cinematográfico inspiradas en stickman-video-director
    const THEME_STYLES: Record<string, string> = {
      monochrome_yellow: "High-contrast minimalist aesthetic, solid pure black ink lines on crisp white background with selective vibrant electric yellow (#FFD700) accent on key emotional props/elements, zero messy hatching, clean vector look.",
      dark_neon_cyan: "Dark mode aesthetic, pure pitch-black background with bold luminous white stick figure outlines and vivid electric cyan (#00FFFF) accent highlights on critical objects and icons.",
      classic_paper: "Hand-drawn paper notebook sketch aesthetic, clean charcoal ink linework with warm subtle paper texture and cherry red (#FF3366) accent marks for emphasis.",
      minimal_mono: "Ultra-pure monochrome, crisp bold black outlines on seamless bright white canvas, absolute minimalism, zero distractions, timeless explainer cartoon style."
    };

    const chosenThemeDesc = THEME_STYLES[visualTheme] || THEME_STYLES.monochrome_yellow;

    // Blindaje: los modos que trabajan sobre un guion necesitan que llegue
    const needsScript = mode === "full_from_script" || mode === "improve_script";
    if (needsScript && (typeof current_script !== "string" || !current_script.trim())) {
      return NextResponse.json({ error: "Falta el guion (current_script vacío). Genera primero el guion y vuelve a intentarlo." }, { status: 400 });
    }

    if (mode === "ideas") {
      prompt = `Eres un experto creador de contenido para YouTube especializado en videos educativos, de psicología y curiosidades animadas con "stickman" (monigotes).
Genera 8 ideas de videos altamente clicables (títulos y ganchos) para el siguiente tema general.

Tema General: "${topic || 'Psicología, hábitos o datos curiosos'}"

REGLAS PARA LOS GANCHOS (TÍTULOS):
- Máximo 15 palabras.
- Título muy llamativo al estilo de "Kurzgesagt" o canales de curiosidades.

Responde SOLO con un JSON válido:
{
  "ideas": [
    {
      "title": "Título corto y llamativo",
      "hook": "La premisa central del video",
      "focus": "Por qué este tema es interesante"
    }
  ]
}`;
    } else if (mode === "script_only") {
      prompt = `Eres un guionista experto para canales de YouTube de animación (estilo "stickman").
Tema/Idea base: "${idea}"

ESCRIBE EL GUION NARRATIVO COMPLETO PARA UN VIDEO DE ${count * 6} SEGUNDOS.

REGLAS:
- La narración debe ser clara, educativa y entretenida.
- Debe tener una introducción gancho, un desarrollo fácil de entender y una conclusión.
- Usa lenguaje sencillo.
- DEBES escribir suficiente texto para un video de ${count * 6} segundos. (Aprox 20-25 palabras por cada 6 segundos).

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el texto completo del guion, escrito como un solo bloque de texto narrativo..."
}`;
    } else if (mode === "improve_script") {
      prompt = `Eres un guionista experto en contenido de animación para YouTube.
Tienes el siguiente guion base:
"${current_script}"

Instrucción del usuario para mejorarlo/modificarlo: "${instruction}"

Reescribe el guion completo aplicando la instrucción. Mantén el tono educativo y dinámico.

Responde SOLO con un JSON válido:
{
  "script": "Aquí va el nuevo texto completo del guion..."
}`;
    } else if (mode === "full_from_script") {
      // PRE-SPLITTING IN BACKEND
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
        "voiceover": "Texto exacto de la Escena ${i + 1}",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt..."
      }`).join(',\n      ');

      prompt = `1. ROLE: STICKMAN VIDEO DIRECTOR (Inspired by kaomei / stickman-video-director)
You are an award-winning animation director and AI prompt engineer specializing in viral, high-retention stickman explainer videos (like MinutePhysics, Kurzgesagt, and viral TikTok/YouTube explainers).

The user approved the script. It has been pre-split into EXACTLY ${count} sequential scenes (approx 8-10 seconds per scene).

SCENES BREAKDOWN:
${scenesTextBlocks}

TARGET FORMAT & VISUAL CONTRACT:
- Aspect Ratio: ${aspectRatio} (${aspectRatio === "9:16" ? "Vertical for TikTok/Shorts/Reels with centered safe zone" : aspectRatio === "16:9" ? "Horizontal for YouTube widescreen" : "Square 1:1 format"})
- Visual Theme / Art Direction: ${chosenThemeDesc}
- Line Weight: Consistent bold clean stroke lines (approx 4-6px weight), consistent minimalist circle head, expressively animated limbs, no strange morphing or hyper-realistic textures.
- Camera Framing Variety across scenes: Mix Wide Establishing shots, Dynamic Tracking, Over-the-shoulder, Top-down desktop view, and Punchy Close-ups on the stickman's facial reaction.

TASK:
1. Generate the Character Base Prompt locking down the persistent character traits.
2. For each scene, generate:
   - "image_prompt": Production-ready prompt for Flux/Midjourney/Leonardo. Begins with "Stickman animation scene, same character continuity...". Specifies exact camera angle, character action/pose, props, emotional expression, high-contrast theme, and aspect ratio flags (${aspectRatio === "9:16" ? "--ar 9:16" : aspectRatio === "16:9" ? "--ar 16:9" : "--ar 1:1"}).
   - "animation_prompt": Directed prompt for Kling/Runway/Luma/Gemini Omni Flash. Specifies smooth 2D stickman motion, exact camera push/pan, secondary action (bouncing icon, floating lightbulb, sweating marks), loop/transition smoothness, no morphing.

CRITICAL: The 'title' and 'voiceover' MUST be in Spanish. The prompts MUST be in English.

Respond ONLY with a valid JSON object matching this structure:
{
  "title": "Título del video en español",
  "base_prompt": "Persistent Stickman Director Character & Style Contract in English...",
  "scenes": [
    ${scenesTemplate}
  ]
}`;
    } else if (mode === "single_prompt") {
      prompt = `You are a professional Stickman Video Director (inspired by kaomei style).
Regenerate ONLY the ${prompt_type === 'image' ? 'Image Prompt' : 'Animation Prompt'} for Scene ${scene_number}.

Context: "${scene_context}"
${prompt_type === 'image' ? `Stickman Base Prompt: "${base_prompt}"` : ''}
Theme: ${chosenThemeDesc}
Aspect Ratio: ${aspectRatio}
Previous Prompt (DO NOT REPEAT): "${existing_prompt}"

RULES: Make it punchy, dynamic and visually memorable. ${prompt_type === 'image' ? `Start with "Stickman animation scene, same character continuity...". Include camera framing and ${aspectRatio === "9:16" ? "--ar 9:16" : aspectRatio === "16:9" ? "--ar 16:9" : "--ar 1:1"}.` : 'Specify camera pan/push-in and 2D stickman motion without morphing.'}

Reply ONLY with a valid JSON:
{
  "${prompt_type === 'image' ? 'image_prompt' : 'animation_prompt'}": "The new prompt in English..."
}`;
    }

    const data = await chatJsonCompletion(requestBody, prompt, { temperature: mode?.includes("script") || mode === "ideas" ? 0.9 : 0.7 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating stickman video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
