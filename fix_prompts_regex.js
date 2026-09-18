const fs = require('fs');

function fixStructure(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Strip out the ESTRUCTURA: block from motivational
  if (filePath.includes('generate-motivational')) {
    content = content.replace(/ESTRUCTURA:[\s\S]*?4\. CIERRE.*?\n/g, 'ESTRUCTURA (A DISTRIBUIR A LO LARGO DE LAS ${count} ESCENAS SOLICITADAS):\n  El arco narrativo debe contener un Gancho, Desarrollo, Climax y Cierre, pero DEBES fragmentar y distribuir todo este arco en EXACTAMENTE ${count} ESCENAS. No comprimas la historia, alárgala para cumplir el número exacto de escenas.\n');
  }

  // Same for scenes array JSON example
  content = content.replace(/"scenes": \[\s*\{\s*"scene_number": 1,[\s\S]*?\}\s*\]/g, `"scenes": [\n      // OBLIGATORIO: ESTE ARREGLO DEBE CONTENER EXACTAMENTE \${count} OBJETOS (ESCENAS).\n      {\n        "scene_number": 1,\n        "narration": "Línea de la narración...",\n        "visual_concept": "Qué se ve en pantalla...",\n        "image_prompt": "Prompt en inglés para imagen...",\n        "animation_prompt": "Prompt en inglés para animación...",\n        "duration": "~10s"\n      }\n      // ... repite hasta la escena \${count}\n    ]`);

  fs.writeFileSync(filePath, content, 'utf-8');
}

fixStructure('src/app/api/generate-motivational/route.ts');
