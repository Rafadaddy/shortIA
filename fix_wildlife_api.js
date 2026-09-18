const fs = require('fs');

// 1. Fix frontend generateVideoInfo payload
let pageFile = 'src/app/naturaleza-salvaje/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

pageContent = pageContent.replace(/\{ mode: "full_from_script", current_script: scriptText, visualStyle, sceneCount, duration \}/g, '{ action: "full_from_script", customScript: scriptText }');
pageContent = pageContent.replace(/\{ mode: "full_from_script", current_script: scriptText[^}]+\}/g, '{ action: "full_from_script", customScript: scriptText }');

// Wait, I can just do a regex that catches `mode: "full_from_script"`
pageContent = pageContent.replace(/const res = await aiFetch\("\/api\/generate-wildlife", \{[\s\S]*?mode: "full_from_script"[\s\S]*?\}\);/m, 'const res = await aiFetch("/api/generate-wildlife", { action: "full_from_script", customScript: scriptText });');

fs.writeFileSync(pageFile, pageContent, 'utf8');


// 2. Fix route.ts mojibake
let routeFile = 'src/app/api/generate-wildlife/route.ts';
let routeContent = fs.readFileSync(routeFile, 'utf8');

// The `fix_all_accents.js` I ran before might have failed because the byte arrays were different, or it wasn't strictly double encoded in the same way?
// Let's just fix it using replace since it's just a few occurrences.
routeContent = routeContent.replace(/Ǹpicos/g, 'épicos');
routeContent = routeContent.replace(/narracin/g, 'narración');
routeContent = routeContent.replace(/narraci[^\w\s]+n/g, 'narración');
routeContent = routeContent.replace(/cinematogrǭfico/g, 'cinematográfico');
routeContent = routeContent.replace(/inglǸs/g, 'inglés');
routeContent = routeContent.replace(/sNICAMENTE/g, 'ÚNICAMENTE');
routeContent = routeContent.replace(/?sNICAMENTE/g, 'ÚNICAMENTE');

// Clean up any remaining
routeContent = routeContent.replace(/Ã¡/g, 'á');
routeContent = routeContent.replace(/Ã©/g, 'é');
routeContent = routeContent.replace(/Ã³/g, 'ó');
routeContent = routeContent.replace(/Ãº/g, 'ú');
routeContent = routeContent.replace(/Ã±/g, 'ñ');

fs.writeFileSync(routeFile, routeContent, 'utf8');
console.log('Fixed api route and frontend payload');
