const fs = require('fs');
const path = require('path');

// Double-encoded UTF-8 -> correct UTF-8
function fixMojibake(str) {
  return str.replace(/[\xC0-\xFF][\x80-\xBF]/g, match => {
    try {
      return Buffer.from(match, 'latin1').toString('utf8');
    } catch(e) { return match; }
  });
}

const apiDir = path.join(__dirname, 'src/app/api');
const routes = fs.readdirSync(apiDir)
  .map(d => path.join(apiDir, d, 'route.ts'))
  .filter(f => fs.existsSync(f));

let fixed = 0;
for (const file of routes) {
  const original = fs.readFileSync(file, { encoding: 'latin1' });
  const corrected = fixMojibake(original);
  if (corrected !== original) {
    fs.writeFileSync(file, corrected, { encoding: 'utf8' });
    console.log('Fixed:', path.basename(path.dirname(file)));
    fixed++;
  } else {
    console.log('OK (no change):', path.basename(path.dirname(file)));
  }
}
console.log(`\nDone. Fixed ${fixed} files.`);
