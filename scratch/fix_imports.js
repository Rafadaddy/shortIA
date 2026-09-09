const fs = require('fs');
const files = [
  'src/app/conversaciones/page.tsx',
  'src/app/faceless-youtube/page.tsx',
  'src/app/historietas/page.tsx',
  'src/app/ilustraciones/page.tsx',
  'src/app/reflexiones/page.tsx',
  'src/app/timeline/page.tsx',
  'src/app/videos-motivacionales/page.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { aiFetch }')) {
    content = content.replace('"use client";', '"use client";\nimport { aiFetch } from "@/lib/ai-fetch";');
    fs.writeFileSync(file, content);
    console.log('Added to', file);
  }
}
