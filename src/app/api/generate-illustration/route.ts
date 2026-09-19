export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, generateImageWithGemini } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { niche, idea, format, style, textSurface, mode, existing_prompt, suggested_phrase } = requestBody;

    const requestedFormat = format || "Vertical (9:16)";
    const requestedStyle = style || "Cinemático Oscuro (Motivación)";
    let aspectRatioFlag = "--ar 9:16";
    if (requestedFormat.includes("3:4")) aspectRatioFlag = "--ar 3:4";
    if (requestedFormat.includes("16:9")) aspectRatioFlag = "--ar 16:9";
    if (requestedFormat.includes("1:1")) aspectRatioFlag = "--ar 1:1";

    let styleInstruction = "";
    if (requestedStyle.includes("Cuento / Fábula Moderna")) {
      styleInstruction = "Illustration style of a modern children's book, soft watercolor and ink textures, pastel colors, whimsical atmosphere. Characters or animals acting out a powerful visual metaphor. Simple background with negative space at the top or side for text. High quality, detailed, emotional expression.";
    } else if (requestedStyle.includes("Foto Realista Urbana")) {
      styleInstruction = "Realistic cinematic photography, golden hour lighting, urban street corner or textured wall background. Warm sunset tones, shadows of trees. Minimalist composition with generous negative space on the wall/scene for bold typography. Photorealistic, 8k, depth of field.";
    } else if (requestedStyle.includes("Pintura Artística / Sarcasmo")) {
      styleInstruction = "Digital oil painting style, thick visible brushstrokes, expressive texture. Humanoid animal or relatable figure holding an everyday object (like a coffee mug), looking tired, sarcastic, or introspective. Dark warm background (orange, brown, dark tones). Moody lighting, dramatic shadows. Centered composition with negative space.";
    } else if (requestedStyle.includes("Minimalista / Cartoon Relatable")) {
      styleInstruction = "Minimalist vector illustration, clean white background. A cute simple round character (blob style) in a relatable adult situation. Flat colors, soft subtle shading. Large empty negative space above or around the subject for text. Viral webcomic aesthetic.";
    } else if (requestedStyle.includes("Metáfora Cinematográfica Oscura")) {
      styleInstruction = "Hyper-realistic cinematic shot, National Geographic style but stylized and metaphorical. A powerful animal or figure in an introspective posture on an edge or natural setting. In the background or shadows, subtle threatening or symbolic elements. Sunset or stormy sky lighting. Dramatic atmosphere, emotional storytelling, space at top for serif text.";
    } else if (requestedStyle.includes("Cute 3D / Pixar Vibe")) {
      styleInstruction = "3D render style like Pixar animation, C4D, Octane render. A cute fluffy animal or character wearing modern clothing or doing a human activity. Bright natural soft lighting, cozy or green field background. Adorable big expressive eyes, high detail fur texture, space above for text.";
    } else if (requestedStyle.includes("Cinemático Oscuro")) {
      styleInstruction = "A dark, cinematic, high-contrast, moody photography style. Dramatic shadows, silhouettes, glowing light. Generous negative space for bold typography. Masterpiece, 8k, photorealistic.";
    } else {
      styleInstruction = `A high quality visual artwork in the style of ${requestedStyle}, with intentional negative space for overlaying text.`;
    }

    let prompt = "";

    if (mode === "single_prompt") {
      prompt = `
Eres un director de arte experto en crear contenido visual viral para redes sociales.
Regenera SOLO el prompt de imagen para esta ilustración.

Nicho: "${niche}"
Estilo: "${requestedStyle}"
Frase original: "${suggested_phrase}"
Prompt anterior (NO repetir): "${existing_prompt}"

REGLAS:
- Genera un prompt completamente diferente al anterior
- Mantener la frase "${suggested_phrase}" en español dentro del prompt
- Mantener el estilo visual y formato solicitados
- El prompt debe estar en inglés

Responde SOLO con un JSON válido:
{
  "image_prompt": "El nuevo prompt visual en inglés..."
}
`;
    } else if (mode === "titles") {
      const angles = [
        "situaciones incómodas de la vida real que nadie se atreve a decir en voz alta",
        "paradojas psicológicas y verdades crudas poco conocidas",
        "metáforas visuales impactantes y analogías poéticas o crudas",
        "frases cortantes y reflexiones anti-cliché que sacuden la mente",
        "perspectivas contrarias al pensamiento común o sabiduría popular",
        "momentos de quiebre emocional, superación silenciosa o disciplina dura",
        "ironía fina sobre la sociedad moderna, la soledad y las ambiciones"
      ];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      prompt = `
Eres un director de arte y estratega de contenido viral de clase mundial.
El usuario quiere ideas para IMÁGENES VIRALES con texto integrado sobre el nicho: "${niche}".
${idea ? `Dirección específica del usuario: "${idea}"` : `Ángulo creativo para esta tanda: ${randomAngle}.`}

Semilla de variedad única: ${seed}

REGLAS DE MÁXIMA ORIGINALIDAD, LEGALIDAD Y SEGURIDAD:
1. PROHIBIDO TERMINANTEMENTE proponer o sugerir actividades ilegales, fraudes, hackeos, delitos o venta de información privada.
2. POLÍTICA DE SEGURIDAD PARA IMÁGENES (DALL-E / MIDJOURNEY SAFE): Los conceptos y frases NUNCA deben contener palabras que activen los filtros de censura de las IA (prohibido palabras como: "robo", "ilegal", "droga", "ciberataque", "manipulación financiera").
3. ENFOQUE DEFENSIVO Y ÉTICO: Si tocas psicología oscura o relaciones, enfócalo en cómo defenderse de manipuladores, verdades sobre el autocontrol, la mente y la resiliencia personal.
4. PROHIBIDO GENERAR CLICHÉS O FRASES TÍPICAS DE AUTOAYUDA (como 'El silencio es poder', 'Tu mente es tu límite', 'No confíes en nadie', 'Sé tu propia luz', etc.).
5. Cada idea debe ser FRESCA, ESPECÍFICA y con un ángulo que despierte curiosidad inmediata.
6. Varía los tonos: incluye ideas provocadoras, reflexivas, poéticas, intrigantes y crudas.
7. Genera exactamente 10 títulos/conceptos completamente distintos entre sí, únicos y 100% seguros para monetizar.

Responde SOLO con un JSON válido en este formato:
{
  "titles": [
    "Idea fresca 1...",
    "Idea fresca 2...",
    "Idea fresca 3...",
    "Idea fresca 4...",
    "Idea fresca 5...",
    "Idea fresca 6...",
    "Idea fresca 7...",
    "Idea fresca 8...",
    "Idea fresca 9...",
    "Idea fresca 10..."
  ]
}
`;
      const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.95 });
      const clean = jsonText.replace(/^[\s\S]*?```(?:json)?\n?|```\s*$/g, "").trim();
      return NextResponse.json(JSON.parse(clean));
    } else {
      prompt = `
Eres un experto director de arte y creador de contenido viral de clase mundial para redes sociales (Instagram, TikTok, Facebook).
Tu especialidad absoluta es crear imágenes que combinan una METÁFORA VISUAL POTENTE con un mensaje de texto corto e impactante. 
LA IMAGEN DEBE CONTAR LA HISTORIA POR SÍ MISMA ANTES DE LEER EL TEXTO.
Genera prompts detallados para crear estas imágenes usando IA (Midjourney/DALL-E/Flux) y sugiere el texto exacto.

CONTEXTO:
- NICHO / TEMÁTICA: "${niche}"
- ESTILO VISUAL SOLICITADO: "${requestedStyle}"
- GUÍA DE ESTILO TÉCNICO: ${styleInstruction}
${idea ? `- IDEA / TEMA ESPECÍFICO DEL USUARIO: "${idea}"` : `- Si no hay idea específica, genera una metáfora visual alucinante y viral sobre este nicho.`}
- FORMATO SOLICITADO: ${requestedFormat} (${aspectRatioFlag})

METODOLOGÍA DE CREACIÓN:
1. METÁFORA VISUAL (La imagen habla por sí sola):
   - Plantea una metáfora visual potente (ej. animales con expresiones humanas u objetos cotidianos, contrastes entre sombras y luz, reflejos distorsionados que revelan verdades, objetos simbólicos).
   - Humanización: Si usas animales o personajes, dales gestos y expresiones emocionales humanas profundas (sarcasmo, cansancio, resiliencia, ternura).

2. FÓRMULAS DE TEXTO VIRAL PARA EL COPY ("suggested_phrase"):
   Aplica una de estas estructuras probadas para crear una frase inolvidable (5 a 15 palabras máximo):
   - La Paradoja: "Cuando [SITUACIÓN MALA], [RESULTADO BUENO/IRÓNICO]." (Ej: "Cuando el Wi-Fi se cae, el amor sigue conectado.")
   - La Verdad Incómoda: "No es que [EXCUSA], es que [REALIDAD DURA]." (Ej: "No me alejo para enseñarte una lección, es porque ya aprendí la mía.")
   - El Consejo Directo: "[ACCIÓN]. Eso se llama [CONCEPTO CLAVE]." (Ej: "Saber llegar a tus clientes. Eso se llama ESTRATEGIA.")
   - La Metáfora Animal o Simbólica: "Ten cuidado con [SITUACIÓN/PERSONA]... recuerda que los [SÍMBOLO] se alegran cuando ven [DEBILIDAD]."
   - El Estado de Ánimo o Ironía: "Mi [ASPECTO DE VIDA] es tan [EXTREMO] que [CONSECUENCIA]."

3. REGLAS DE ORO DE COMPOSICIÓN Y TIPOGRAFÍA (OBLIGATORIO EN EL PROMPT DE IA):
   - TEXTO INTEGRADO OBLIGATORIO: El prompt para el generador de imágenes (image_prompt) DEBE incluir explícitamente la orden de renderizar la frase "${suggested_phrase}" dentro de la imagen. 
     Ejemplo de indicación en inglés dentro del prompt: "There is bold, clean typography placed in the negative space that reads: '[FRASE_EXACTA_EN_ESPAÑOL]'. The text has high contrast and is readable."
   - Espacio Negativo OBLIGATORIO: La escena DEBE reservar un espacio limpio (arriba, a un lado o abajo) para colocar esa tipografía sin tapar al sujeto.
   - Jerarquía Visual: El ojo debe ir primero a la emoción del personaje/metáfora, luego al texto, luego a los detalles del entorno.
   - Contraste: Fondos oscuros usan texto blanco/dorado/rojo. Fondos claros usan texto oscuro/negro.
   - SEGURIDAD Y CENSURA CERO: PROHIBIDO usar palabras que activen los filtros de censura de DALL-E / Midjourney (prohibido: "robo", "ilegal", "droga", "ciberataque", "armas", "hackeo", "manipulación financiera"). Convierte conceptos oscuros en metáforas elegantes (ej: sombras misteriosas, máscaras sutiles, niebla, laberintos).

ESTRUCTURA DE RESPUESTA JSON:
1. "title": Título corto y atractivo del concepto.
2. "suggested_phrase": La frase exacta en español con una de las fórmulas virales (resalta mentalmente las 1-2 palabras clave).
3. "image_prompt": Prompt detallado en INGLÉS listo para Midjourney v6 / DALL-E 3 / Flux / Imagen 3.
   ESTRUCTURA OBLIGATORIA DEL PROMPT:
   "[Descripción cinematográfica detallada del sujeto, su emoción y la metáfora visual]. ${styleInstruction} Located in the clean negative space (top or side), there is large, bold typography cleanly displaying the text: \"[SUGGESTED_PHRASE_EN_ESPAÑOL]\". Perfect typography rendering, highly readable, sharp contrast. ${aspectRatioFlag}"
4. "caption": Copy listo para publicar en Instagram/TikTok/FB con gancho reflexivo, 2-3 párrafos cortos, emojis y llamada a comentar o compartir.

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "...",
  "suggested_phrase": "...",
  "image_prompt": "...",
  "caption": "..."
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.8 });
    const data = JSON.parse(jsonText);

    // Si tenemos una key de Gemini (ya sea en env o en el cliente), intentamos generar la imagen real
    // Esto evita que solo te devuelva texto y te da la imagen final.
    const geminiKey = process.env.GEMINI_API_KEY || (requestBody._provider?.providerId === "google" ? requestBody._provider.apiKey : null);
    
    if (geminiKey && data.image_prompt) {
      try {
        console.log("[Ilustraciones] Generando imagen con Gemini Imagen 3...");
        // Usamos aspectRatioFlag (ej: "--ar 9:16") para enviarle el formato a Gemini
        const base64Image = await generateImageWithGemini(data.image_prompt, geminiKey, aspectRatioFlag);
        data.generated_image_base64 = base64Image;
        console.log("[Ilustraciones] ¡Imagen generada con éxito!");
      } catch (e) {
        console.error("[Ilustraciones] Error al generar la imagen con Gemini:", e);
      }
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error generating illustration:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
