import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { mode, topic, characterRef, stepCount } = await req.json();

    const count = stepCount || 8;
    let prompt = "";

    if (mode === "ideas") {
      prompt = `
Eres un estratega de contenido viral en formato corto para YouTube Shorts / TikTok. Genera 10 títulos de temas de video altamente atractivos (con alto potencial de clics) para un canal que se enfoca en:

- Curiosidad extrema
- "¿Cuánto es demasiado?"
- Límites humanos
- Objetos cotidianos, comida, hábitos o sustancias llevadas a extremos absurdos o peligrosos

REGLAS:
- Títulos cortos, impactantes, despertar curiosidad
- Usa frases dramáticas como: "¿Cuánto ___ acabaría contigo?", "¿Puede ___ matarte?", "¿Qué pasa si ___?"
- Haz que el tema parezca peligroso pero educativo
- Contenido basado en ciencia / animación 3D
- Cada título en 1 línea
- Usa 1-2 emojis relevantes
- Termina con 3-5 hashtags: #interesante #datos #3d #ciencia #comida #naturaleza #animacion #shorts

Ejemplos del tono (NO reutilizar):
¿Cuánta agua acabaría contigo? 💦
¿Puede el sol quemar tus ojos? 🔥
¿Cuántas bebidas energéticas son demasiadas? 😵

Responde SOLO con un JSON válido:
{
  "ideas": ["Título 1 con #hashtags", "Título 2 con #hashtags", ... (10 ideas)"]
}
`;
    } else if (mode === "script") {      prompt = `
Eres un guionista profesional de YouTube Shorts, creando videos altamente atractivos, impulsados por la curiosidad, animados en 3D o narrados.

Escribe un guion de 200-250 palabras para el tema: "${topic}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 REGLAS PARA EL GUION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GANCHO:
Empieza solo con un gancho de una sola frase. Sin frases extra ni comentarios.
Ejemplos de gancho:
- "¿Cuánto tiempo puede aguantar tu cuerpo sin dormir?"
- "¿Cuántos Cheetos Picantes harían falta para acabar contigo?"
- "¿Qué pasaría si dejaras de parpadear?"

ETIQUETAS DE PASO:
Cada paso debe etiquetarse exactamente con la cantidad, unidad o tiempo relevante para el escenario.
Ejemplos: "Bolsa 1", "Día 3", "Una Taza", "Minuto 5", "Hora 2"
NO agregues palabras como "Nivel", "Paso", "–", "Nivel 1", "Paso 1"

ESCALADA:
Cada paso debe aumentar el riesgo y la intensidad.

ESTRUCTURA DE ORACIONES:
- Usa oraciones largas, fluidas y descriptivas
- Intercala oraciones dramáticas más cortas
- Múltiples detalles sensoriales en una sola frase
- Evita que todas las frases sean muy cortas
- Ritmo natural e inmersivo

CLÍMAX:
Termina con el límite máximo extremo, fatal o imposible.

TONO:
Tiempo presente, urgente, inmersivo. Frases dramáticas ocasionales.

CONTEO: 200-250 palabras.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con un JSON válido:
{
  "title": "Título del video que genere curiosidad",
  "script": "El gancho inicial\n\nEtiquetaDelPaso 1\nNarración...\n\nEtiquetaDelPaso 2\nNarración...\n\n...(todos los pasos)"
}
`;
    } else if (mode === "images") {
      prompt = `
Eres un director de visualización médica y narrador visual para YouTube Shorts.

Genera prompts de imagen e prompts de video que sigan visualmente la línea de tiempo de un guion, mostrando el deterioro físico y mental progresivo de un personaje de referencia único e idéntico.

GUION A VISUALIZAR:
${characterRef}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 REGLA DE FONDO GLOBAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fondo morado sólido y plano en CADA imagen y video.
Sin degradados, texturas ni entornos.
El fondo debe permanecer claramente visible detrás de todos los objetos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧍 SOLO OBJETOS PERMITIDOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Silla, sofá, bañera, mesa, sombra en el piso debajo de los muebles, tazas, latas, envoltorios, controles, libros, pantallas.
La utilería debe coincidir con el escenario.
La utilería debe estar físicamente apoyada (con gravedad).
No se permiten objetos extra.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 PERSONAJE DE REFERENCIA (NO CAMBIAR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUERPO Y PIEL:
- Figura humana hiperrealista 3D CGI
- Estructura esquelética completa visible A TRAVÉS de piel transparente intacta
- Capa de piel fina, transparente, similar al vidrio
- La piel es continua, ligeramente brillante, silicona médica / resina transparente
- Los huesos son visibles debajo pero NO expuestos
- Color de hueso natural blanco roto / beige
- Esto NO es un esqueleto desnudo

CRÁNEO Y OJOS (BLOQUEO DURO):
- Cráneo cubierto por piel facial transparente
- Exactamente 2 globos oculares humanos realistas
- Ubicados SOLO dentro de las cuencas oculares
- Mirando al frente, visibles a través de la piel
- Curvatura realista y reflejos sutiles
- Cuencas de ojos NO pueden estar vacías
- Sin dientes expuestos
- Sin otros ojos en ninguna parte del cuerpo

LÍMITES DE ANATOMÍA:
- NO órganos
- NO músculos
- NO venas
- NO intestinos
- NO tejido cardíaco
- Efectos internos SOLO como luz simbólica o neblina

POSICIÓN:
- De frente en todo momento
- Perfectamente centrado
- Sentado según el escenario (bañera, sofá, mesa, etc.)
- Idéntico en todas las imágenes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ EFECTOS VISUALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERNOS (RAYOS X / SUPERPOSICIÓN):
- Cerebro brillando al rojo vivo o parpadeando
- Sangre espesándose y fluyendo lentamente (simbólico)
- Pulmones parcialmente llenos de neblina de fluido translúcido
- Columna vertebral resaltada en rojo para indicar dolor
- Corazón como luz pulsante interna (sin forma de órgano)

EXTERNOS:
- Ojos volviéndose rojo oscuro o temblando
- Piel transparente secándose y agrietándose como cuero viejo
- Columna encorvándose hacia adelante (aún de frente)
- Manos temblando
- Hombros colapsando hacia adentro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 REGLA DE ESTRUCTURA — UNA ACCIÓN = UN PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cada oración, cláusula o escalada en el guion = un prompt.
Incluso dentro de la misma escena:
- Nueva sensación → nuevo prompt
- Nuevo síntoma → nuevo prompt
- Nuevo cambio físico → nuevo prompt
- Nuevo efecto mental → nuevo prompt
Nunca fusiones acciones.
Nunca te saltes pasos.

PRIMERA IMAGEN — ANCLA:
- Representa la primera acción del guion
- Personaje de piel transparente claramente visible
- Postura sentada y utilería correctas
- Fondo morado sólido visible
- Iluminación que define: Transparencia de piel, visibilidad de huesos, postura

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FORMATO DE PROMPT DE IMAGEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Front-facing, centered hyper-realistic 3D CGI human figure with intact transparent skin over skeleton, sitting [postura], natural bone color visible beneath glass-like skin, exactly two visible eyeballs in skull sockets, solid purple background, [utilería del escenario], [efectos internos: brain glow, blood thickening, lung haze], [efectos externos: eye redness, trembling hands, hunched spine], dramatic lighting emphasizing decline. --ar 9:16"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 FORMATO DE PROMPT DE VIDEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El prompt de video debe ser la VERSIÓN ANIMADA del prompt de imagen correspondiente.
Debe describir el MOVIMIENTO de la misma escena, personaje y objetos.

REGLAS PARA COHERENCIA:
- El prompt de video debe empezar con la misma escena que el prompt de imagen
- El personaje debe ser el mismo (misma postura, mismos objetos)
- El movimiento debe ser la EVOLUCIÓN de lo que se describe en la narración
- Si la narración dice "las manos empiezan a temblar", el video muestra las manos temblando
- Si la narración dice "el cerebro se inflama", el video muestra el cerebro pulsando
- Fondo morado sólido SIEMPRE

FORMATO:
"3-6 sec vertical: front-facing 3D CGI human figure with intact transparent skin over skeleton, sitting in [misma postura que imagen]. [Movimiento del personaje según narración]. [Cámara: push-in lento o sacudida sutil]. Solid purple background."

Ejemplo coherente:
Narración: "En el minuto 10, tus manos empiezan a temblar sin control"
Prompt Imagen: "Front-facing 3D CGI human figure with intact transparent skin over skeleton, sitting on chair. Hands resting on knees with slight tremor. Solid purple background..."
Prompt Video: "3-6 sec vertical: front-facing 3D CGI human figure with intact transparent skin over skeleton, sitting on chair. Hands trembling uncontrollably on knees. Brain pulses red. Slow camera push-in. Solid purple background."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con un JSON válido:
{
  "reference_prompt": "Prompt completo para generar el personaje de referencia (una sola imagen que defina al personaje)",
  "timeline": [
    {
      "step_name": "Etiqueta del paso del guion",
      "image_prompt": "Prompt de imagen en inglés con --ar 9:16",
      "video_prompt": "Prompt de video en inglés, 3-6 segundos"
    }
  ]
}
`;
    } else if (mode === "single_prompt") {
      const { step_name, narration, prompt_type, existing_image_prompt } = await req.json();
      
      if (prompt_type === "image") {
        prompt = `
Eres un director de visualización médica. Regenera SOLO el prompt de imagen para esta escena.

CONTEXTO DEL PERSONAJE:
${characterRef}

ESCENA:
Paso: ${step_name}
Narración: ${narration}

REGLAS:
- Fondo morado sólido
- Personaje de piel transparente con esqueleto visible
- Exactamente 2 ojos en las cuencas
- Sentado, de frente, centrado
- Mostrar los efectos físicos que describe la narración
- NO incluir el prompt de video, SOLO imagen
- Formato: "Front-facing, centered hyper-realistic 3D CGI human figure with intact transparent skin over skeleton, sitting [postura], [efectos según narración], solid purple background, dramatic lighting. --ar 9:16"

Responde SOLO con un JSON válido:
{
  "image_prompt": "El prompt de imagen en inglés"
}
`;
      } else {
        prompt = `
Eres un director de visualización médica. Regenera SOLO el prompt de video para esta escena.

CONTEXTO DEL PERSONAJE:
${characterRef}

ESCENA:
Paso: ${step_name}
Narración: ${narration}
Prompt de imagen actual: ${existing_image_prompt}

REGLAS:
- El video debe ser la VERSIÓN ANIMADA del prompt de imagen
- Misma escena, mismo personaje, misma postura
- El movimiento debe ser la EVOLUCIÓN de lo que dice la narración
- Cámara: push-in lento o sacudida sutil
- Fondo morado sólido SIEMPRE
- 3-6 segundos de duración
- NO incluir prompt de imagen, SOLO video

Formato:
"3-6 sec vertical: [misma escena que imagen]. [Movimiento según narración]. Slow camera push-in. Solid purple background."

Responde SOLO con un JSON válido:
{
  "video_prompt": "El prompt de video en inglés"
}
`;
      }
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.85,
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating timeline:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
