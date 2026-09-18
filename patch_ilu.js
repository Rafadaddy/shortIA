const fs = require('fs');
let content = fs.readFileSync('src/app/ilustraciones/page.tsx', 'utf8');

// Replace visualStyle select with input + datalist
content = content.replace(
  /<select\s+value=\{visualStyle\}[\s\S]*?onChange=\{\(e\) => setVisualStyle\(e\.target\.value\)\}[\s\S]*?className="([^"]+)"\s*>[\s\S]*?<\/select>/,
  `<input
                type="text"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="Elige o escribe tu propio estilo..."
                list="style-list"
                className="$1"
              />
              <datalist id="style-list">
                <option value="Libre / Cualquier Estilo" />
                <option value="Cinemático Oscuro (Motivación)" />
                <option value="Elegante B&W (Mafia/Luxury)" />
                <option value="Personaje 3D Gracioso" />
              </datalist>`
);

// Add "Tema Libre" option to the niche datalist
content = content.replace(
  /<option value="🎲 Aleatorio \/ Sorpréndeme" \/>/,
  `<option value="🎲 Aleatorio / Sorpréndeme" />
                <option value="✨ Tema Libre (Simplemente borra esto y escribe el tuyo)" />`
);

fs.writeFileSync('src/app/ilustraciones/page.tsx', content, 'utf8');
console.log('Done');
