const fs = require('fs');

let content = fs.readFileSync('src/app/api/generate-illustration/route.ts', 'utf8');

const regex = /} else {\s+prompt = `[\s\S]*?Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:[\s\S]*?`;\s+}/;

const newStr = `} else {
      prompt = \`
Eres un director de arte experto en crear contenido visual viral para redes sociales.
Tu especialidad es generar imágenes impactantes que INCLUYEN TEXTO DIRECTAMENTE EN LA COMPOSICIÓN.

CONTEXTO: Genera una imagen viral para redes sociales con texto integrado.

NICHO / TEMÁTICA: "\${niche}"
ESTILO VISUAL SOLICITADO: "\${requestedStyle}"
\${idea ? \`IDEA ESPECÍFICA: "\${idea}"\` : \`Genera una idea al azar súper original y viral basada en este nicho.\`}
FORMATO: \${requestedFormat} (\${aspectRatioFlag})

PARÁMETROS VISUALES A DEFINIR POR TI (para maximizar viralidad):
- TONO DEL MENSAJE: Selecciona el mejor tono para esto (Motivador, Provocador, Reflexivo, Sarcástico, Inspirador o Directo).
- AUDIENCIA: Define a quién va dirigido (Edad, intereses, dolor principal, aspiración).
- ELEMENTOS VISUALES:
  * Ambiente: Selecciona (Urbano / Naturaleza / Interior / Abstracto)
  * Paleta de Colores: Selecciona (Oscuro / Cálido / Frío / Neón / Pastel)
  * Composición: Selecciona (Persona sola / Grupo / Objeto simbólico / Paisaje)

RESTRICCIONES IMPORTANTES:
- Máximo 10-15 palabras en el texto.
- Impacto visual en los primeros 3 segundos.
- Debe ser muy compartible (que genere identificación o aspiración).

INSTRUCCIONES DE SALIDA:
1. "title": Un título corto de la idea.
2. "suggested_phrase": La frase exacta que irá escrita DENTRO de la imagen. Debe ser CORTA (5-15 palabras máximo), brutalmente impactante, ingeniosa o motivacional. Usa un español neutro.
3. "image_prompt": EL PROMPT EN INGLÉS PARA GENERAR LA IMAGEN EN DALL-E 3 O MIDJOURNEY. 
ESTRUCTURA ESTRICTA DEL PROMPT:
"[Describe exactamente la escena principal y el sujeto integrando el ambiente, paleta y composición que elegiste]. \${styleInstruction} Integrated into the artwork, there is bold typography that perfectly reads: '[SUGGESTED_PHRASE_EN_ESPAÑOL]'. The text should be \${textSurfaceInstruction}. \${aspectRatioFlag}"
4. "caption": Un pequeño texto para publicar junto a la imagen en redes sociales (pie de foto). Debe ser empático o motivacional (20-50 palabras). Usa emojis 🔥🚀. SIN etiquetas estructurales.

IMPORTANTE: El image_prompt DEBE estar en inglés, pero la FRASE que le pides que escriba ("...") DEBE ESTAR EN EL ESPAÑOL EXACTO que generaste en suggested_phrase.

Responde ÚNICA Y EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
{
  "title": "...",
  "suggested_phrase": "...",
  "image_prompt": "...",
  "caption": "..."
}
\`;
    }`;

if (regex.test(content)) {
  content = content.replace(regex, newStr);
  fs.writeFileSync('src/app/api/generate-illustration/route.ts', content, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Target string not found');
}
