const fs = require('fs');

const files = [
  'src/app/casas-mexicanas/page.tsx',
  'src/app/ilustraciones/page.tsx',
  'src/app/pato-financiero/page.tsx',
  'src/app/telenovelas/page.tsx',
  'src/app/videos-motivacionales/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/list="([^"]+)"\s+className=/g, 'list="$1" onFocus={(e) => e.target.select()} className=');
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Done');
