import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

const clean = (r: string) => r.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tone, animalA, animalB, selectedIdea, customScript } = body;

    // �� GENERAR IDEAS �����������������������������������������������
    if (action === "ideas") {
      let animalLine = "Inventa 3 batallas super virales (ej. Gorila vs Oso Grizzly, Hipopotamo vs Cocodrilo del Nilo).";
      if (animalA && animalB) animalLine = `Los animales a enfrentar son: ${animalA} vs ${animalB}.`;
      else if (animalA) animalLine = `El protagonista es: ${animalA}. Sugierele 3 rivales dramaticos.`;

      const prompt = [
        'Eres un experto creador de contenido viral estilo "Discovery Channel" y "National Geographic Animal Showdowns".',
        `El usuario quiere generar 3 ideas de batallas o encuentros epicos. Tono narrativo: "${tone}".`,
        animalLine,
        "",
        "Responde SOLO con JSON valido, sin texto adicional:",
        '{ "ideas": [ { "title": "TITULO DEL ENFRENTAMIENTO (ej. Hipopotamo vs Cocodrilo del Nilo)", "description": "El angulo del video (ej. La brutal diferencia de fuerza de mordida)" } ] }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(clean(response)));
    }

    // �� SOLO GUION ��������������������������������������������������
    if (action === "script_only") {
      const prompt = [
        'Eres un experto guionista de "Animal Encounters" para YouTube Shorts (60 seg).',
        `Escribe un guion viral para este enfrentamiento: "${selectedIdea.title}" (${selectedIdea.description}).`,
        `El tono del narrador es: "${tone}".`,
        "",
        "ESTRUCTURA OBLIGATORIA (6 FASES):",
        "1. GANCHO VIRAL (0:00-0:03): Frase de shock o pregunta impactante.",
        "2. PRESENTACION A (0:03-0:08): Apodo epico + stats (Peso, Mordida PSI, Velocidad).",
        "3. PRESENTACION B (0:08-0:13): Apodo epico + stats comparativos.",
        "4. COMPARATIVA HEAD-TO-HEAD (0:13-0:35): Ventajas, tamano, armadura.",
        "5. ESCENARIO DE PELEA (0:35-0:50): Descripcion del choque brutal.",
        "6. VEREDICTO FINAL (0:50-0:60): Ganador en %, razon biologica.",
        "",
        "Responde SOLO con JSON valido:",
        '{ "script": "[0:00-0:03] GANCHO:\\nVOZ:...\\n\\n[0:03-0:08] ANIMAL A:\\nVOZ:..." }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(clean(response)));
    }

    // �� MEJORAR GUION �����������������������������������������������
    if (action === "improve_script") {
      const prompt = [
        "Mejora este guion de batalla animal para hacerlo mas dinamico, dramatico y retenedor para TikTok.",
        "GUION ACTUAL:",
        customScript,
        "",
        'Responde SOLO con JSON valido: { "script": "El nuevo guion mejorado..." }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(clean(response)));
    }

    // �� GENERAR VIDEO COMPLETO DESDE GUION ��������������������������
    if (action === "full_from_script") {
      const prompt = [
        "Toma este guion y desglosa EXACTAMENTE en escenas estructuradas para un video viral de animales salvajes.",
        "",
        "GUION BASE:",
        customScript,
        "",
        "REGLAS PARA CADA ESCENA:",
        "- image_prompt: En ingles para Midjourney v6. National Geographic, ultra realista, 8K, iluminacion dramatica. NUNCA texto en la imagen.",
        "- camera_movement: Movimientos de camara epicos (ej. Fast dolly zoom, Slow motion impact).",
        "- audio_cues: Efectos de sonido (ej. Deep sub-bass drop, Bone snap, Roar echo).",
        "",
        "Responde SOLO con JSON valido:",
        JSON.stringify({
          title: "TITULO VIRAL + EMOJIS",
          music: "Epic orchestral battle music",
          hashtags: ["#Tag1", "#Tag2", "#Tag3"],
          winner_stats: "GANADOR: ANIMAL A 70% - ANIMAL B 30%",
          cta: "Estas de acuerdo? Comenta!",
          scenes: [{
            scene_number: 1,
            timestamp: "0:00-0:05",
            narration: "Texto de la voz en off",
            text_overlay: "Texto cinetico en pantalla",
            visual_concept: "Que ocurre visualmente",
            camera_movement: "Movimiento de camara epico",
            audio_cues: "SFX especificos para esta escena",
            image_prompt: "Hyperrealistic National Geographic wildlife, 8K, dramatic lighting, cinematic"
          }]
        }, null, 2)
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.7 });
      return NextResponse.json(JSON.parse(clean(response)));
    }

    // �� PROMPT INDIVIDUAL �������������������������������������������
    if (action === "single_prompt") {
      const { scene_narration } = body as { scene_narration: string };
      const prompt = [
        `Create a better Midjourney v6 image prompt based on this narration: "${scene_narration}".`,
        "Style: National Geographic cinematic, wildlife, ultra realistic, 8K, dramatic lighting.",
        'Respond ONLY with valid JSON: { "prompt": "the new prompt in english..." }'
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.8 });
      return NextResponse.json(JSON.parse(clean(response)));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}