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
        `   - Tamaño de letra: Proporción armónica y estilizada, dejando mucho aire y espacio negativo (clean breathing room, elegant medium-sized typography, not overcrowded).`,
        `   - Fondo: Coherente con el estilo ("${visualStyle}"), si es paisaje con velo oscuro y texto en blanco brillante con contraste 100% legible.`,
        `9. Genera un campo 'narration_script' con el GUION COMPLETO DE LOCUCIÓN listo para que un narrador lo lea de corrido, diciendo punto por punto de forma fluida y natural (ejemplo: "Aquí tienes ${title}. Punto número uno: [Label], [Explicación ampliada y cautivadora]. Punto número dos: [Label]...").`,
        "",
        `Responde SOLO con JSON valido. El array 'items' DEBE tener exactamente ${count} objetos:`,
        JSON.stringify({
          title,
          category: "CATEGORIA EN MAYUSCULAS",
          subhook: "Frase gancho pequenya",
          narration_script: `Aquí tienes ${title}.\n\nNúmero uno: ...\nNúmero dos: ...`,
          image_prompt: `A highly aesthetic vertical cover poster about [THEME], [STYLE]. Clean cinematic background with a subtle dark gradient overlay, featuring ONLY this single title text centered in clean medium-sized white typography: '${title}'. No lists, no item numbers, no extra text, ultra-clean editorial layout.`,
          items: [
            {
              num: "01",
              emoji: "emoji",
              label: "Titulo corto 3-6 palabras",
              text: "Descripcion practica max 15 palabras.",
              image_prompt: "An elegant vertical slide poster... clean cinematic background with subtle dark contrast overlay, medium-sized readable typography with plenty of breathing room, containing exactly: '01. Title. Description...'"
            }
          ],
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

      // Si no generó narration_script o vino vacío, construirlo automáticamente
      if (!parsed.narration_script && Array.isArray(parsed.items)) {
        let script = `${parsed.title}. ${parsed.subhook ? parsed.subhook + "." : ""}\n\n`;
        parsed.items.forEach((item: any, i: number) => {
          script += `Punto número ${i + 1}: ${item.label}. ${item.text}\n\n`;
        });
        if (parsed.cta) {
          script += `${parsed.cta}`;
        }
        parsed.narration_script = script.trim();
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
