import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, niche, tone, selectedIdea, visualStyle, format, itemCount } = body;

    if (action === "ideas") {
      const count = itemCount || 10;
      const angles = [
        "errores invisibles y hábitos destructivos que el 99% ignora",
        "secretos contracorriente que van contra el sentido común",
        "reglas psicológicas crudas y verdades sin filtro de la vida real",
        "atajos o métodos poco conocidos con resultados masivos",
        "banderas rojas o señales de advertencia que la gente pasa por alto",
        "lecciones dolorosas aprendidas demasiado tarde",
        "preguntas incómodas y verdades que duelen pero salvan vidas"
      ];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const prompt = [
        'Eres un estratega de contenido viral de clase mundial especializado en listas infográficas y carruseles de alta retención.',
        `Genera 4 ideas de listas virales FRESCAS, ORIGINALES y NOVEDOSAS para la temática: "${niche}".`,
        `Tono: "${tone}".`,
        `Ángulo creativo para esta tanda: ${randomAngle}.`,
        `Semilla de variedad única: ${seed}.`,
        "",
        "POLÍTICAS ESTRICTAS DE SEGURIDAD, LEGALIDAD Y MONETIZACIÓN (100% CUMPLIMIENTO):",
        "- PROHIBIDO TERMINANTEMENTE proponer o sugerir actividades ilegales, delitos, estafas o fraudes.",
        "- PROHIBIDO temas sobre venta de información privada, hackeo, doxxing, robo de datos o evasión ilícita.",
        "- PROHIBIDO temas sobre manipulación de mercados financieros, esquemas Ponzi o estafas bursátiles.",
        "- ENFOQUE DE DEFENSA Y PREVENCIÓN: Si tocas temas de psicología oscura o finanzas, el ángulo DEBE SER SIEMPRE de autodefensa, cómo protegerse de manipuladores, educación y prevención, NUNCA cómo engañar o cometer actos ilícitos.",
        "- APTO PARA MONETIZAR EN TIKTOK, FACEBOOK Y YOUTUBE: El contenido debe ser 100% apto para todo público y libre de banderas rojas de censura.",
        "",
        "REGLAS DE MÁXIMA ORIGINALIDAD:",
        "- PROHIBIDO REPETIR títulos genéricos trillados (como '10 Hábitos de la gente exitosa', '10 Formas de ahorrar', etc.). Sé ultra específico, intrigante y diferente.",
        `- Cada una de las 4 ideas DEBE estar pensada para exactamente ${count} puntos.`,
        `- El título DEBE empezar con el número exacto ${count} (ejemplo: "${count} Cosas que...", "${count} Reglas que...", "${count} Errores de...").`,
        "",
        "Responde SOLO con JSON valido:",
        `{ "ideas": [ { "title": "${count} ...", "description": "Enfoque original, ético y qué hace única a esta lista" } ] }`
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.95 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    if (action === "list") {
      const count = itemCount || 10;
      let title = selectedIdea?.title ?? `${count} Puntos Clave`;
      title = title.replace(/^\d+\s+/, `${count} `);

      const prompt = [
        'Eres un estratega de contenido viral para TikTok y Reels. Tu especialidad son las listas infograficas de alta retencion.',
        `Crea el contenido textual y estructura para un video/carrusel basado en este titulo: "${title}".`,
        "",
        "REGLAS ESTRICTAS DE CANTIDAD Y CONTENIDO:",
        `1. CANTIDAD EXACTA OBLIGATORIA: Debes generar EXACTAMENTE ${count} puntos en el array 'items' numerados del 01 al ${String(count).padStart(2, '0')}. Genera TODOS sin saltarte ninguno.`,
        "2. Los primeros 2 items deben ser los mas fuertes y de mayor impacto.",
        "3. El ultimo item debe ser el mas sorprendente.",
        "4. El campo 'label' debe tener entre 3 y 6 palabras.",
        "5. El campo 'text' debe tener maximo 15 palabras, directo y accionable.",
        "6. POLÍTICA DE SEGURIDAD Y LEGALIDAD: Ningún punto debe promover delitos, hackeo o estafas. Enfócalo en hábitos, psicología defensiva o educación legal.",
        `7. PORTADA: Genera 'image_prompt' para la PORTADA en ENGLISH para Ideogram / Midjourney / DALL-E. Formato: ${format || 'Vertical (9:16)'}. Estilo: "${visualStyle || 'Paisaje cinematográfico con texto limpio'}".`,
        `   - EN LA PORTADA SOLO DEBE IR EL TÍTULO PRINCIPAL ("${title}") Y NADA MÁS. PROHIBIDO poner la lista en la portada.`,
        `8. MENSAJE FINAL DE CIERRE:`,
        `   - Objeto 'final_message': { "title": "MENSAJE FINAL", "text": "Frase de reflexion poderosa de 15 a 25 palabras" }`,
        `9. LOCUCIÓN PARA EL NARRADOR (Campo 'narration_script'):`,
        `   - Escribe en palabras completas: "Número uno:", "Número dos:", "Número tres:", etc. NUNCA números con cero ni dígitos.`,
        `   - Incluye al final: "Y como mensaje final: [texto del mensaje final]. [Llamado a la acción]".`,
        "",
        `Responde SOLO con JSON valido. El array 'items' DEBE tener exactamente ${count} objetos:`,
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequena",
          narration_script: `Aquí tienes ${title}.\n\nNúmero uno: ...\n\nNúmero dos: ...\n\nY como mensaje final: ...`,
          image_prompt: `A highly aesthetic vertical cover poster about [THEME], [STYLE]. Clean cinematic background with a subtle dark gradient overlay, featuring ONLY this single title text centered in clean medium-sized white typography: '${title}'. No lists, no item numbers, no extra text, ultra-clean editorial layout.`,
          items: [
            {
              num: "01",
              emoji: "emoji",
              label: "Titulo corto 3-6 palabras",
              text: "Descripcion practica max 15 palabras."
            }
          ],
          final_message: {
            title: "MENSAJE FINAL",
            text: "Frase de reflexion y conclusion poderosa para cerrar el video."
          },
          cta: "Call to action especifico",
          hashtags: ["#Tag1", "#Tag2", "#Tag3", "#ListasVirales", "#ViralReels"],
          music: "Tipo de musica sugerida"
        }, null, 2)
      ].join("\n");

      const response = await chatCompletion(body, prompt, { temperature: 0.4 });
      const cleanJson = response.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.title = title;

      if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
        parsed.items = [];
        for (let i = 1; i <= count; i++) {
          parsed.items.push({
            num: String(i).padStart(2, "0"),
            emoji: "💡",
            label: `Punto Clave ${i}`,
            text: `Consejo práctico número ${i} para aplicar inmediatamente.`
          });
        }
      }

      // Si vinieron menos items de los solicitados por corte de tokens, rellenar hasta count
      if (parsed.items.length < count) {
        const start = parsed.items.length + 1;
        for (let i = start; i <= count; i++) {
          parsed.items.push({
            num: String(i).padStart(2, "0"),
            emoji: "✨",
            label: `Regla ${i}`,
            text: `Enfoque fundamental número ${i} para dominar este tema.`
          });
        }
      } else if (parsed.items.length > count) {
        parsed.items = parsed.items.slice(0, count);
      }

      // Función generadora de prompts de alta fidelidad con formato uniforme garantizado
      const buildItemPrompt = (num: string, label: string, text: string) => {
        return `An elegant vertical slide poster (aspect ratio 9:16), ${visualStyle || "cinematic nature landscape with soft mist and warm ambient light"}. A subtle dark gradient vignette overlay ensures 100% crystal-clear readability. At the upper third, a medium-large uniform number header '${num}.' in identical font size across all slides. Below the number header, clean modern white Swiss typography displays: '${label}'. Underneath, concise subtitle text: '${text}'. Minimalist, crisp, viral social media carousel slide, 8k resolution, no clutter.`;
      };

      parsed.items.forEach((item: any, i: number) => {
        item.num = String(i + 1).padStart(2, "0");
        if (!item.image_prompt) {
          item.image_prompt = buildItemPrompt(item.num, item.label, item.text);
        }
      });

      // Si no generó final_message, crear uno predeterminado elegante
      if (!parsed.final_message) {
        parsed.final_message = {
          title: "MENSAJE FINAL",
          text: parsed.cta || "El cambio real no empieza cuando sabes qué hacer, sino cuando decides aplicarlo todos los días."
        };
      }

      if (!parsed.final_message.image_prompt) {
        parsed.final_message.image_prompt = `An elegant vertical closing slide poster (aspect ratio 9:16), ${visualStyle || "cinematic nature landscape with soft mist and golden light"}. Subtle dark contrast vignette overlay. Centered in clean, premium white typography: 'MENSAJE FINAL: ${parsed.final_message.text}'. Minimalist, aesthetic, inspirational outro slide, 8k resolution.`;
      }

      if (!parsed.image_prompt) {
        parsed.image_prompt = `A highly aesthetic vertical cover poster (aspect ratio 9:16), ${visualStyle || "cinematic landscape with soft ambient light"}. Clean background with subtle dark contrast overlay, featuring ONLY this single title text centered in clean medium-sized white typography: '${title}'. No lists, no item numbers, no extra text, ultra-clean editorial layout, 8k resolution.`;
      }

      const NUMBER_WORDS: Record<number, string> = {
        1: "uno",
        2: "dos",
        3: "tres",
        4: "cuatro",
        5: "cinco",
        6: "seis",
        7: "siete",
        8: "ocho",
        9: "nueve",
        10: "diez",
        11: "once",
        12: "doce",
        13: "trece",
        14: "catorce",
        15: "quince"
      };

      // Si no generó narration_script o vino vacío, construirlo automáticamente
      if (!parsed.narration_script && Array.isArray(parsed.items)) {
        let script = `${parsed.title}. ${parsed.subhook ? parsed.subhook + "." : ""}\n\n`;
        parsed.items.forEach((item: any, i: number) => {
          const word = NUMBER_WORDS[i + 1] || String(i + 1);
          script += `Número ${word}: ${item.label}. ${item.text}\n\n`;
        });
        if (parsed.final_message?.text) {
          script += `Y como mensaje final: ${parsed.final_message.text}\n\n`;
        }
        if (parsed.cta) {
          script += `${parsed.cta}`;
        }
        parsed.narration_script = script.trim();
      } else if (parsed.narration_script) {
        let sanitized = parsed.narration_script;
        Object.entries(NUMBER_WORDS).forEach(([numStr, word]) => {
          const n = Number(numStr);
          const pad = String(n).padStart(2, "0");
          const regexList = [
            new RegExp(`(?:Punto\\s+n[uú]mero|Punto|N[uú]mero)\\s+(?:${pad}|${n})\\s*[:\\.-]?`, "gi"),
            new RegExp(`\\b${pad}\\s*[:\\.-]\\s*`, "gi"),
          ];
          regexList.forEach(rx => {
            sanitized = sanitized.replace(rx, `Número ${word}: `);
          });
        });
        parsed.narration_script = sanitized.trim();
      }

      return NextResponse.json(parsed);
    }

    // Acción para regenerar / personalizar el prompt de un item individual o en bloque
    if (action === "single_prompt") {
      const { item, title, finalMessage } = body;
      const buildItemPrompt = (num: string, label: string, text: string) => {
        return `An elegant vertical slide poster (aspect ratio 9:16), ${visualStyle || "cinematic nature landscape with soft mist and warm ambient light"}. A subtle dark gradient vignette overlay ensures 100% crystal-clear readability. At the upper third, a medium-large uniform number header '${num}.' in identical font size across all slides. Below the number header, clean modern white Swiss typography displays: '${label}'. Underneath, concise subtitle text: '${text}'. Minimalist, crisp, viral social media carousel slide, 8k resolution, no clutter.`;
      };

      if (finalMessage) {
        const prompt = `An elegant vertical closing slide poster (aspect ratio 9:16), ${visualStyle || "cinematic nature landscape with soft mist and golden light"}. Subtle dark contrast vignette overlay. Centered in clean, premium white typography: 'MENSAJE FINAL: ${finalMessage.text}'. Minimalist, aesthetic, inspirational outro slide, 8k resolution.`;
        return NextResponse.json({ image_prompt: prompt });
      }

      if (item) {
        const prompt = buildItemPrompt(item.num, item.label, item.text);
        return NextResponse.json({ image_prompt: prompt });
      }

      return NextResponse.json({ error: "Faltan datos del item" }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating infographic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
