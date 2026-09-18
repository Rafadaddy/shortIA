export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { mode, topic, characterRef, stepCount } = requestBody;

    const count = stepCount ? parseInt(stepCount) : 8;
    let prompt = "";

    if (mode === "ideas") {
      prompt = `Eres un estratega de contenido viral en formato corto para YouTube Shorts / TikTok. Genera 10 títulos de temas de video altamente atractivos (con alto potencial de clics) para un canal que se enfoca en:
- Curiosidad extrema
- "¿Cuánto es demasiado?"
- Límites humanos
- Objetos cotidianos, comida, hábitos o sustancias llevadas a extremos absurdos o peligrosos

REGLAS:
- Títulos cortos, impactantes, despertar curiosidad
- Usa frases dramáticas como: "¿Cuánto ___ acabaría contigo?", "¿Puede ___ matarte?", "¿Qué pasa si ___?"
- Haz que el tema parezca peligroso pero educativo
- Cada título en 1 línea con 1-2 emojis y hashtags

Responde SOLO con un JSON válido:
{
  "ideas": ["Título 1 con #hashtags", "Título 2 con #hashtags"]
}`;
    } else if (mode === "script") {
      prompt = `Eres un guionista profesional de YouTube Shorts, creando videos altamente atractivos, impulsados por la curiosidad, animados en 3D.
Escribe un guion de 200-250 palabras para el tema: "${topic}"

REGLAS PARA EL GUION:
GANCHO: Empieza con un gancho de una frase (Ej. "¿Cuánta azúcar puede matarte?").
ETIQUETAS DE PASO: Cada paso debe etiquetarse exactamente con la cantidad, unidad o tiempo (Ej. "Día 3", "Una Taza", "Minuto 5"). No agregues la palabra "Paso".
ESTRUCTURA: Al menos ${count} pasos escalonados.
CLÍMAX: Termina con el límite fatal o extremo.

Responde SOLO con un JSON válido:
{
  "title": "Título del video",
  "script": "El gancho inicial\n\nEtiquetaDelPaso 1\nNarración...\n\nEtiquetaDelPaso 2\nNarración..."
}`;
    } else if (mode === "images") {
      // PRE-SPLIT LOGIC IF APPLICABLE? Actually, the timeline relies on parsing steps. We can let the prompt do it, or we can just send the script.
      // The timeline generator uses `characterRef` as the script text.
      prompt = `Eres un director de arte y visualización médica 3D.
Genera prompts de imagen, video y metadata para visualizar la línea de tiempo de este guion:

GUION:
${characterRef}

�¯ PERSONAJE DE REFERENCIA (ESTILO OBLIGATORIO):
- Figura humana hiperrealista 3D CGI
- Piel transparente intacta similar al vidrio donde se ve el esqueleto completo
- Exactamente 2 globos oculares realistas en las cuencas (mirando al frente)

�¯ FONDO Y POSTURA (¡NUEVAS REGLAS!):
- El entorno (fondo) DEBE SER DINÁMICO Y ESTRICTAMENTE RELACIONADO A LA ESCENA. Si el texto habla de sal, el personaje está en una cocina o un salar. Si habla de insomnio, está en una cama o habitación oscura. Si habla de sol, está en un desierto. ¡CERO FONDOS MORADOS a menos que sea un vacío abstracto!
- La postura DEBE SER DINÁMICA. El personaje puede estar de pie, acostado, cocinando, gateando o sentado, dependiendo de lo que pase en el guion.
- La iluminación debe coincidir con el entorno.

�¯ REGLA DE ACCIÓN: Cada paso muestra el deterioro progresivo. Muestra los efectos que menciona el guion en el personaje transparente.

FORMATO DE IMAGEN (Ejemplo dinámico):
"Hyper-realistic 3D CGI human figure with intact transparent glass-like skin over skeleton, exactly two eyeballs, [Postura: standing/laying/sitting], interacting with [Objeto relacionado], located in a [ENTORNO DINÁMICO: dark bedroom, modern kitchen, desert], [efectos físicos del guion], dramatic lighting. --ar 9:16"

FORMATO DE VIDEO (Animación del movimiento en ese mismo entorno):
"3-6 sec vertical: [misma descripción de personaje y entorno]. [Acción/Movimiento]. Camera [push-in/shake]."

� DATOS DE PUBLICACIÓN (OBLIGATORIOS):
- caption: Texto para redes (30-50 palabras)
- hashtags: Array de 5 hashtags
- music_recommendation: Qué tipo de música usar

Responde SOLO con un JSON válido:
{
  "reference_prompt": "Prompt de personaje base transparente",
  "caption": "Texto persuasivo para redes",
  "music_recommendation": "Música sugerida (ej. Dark synthwave suspense)",
  "hashtags": ["#curiosidades", "#3d", "#cuerpo"],
  "timeline": [
    {
      "step_name": "Etiqueta del paso (Ej: Día 1)",
      "image_prompt": "Prompt de imagen",
      "video_prompt": "Prompt de video"
    }
  ]
}`;
    } else if (mode === "single_prompt") {
      const { step_name, narration, prompt_type, existing_image_prompt } = requestBody;
      
      if (prompt_type === "image") {
        prompt = `Regenera SOLO el prompt de imagen para la escena: ${step_name} - ${narration}
REGLAS: Personaje de piel transparente hiperrealista. ENTORNO Y POSTURA DINÁMICA relacionada a la escena (no fondo morado, no siempre sentado).
Prompt anterior: ${existing_image_prompt}

Responde SOLO con JSON válido:
{ "image_prompt": "El nuevo prompt en inglés..." }`;
      } else {
        prompt = `Regenera SOLO el prompt de video para la escena: ${step_name} - ${narration}
Prompt anterior: ${existing_image_prompt}
REGLAS: Versión animada (3-6s) de la imagen en un ENTORNO DINÁMICO y Postura relacionada a la escena.

Responde SOLO con JSON válido:
{ "video_prompt": "El nuevo prompt de video en inglés..." }`;
      }
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: mode === "script" ? 0.9 : 0.75 });
    
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    
    const data = JSON.parse(cleanJson.trim());
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error generating timeline:", error);
    return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
  }
}
