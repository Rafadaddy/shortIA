const fs = require('fs');

const files = [
  'src/app/listas-virales/page.tsx',
  'src/app/naturaleza-salvaje/page.tsx',
  'src/app/casas-mexicanas/page.tsx',
  'src/components/Sidebar.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    let original = content;
    content = content.replace(/Ã./g, match => {
      try {
        return Buffer.from(match, 'latin1').toString('utf8');
      } catch(e) {
        return match;
      }
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed mojibake in ${file}`);
    } else {
      console.log(`No mojibake found in ${file}`);
    }
  }
});
