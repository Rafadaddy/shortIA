import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tone, animalA, animalB, selectedIdea, customScript } = body;

    if (action === "ideas") {
      let prompt = `Eres un experto creador de contenido viral estilo "Discovery Channel" y "National Geographic Animal Showdowns".
El usuario quiere generar 3 ideas de batallas o encuentros épicos. Tono narrativo: "${tone}".\n`;
      if (animalA && animalB) prompt += `Los animales a enfrentar son: ${animalA} vs ${animalB}.\n`;
      else if (animalA) prompt += `El protagonista es: ${animalA}. Sugiérele 3 rivales dramáticos.\n`;
      else prompt += `Invéntate 3 batallas súper virales (ej. Gorila vs Oso Grizzly, Hipopótamo vs Cocodrilo).\n`;
      
      prompt += `Responde ÚNICAMENTE con JSON:
{
  "ideas": [
    {
      "title": "TÍTULO DEL ENFRENTAMIENTO (ej. Hipopótamo vs Cocodrilo del Nilo)",
      "description": "El ángulo del video (ej. La brutal diferencia de fuerza de mordida)"
    }
  ]
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    if (action === "script_only") {
      const prompt = `Eres un experto guionista de "Animal Encounters" para YouTube Shorts (60 seg).
Escribe un guion viral para este enfrentamiento: "${selectedIdea.title}" (${selectedIdea.description}).
El tono del narrador es: "${tone}".

ESTRUCTURA OBLIGATORIA (6 FASES):
1. GANCHO VIRAL (0:00-0:03): Frase de shock/pregunta.
2. PRESENTACIÓN A (0:03-0:08): Apodo épico + stats (Peso, Mordida PSI, Velocidad).
3. PRESENTACIÓN B (0:08-0:13): Apodo épico + stats comparativos.
4. COMPARATIVA HEAD-TO-HEAD (0:13-0:35): Ventajas, tamaño, armadura.
5. ESCENARIO DE PELEA (0:35-0:50): Descripción del choque brutal.
6. VEREDICTO FINAL (0:50-0:60): Ganador en %, razón biológica.

Responde ÚNICAMENTE con JSON:
{
  "script": "[0:00-0:03] GANCHO:\\nVOZ:...\\n\\n[0:03-0:08] ANIMAL A:\\nVOZ:..."
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    if (action === "improve_script") {
      const prompt = `Mejora este guion de batalla animal para hacerlo más dinámico, dramático y retenedor para TikTok.
GUION ACTUAL:
${customScript}
Responde ÚNICAMENTE con JSON: { "script": "El nuevo guion..." }`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    if (action === "full_from_script") {
      const sceneBlocks = customScript.split(/\[\d+:\d+-\d+:\d+\]/g).filter((s: string) => s.trim().length > 10);
      const sceneCount = sceneBlocks.length || 6;
      
      const prompt = `Toma este guion y desglósalo EXACTAMENTE en escenas estructuradas según el Master Prompt de Viralidad Salvaje.

GUION BASE:
${customScript}

REGLAS PARA PROMPTS:
- image_prompt: En inglés para Midjourney v6. "National Geographic cinematográfico, ultra realista, 8K, iluminación dramática (Golden hour, Storm, etc), profundidad de campo". NUNCA texto en la imagen.
- camera_movement: Movimientos de cámara (ej. "Fast dolly zoom", "Dynamic tracking shot", "Slow motion impact").
- audio_cues: Efectos de sonido (ej. "Deep sub-bass drop", "Bone snap", "Roar echo").

Responde ÚNICAMENTE con JSON:
{
  "title": "TÍTULO VIRAL + EMOJIS",
  "music": "Ej. Epic orchestral battle music, Drift Phonk",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "winner_stats": "🏆 GANADOR: ANIMAL A 70% - ANIMAL B 30%",
  "cta": "¿Estás de acuerdo? ¡Comenta!",
  "scenes": [
    {
      "scene_number": 1,
      "timestamp": "0:00-0:05",
      "narration": "Texto de la voz en off",
      "text_overlay": "Texto cinético en pantalla (Corto)",
      "visual_concept": "Qué ocurre visualmente",
      "camera_movement": "Movimiento de cámara épico",
      "audio_cues": "SFX específicos para esta escena",
      "image_prompt": "Prompt hiperrealista en inglés para Midjourney v6"
    }
  ]
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      return NextResponse.json(JSON.parse(response));
    }

    if (action === "single_prompt") {
      const { scene_narration } = body;
      const prompt = `Crea un MEJOR prompt de imagen para Midjourney v6 basado en esta narración: "${scene_narration}".
National Geographic cinematográfico, vida salvaje, ultra realista, 8K. (En inglés).
Responde ÚNICAMENTE con JSON: { "prompt": "el nuevo prompt en ingles..." }`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}