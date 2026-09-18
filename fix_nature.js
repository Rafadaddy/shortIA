const fs = require('fs');
let file = 'src/app/naturaleza-salvaje/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// We will just do targeted wildcard replacements for the lines in question
content = content.replace(/<span className="text-xs font-semibold text-slate-500 uppercase">[^<]+Narraci[^\w\s]*n<\/span>/g, '<span className="text-xs font-semibold text-slate-500 uppercase">🎙️ Narración</span>');
content = content.replace(/<span className="text-xs font-semibold text-slate-500 uppercase">[^<]+Texto en Pantalla<\/span>/g, '<span className="text-xs font-semibold text-slate-500 uppercase">🔤 Texto en Pantalla</span>');
content = content.replace(/<span className="text-xs font-semibold text-slate-500 uppercase">[^<]+C[^\w\s]*mara y Movimiento<\/span>/g, '<span className="text-xs font-semibold text-slate-500 uppercase">🎥 Cámara y Movimiento</span>');
content = content.replace(/<span className="text-xs font-semibold text-slate-500 uppercase">[^<]+Dise[^\w\s]*o Sonoro<\/span>/g, '<span className="text-xs font-semibold text-slate-500 uppercase">🔊 Diseño Sonoro</span>');
content = content.replace(/<span className="text-xs font-semibold text-slate-500 uppercase">[^<]+Visual Concept<\/span>/g, '<span className="text-xs font-semibold text-slate-500 uppercase">👁️ Visual Concept</span>');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed naturaleza-salvaje/page.tsx");
