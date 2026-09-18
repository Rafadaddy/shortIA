import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tone, animalA, animalB, selectedIdea, customScript } = body;

    // 1) Generar Ideas
    if (action === "ideas") {
      let prompt = `Eres un experto guionista de documentales salvajes y TikToks virales de batallas animales (Animal Encounters / Who Would Win).
El usuario quiere generar 3 ideas de batallas o encuentros épicos.
Tono narrativo: "${tone}".\n`;
      if (animalA && animalB) {
        prompt += `Los animales a enfrentar son: ${animalA} vs ${animalB}.\n`;
      } else if (animalA) {
        prompt += `El protagonista es: ${animalA}. Sugiérele 3 rivales o encuentros dramáticos.\n`;
      } else {
        prompt += `Invéntate 3 batallas súper virales (ej. Gorila vs Oso Grizzly, Hipopótamo vs Cocodrilo, etc).\n`;
      }
      
      prompt += `
Responde ÚNICAMENTE con un JSON válido con esta estructura:
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

    // 2) Generar Solo Guion
    if (action === "script_only") {
      const prompt = `Eres un experto guionista de "Animal Encounters" para YouTube Shorts.
Escribe un guion viral de 5 a 6 escenas para este enfrentamiento: "${selectedIdea.title}" (${selectedIdea.description}).
El tono del narrador es: "${tone}". (Si es Épico, usa voz de tráiler; si es Casual/Hood, usa sarcasmo; si es Gamer, usa términos de RPG/Stats).

REGLAS DE RETENCIÓN (5 FASES):
1. El Gancho (Tensión inmediata).
2. Competidor A (Fuerza, peso, Mordida en PSI).
3. Competidor B (Armadura, agilidad, instinto).
4. El Factor X (La realidad biológica).
5. Veredicto (Quién gana y por qué, más pregunta para comentarios).

Responde ÚNICAMENTE con JSON:
{
  "script": "ESCENA 1: ...\\nESCENA 2: ..."
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    // 3) Mejorar Guion
    if (action === "improve_script") {
      const prompt = `Mejora este guion de batalla animal para hacerlo más dinámico, dramático y retenedor para TikTok.
Mantén la crudeza de los datos científicos pero haz que suene espectacular.
GUION ACTUAL:
${customScript}

Responde ÚNICAMENTE con JSON:
{
  "script": "El nuevo guion..."
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    // 4) Desglosar en Escenas (Full)
    if (action === "full_from_script") {
      // PRE-SPLITTING ALGORITHM (Bypassing Gemini's array length ignoring tendencies)
      const sceneBlocks = customScript.split(/ESCENA \d+:/i).filter((s: string) => s.trim().length > 0);
      const sceneCount = sceneBlocks.length;
      
      const prompt = `Eres un director de documentales salvajes. Toma este guion y desglósalo EXACTAMENTE en ${sceneCount} escenas.

GUION:
${customScript}

Reglas para las imágenes (image_prompt):
- Deben ser prompts EN INGLÉS para Midjourney v6.
- Estilo: Hyper-realistic, intense close-up, dramatic lighting, photorealistic textures, Unreal Engine 5 render, 9:16 vertical aspect ratio.
- NUNCA pongas texto en la imagen. Solo el animal, la acción, o el ambiente.

Responde ÚNICAMENTE con JSON:
{
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Texto que dirá la voz en off",
      "image_prompt": "Prompt en inglés para generar la imagen hiperrealista del animal..."
    }
  ]
}`;
      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      return NextResponse.json(JSON.parse(response));
    }

    // 5) Regenerar Prompts Individuales (Imágenes o Animación)
    if (action === "single_prompt") {
      const { type, scene_narration, current_prompt } = body;
      const prompt = `Crea un MEJOR prompt de imagen para Midjourney v6 basado en esta narración: "${scene_narration}".
Debe ser hiperrealista, fotografía de vida salvaje, iluminación dramática. (En inglés).
Responde ÚNICAMENTE con JSON:
{ "prompt": "el nuevo prompt en ingles..." }`;
      
      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(response));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error API Naturaleza:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
