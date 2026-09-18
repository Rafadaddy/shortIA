const fs = require('fs');

function updatePrompt(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Fix Motivational
  if (filePath.includes('generate-motivational')) {
    code = code.replace(
      /ESTRUCTURA:[\s\S]*?4\. CIERRE.*?\n/,
      'ESTRUCTURA (A DISTRIBUIR A LO LARGO DE LAS ${count} ESCENAS SOLICITADAS):\n  El arco narrativo debe contener un Gancho, Desarrollo, Clímax y Cierre, pero DEBES fragmentar y distribuir todo este arco en EXACTAMENTE ${count} ESCENAS. No comprimas la historia, alárgala para cumplir el número de escenas.\n'
    );
  }

  // Fix Faceless
  if (filePath.includes('generate-faceless')) {
    code = code.replace(
      /Debes generar un guion narrativo completo basado en este tema, con una ESTRUCTURA DE HISTORIA CLARA \(Inicio, Desarrollo, Cl.max, Final\)\./,
      'Debes generar un guion narrativo completo basado en este tema. IMPORTANTE: EL GUION DEBE DIVIDIRSE EN EXACTAMENTE ${count} ESCENAS. Distribuye el arco narrativo (Inicio, Desarrollo, Clímax, Final) a lo largo de las ${count} escenas solicitadas.'
    );
  }

  // General strong hint for scenes array in both
  code = code.replace(
    /"scenes": \[\n\s*\{\n\s*"scene_number": 1,[\s\S]*?\}\n\s*\]/g,
    `"scenes": [\n      // OBLIGATORIO: ESTE ARREGLO DEBE CONTENER EXACTAMENTE \${count} OBJETOS (ESCENAS).\n      {\n        "scene_number": 1,\n        "narration": "Línea de la narración...",\n        "visual_concept": "Qué se ve en pantalla...",\n        "image_prompt": "Prompt en inglés para imagen...",\n        "animation_prompt": "Prompt en inglés para animación...",\n        "duration": "~10s"\n      }\n      // ... repite hasta la escena \${count}\n    ]`
  );

  fs.writeFileSync(filePath, code, 'utf-8');
  console.log('Fixed prompt logic for ' + filePath);
}

updatePrompt('src/app/api/generate-motivational/route.ts');
updatePrompt('src/app/api/generate-faceless/route.ts');
