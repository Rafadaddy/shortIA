import fs from 'fs';

const routePath = 'src/app/api/generate-comic/route.ts';
let content = fs.readFileSync(routePath, 'utf-8');

// The problematic block:
// - Estilo base: ${styleInstruction}.
// - FORMATO OBLIGATORIO DEL PROMPT DE IMAGEN: "A dramatic, highly realistic and emotional scene of [Descripcin detallada de la escena]. Warm lighting, warm tones (beige, gold, terracotta). Masterpiece, 8k. Integrated into the artwork, there is bold elegant typography reading: '[Texto principal/Diǭlogo en Espaol]'. ${aspectRatioFlag}"

const newPromptBlock = `- Estilo visual solicitado: "\${requestedStyle}".
- Instrucciones obligatorias del estilo visual: \${styleInstruction}.
- FORMATO OBLIGATORIO DEL PROMPT DE IMAGEN:
"[Describe la escena detalladamente siguiendo ESTRICTAMENTE las reglas visuales del estilo solicitado arriba]. Integrated into the artwork, there is bold elegant typography reading: '[Texto principal/Diálogo en Español]'. \${aspectRatioFlag}"
¡IMPORTANTE! NO uses frases como "highly realistic" o "8k masterpiece" si el usuario pidió estilos como Stickman, Dibujo Tierno, Animación 2D, etc. El prompt debe adaptarse 100% al estilo elegido.`;

// Replace the old bad rules that force realistic images
content = content.replace(
  /- Estilo base: \$\{styleInstruction\}\.\r?\n- FORMATO OBLIGATORIO DEL PROMPT DE IMAGEN: "A dramatic, highly realistic and emotional scene of \[Descripción detallada de la escena\]\. Warm lighting, warm tones \(beige, gold, terracotta\)\. Masterpiece, 8k\. Integrated into the artwork, there is bold elegant typography reading: '\[Texto principal\/Diálogo en Español\]'\. \$\{aspectRatioFlag\}"/g,
  newPromptBlock
);

// Fallback regex if precise string replace fails due to encoding
const regexSearch = /- Estilo base: \$\{styleInstruction\}\.[\s\S]*?\$\{aspectRatioFlag\}"/;
if (content.match(regexSearch)) {
    content = content.replace(regexSearch, newPromptBlock);
}

// I should also remove this hardcoded rule just above it:
// - Imágenes realistas, cálidas, emotivas, situaciones cotidianas y reconocibles.
// - Iluminación cálida (atardecer, luz natural, ambientes acogedores), colores tonos cálidos (beige, dorado, terracota, crema).
const realisticRule1 = "- Imágenes realistas, cálidas, emotivas, situaciones cotidianas y reconocibles.\n";
const realisticRule2 = "- Iluminación cálida (atardecer, luz natural, ambientes acogedores), colores tonos cálidos (beige, dorado, terracota, crema).\n";

content = content.replace(/- Imǭgenes realistas, cǭlidas, emotivas, situaciones cotidianas y reconocibles\.\r?\n/g, "");
content = content.replace(/- Iluminacin cǭlida \(atardecer, luz natural, ambientes acogedores\), colores tonos cǭlidos \(beige, dorado, terracota, crema\)\.\r?\n/g, "");

fs.writeFileSync(routePath, content, 'utf-8');
console.log("Fixed Comic API!");
