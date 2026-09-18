const fs = require('fs');

const filePath = 'src/app/api/generate-motivational/route.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const oldBlock = `    } else if (mode === "full_from_script") {
      const scenesTemplate = Array.from({ length: count }).map((_, i) => \`{
        "scene_number": \${i + 1},
        "narration": "Línea exacta del guion que corresponde a esta escena...",
        "visual_concept": "Qué se ve en pantalla...",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt...",
        "duration": "~10s"
      }\`).join(',\\n      ');

      prompt = \`Eres un director visual experto en crear videos virales para TikTok y Shorts.
El usuario ya aprobó el siguiente guion:
"\${current_script}"

TU TAREA MATEMÁTICA ESTRICTA:
1. Divide el guion en EXACTAMENTE \${count} escenas. ¡ESTO ES UNA REGLA MATEMÁTICA INQUEBRANTABLE!
   - Si el guion es muy corto, pon menos palabras por escena, pero NO reduzcas el número de escenas. 
   - El arreglo JSON "scenes" DEBE tener \${count} elementos físicos. Ni uno más, ni uno menos.
2. Genera los prompts visuales para cada escena.
3. Genera la metadata de publicación.

Estilo Visual: "\${requestedStyle}"
Duración por escena: \${requestedDuration}

REGLAS PARA LOS PROMPTS:
- Cada escena visual debe ser vertical (9:16).
- \${styleInstruction}
- image_prompt: Prompt MUY DETALLADO en inglés (mínimo 30 palabras). [Sujeto] + [Entorno] + [Iluminación] + [Cámara] + [Calidad].
- animation_prompt: Prompt en inglés para animar el video (Runway/Veo3).

🚀 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- ES ESTRICTAMENTE OBLIGATORIO generar los campos "caption", "music_recommendation" y "hashtags" en la respuesta JSON.
- "caption": Texto para redes sociales (30-50 palabras).
- "music_recommendation": Pista de fondo ideal.
- "hashtags": Array de 5 a 8 hashtags.

Responde SOLO con un JSON válido:
{
  "title": "Título impactante del video",
  "full_narration": "El guion completo intacto",
  "scenes": [
      \${scenesTemplate}
    ],
  "caption": "El texto persuasivo para redes sociales...",
  "music_recommendation": "Tipo de música sugerida",
  "hashtags": ["#motivacion", "#desarrollopersonal", "#frases"]
}\`;
    }`;

const newBlock = `    } else if (mode === "full_from_script") {
      // BACKEND PRE-SPLITTING FOR 100% RELIABLE SCENE COUNT
      const sentences = current_script.split(/(?<=[.?!])\\s+/).filter((s: string) => s.trim().length > 0);
      const preSplitScenes = Array.from({ length: count }, () => [] as string[]);
      
      // Distribute sentences as evenly as possible across the requested scene count
      if (sentences.length > 0) {
        sentences.forEach((s: string, i: number) => {
            const index = Math.min(Math.floor(i / (sentences.length / count)), count - 1);
            preSplitScenes[index].push(s);
        });
      } else {
        preSplitScenes[0].push(current_script);
      }

      const scenesTextBlocks = preSplitScenes.map((sentencesArr, i) => {
        return \`ESCENA \${i + 1} NARRACIÓN: "\${sentencesArr.join(' ')}"\`;
      }).join('\\n\\n');

      const scenesTemplate = Array.from({ length: count }).map((_, i) => \`{
        "scene_number": \${i + 1},
        "narration": "Texto exacto de la Escena \${i + 1}",
        "visual_concept": "Qué se ve en pantalla...",
        "image_prompt": "English prompt...",
        "animation_prompt": "English animation prompt...",
        "duration": "~10s"
      }\`).join(',\\n      ');

      prompt = \`Eres un director visual experto en crear videos virales para TikTok y Shorts.
El usuario ya aprobó el guion. YO, el sistema, ya he dividido el guion en EXACTAMENTE \${count} escenas para ti.

AQUÍ ESTÁN TUS ESCENAS PRE-DIVIDIDAS (NO LAS ALTERES, USA ESTE TEXTO EXACTO PARA CADA "narration"):
\${scenesTextBlocks}

TU TAREA:
1. Toma cada una de las \${count} escenas que te di arriba.
2. Genera los prompts visuales para ilustrar cada escena.
3. Genera la metadata de publicación.

Estilo Visual: "\${requestedStyle}"
Duración por escena: \${requestedDuration}

REGLAS PARA LOS PROMPTS:
- Cada escena visual debe ser vertical (9:16).
- \${styleInstruction}
- image_prompt: Prompt MUY DETALLADO en inglés (mínimo 30 palabras). [Sujeto] + [Entorno] + [Iluminación] + [Cámara] + [Calidad].
- animation_prompt: Prompt en inglés para animar el video (Runway/Veo3).

🚀 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- "caption": Texto para redes sociales (30-50 palabras).
- "music_recommendation": Pista de fondo ideal.
- "hashtags": Array de 5 a 8 hashtags.

Responde SOLO con un JSON válido:
{
  "title": "Título impactante del video",
  "full_narration": "El guion completo intacto",
  "scenes": [
      \${scenesTemplate}
    ],
  "caption": "El texto persuasivo para redes sociales...",
  "music_recommendation": "Tipo de música sugerida",
  "hashtags": ["#motivacion", "#desarrollopersonal", "#frases"]
}\`;
    }`;

// First check if oldBlock exactly matches
if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
} else {
    // If not, we will use a more resilient regex replacement
    const startRegex = /\} else if \(mode === "full_from_script"\) \{/;
    const endRegex = /\} else if \(mode === "single_prompt"\) \{/;
    
    const startIndex = content.search(startRegex);
    const endIndex = content.search(endRegex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        content = content.substring(0, startIndex) + newBlock + "\\n" + content.substring(endIndex);
    } else {
        console.log("COULD NOT FIND BLOCK TO REPLACE!");
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed backend pre-splitting');
