const fs = require('fs');

const files = [
  'src/app/videos-motivacionales/page.tsx',
  'src/app/casas-mexicanas/page.tsx',
  'src/app/pato-financiero/page.tsx',
  'src/app/telenovelas/page.tsx',
  'src/app/stickman/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /<option value="🎲 Aleatorio \/ Sorpréndeme" \/>/,
      `<option value="🎲 Aleatorio / Sorpréndeme" />
                <option value="✨ Tema Libre (Borra esto y escribe el tuyo)" />`
    );
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Done others');
