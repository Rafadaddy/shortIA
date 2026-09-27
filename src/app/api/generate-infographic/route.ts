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
      // Ensure title reflects itemCount if it had a different number at start
      title = title.replace(/^\d+\s+/, `${count} `);

      const prompt = [
        'Eres un estratega de contenido viral para TikTok y Reels. Tu especialidad son las listas infograficas de alta retencion.',
        `Crea el contenido completo para un video/carrusel basado en este titulo: "${title}".`,
        "",
        "REGLAS ESTRICTAS DE CANTIDAD Y CONTENIDO:",
        `1. CANTIDAD EXACTA OBLIGATORIA: Debes generar EXACTAMENTE ${count} puntos numerados del 01 al ${String(count).padStart(2, '0')} dentro del array 'items'. No te detengas hasta completar los ${count} puntos.`,
        "2. Los primeros 2 items deben ser los mas fuertes y de mayor valor.",
        "3. El ultimo item debe ser el mas polemico o sorprendente.",
        "4. El campo label debe tener de 3 a 6 palabras maximo.",
        "5. El campo text debe ser maximo 15 palabras, concreto y practico.",
        "6. POLÍTICA DE SEGURIDAD Y LEGALIDAD: Ningún punto debe promover actividades ilegales, fraudes, robo de información o manipulación dañina. Enfócalo en hábitos, psicología defensiva o educación financiera legal.",
        `7. REGLA ESTRICTA DE LA PORTADA: Genera un 'image_prompt' para la PORTADA en ENGLISH para Ideogram / Midjourney v6 / DALL-E. Formato: ${format || 'Vertical (9:16)'}. Estilo: "${visualStyle || 'Paisaje cinematográfico con texto limpio'}".`,
        `   - EN LA PORTADA SOLO DEBE IR EL TÍTULO PRINCIPAL ("${title}") Y NADA MÁS.`,
        `   - PROHIBIDO TERMINANTEMENTE colocar los 10 puntos, listas, números o párrafos dentro de la portada. Es EXCLUSIVAMENTE una portada tipo revista o portada de video con el título centrado y limpio.`,
        `   - Si el estilo es de paisaje (bosque, atardecer, mar, montaña): describe una fotografía cinematográfica con niebla suave, atardecer o naturaleza, con un velo oscuro o viñeta sutil (dim dark gradient overlay) para que la tipografía blanca nítida resalte con contraste perfecto y máxima legibilidad.`,
        `   - Tipografía: Proporciones equilibradas, medianas y elegantes (editorial aesthetic, Swiss style typography), NUNCA tipografías deformadas o saturadas.`,
        `8. Para CADA UNO DE LOS ${count} PUNTOS de la lista, genera su propio 'image_prompt' INDIVIDUAL en ENGLISH:`,
        `   - Cada punto es una tarjeta vertical separada.`,
        `   - Contiene únicamente el número ("01", "02", etc.), el Label y el Text del punto correspondiente.`,
        `   - TAMAÑO DE LOS NÚMEROS Y LETRAS UNIFORME: Todos los números ("01.", "02.", "03."...) DEBEN tener exactamente el MISMO TAMAÑO mediano, nítido y legible en todas las imágenes. NO hagas números gigantes ni minúsculos; mantén un tamaño uniforme de escala editorial suiza ("medium-large uniform number header, identical font size across all slides").`,
        `   - Fondo: Coherente con el estilo ("${visualStyle}"), si es paisaje con velo oscuro y texto en blanco brillante con contraste 100% legible.`,
        `9. MENSAJE FINAL DE CIERRE / REFLEXIÓN (Slide de cierre):`,
        `   - Genera un objeto 'final_message' para una última tarjeta/imagen que cierre el video con broche de oro tras los ${count} puntos.`,
        `   - 'title': Título inspirador o contundente (ej. "LA REGLA DE ORO", "MENSAJE FINAL", "RECUERDA ESTO").`,
        `   - 'text': Reflexión o conclusión poderosa de 15 a 25 palabras que deje pensando al espectador y refuerce el valor de la lista.`,
        `   - 'image_prompt': Prompt para generar esta última imagen de cierre con su fondo cinematográfico coherente y el texto del mensaje final centrado y elegante.`,
        `10. REGLA ESTRICTA DE LOCUCIÓN PARA EL NARRADOR (Campo 'narration_script'):`,
        `   - El guion de locución debe estar redactado en PALABRAS COMPLETAS para que suene 100% natural al leerse.`,
        `   - PROHIBIDO TERMINANTEMENTE escribir números como dígitos o con cero por delante (PROHIBIDO "01", "02", "1.", "2."). Si dejas "01", la voz de IA lee literalmente "cero uno".`,
        `   - DEBES ESCRIBIRLO OBLIGATORIAMENTE CON PALABRAS: "Número uno:", "Número dos:", "Número tres:", "Número cuatro:", "Número cinco:", "Número seis:", "Número siete:", "Número ocho:", "Número nueve:", "Número diez:", "Número once:", "Número doce:".`,
        `   - Incluye al final la locución del MENSAJE DE CIERRE: "Y como mensaje final: [texto del mensaje final]. [Llamado a la acción]".`,
        "",
        `Responde SOLO con JSON valido. El array 'items' DEBE tener exactamente ${count} objetos:`,
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequenya",
          narration_script: `Aquí tienes ${title}.\n\nNúmero uno: ...\n\nNúmero dos: ...\n\nY como mensaje final: ...`,
          image_prompt: `A highly aesthetic vertical cover poster about [THEME], [STYLE]. Clean cinematic background with a subtle dark gradient overlay, featuring ONLY this single title text centered in clean medium-sized white typography: '${title}'. No lists, no item numbers, no extra text, ultra-clean editorial layout.`,
          items: [
            {
              num: "01",
              emoji: "emoji",
              label: "Titulo corto 3-6 palabras",
              text: "Descripcion practica max 15 palabras.",
              image_prompt: "An elegant vertical slide poster... clean cinematic background with subtle dark contrast overlay, uniform medium-large number header '01.' (consistent typography size), readable clear white text containing exactly: '01. Title. Description...'"
            }
          ],
          final_message: {
            title: "MENSAJE FINAL",
            text: "Frase de reflexion y conclusion poderosa para cerrar el video.",
            image_prompt: "An elegant vertical closing slide poster... clean cinematic background with subtle dark contrast overlay, featuring a powerful final thought centered in clean white typography: 'MENSAJE FINAL: [Text]'. Minimalist and inspiring layout."
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
      if (Array.isArray(parsed.items)) {
        if (parsed.items.length > count) {
          parsed.items = parsed.items.slice(0, count);
        }
        parsed.items.forEach((item: any, i: number) => {
          item.num = String(i + 1).padStart(2, "0");
        });
      }

      // Si no generó final_message, crear uno predeterminado elegante
      if (!parsed.final_message) {
        parsed.final_message = {
          title: "MENSAJE FINAL",
          text: parsed.cta || "El cambio real no empieza cuando sabes qué hacer, sino cuando decides aplicarlo todos los días.",
          image_prompt: `An elegant vertical closing slide poster... clean cinematic background with subtle dark contrast overlay, featuring a powerful final takeaway centered in clean white typography: 'MENSAJE FINAL: ${parsed.cta || "Aplica esto en tu vida"}'. Minimalist and inspiring layout.`
        };
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
        // Sanitizar el texto para que NUNCA diga "01", "02", "Punto 01", etc.
        let sanitized = parsed.narration_script;
        // Reemplazar patrones como "01.", "01:", "01 -", "Punto 01", "Punto 1", "Punto número 1" por "Número uno:"
        Object.entries(NUMBER_WORDS).forEach(([numStr, word]) => {
          const n = Number(numStr);
          const pad = String(n).padStart(2, "0");
          // Reemplaza "Punto número 01:", "Punto 01:", "Número 01:", "01.", "01:"
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

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating infographic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
