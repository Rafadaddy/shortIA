const fs = require('fs');
let code = fs.readFileSync('src/app/api/generate-motivational/route.ts', 'utf-8');
code = code.replace(
  /console.error\("Error generating motivational video:", errMsg\);/,
  'console.error("Error generating motivational video:", error, "\\nRaw jsonText:", typeof jsonText !== "undefined" ? jsonText : "N/A");'
);
fs.writeFileSync('src/app/api/generate-motivational/route.ts', code, 'utf-8');
console.log('Added better error logging');
