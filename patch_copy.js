const fs = require('fs');
let content = fs.readFileSync('src/app/cuerpo-humano/page.tsx', 'utf8');

const targetStr = `<div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="bg-red-500/20 text-red-500 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Edición del Guion Científico</h2>
            </div>`;

const newStr = `<div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-red-500/20 text-red-500 w-8 h-8 flex items-center justify-center rounded-full font-bold">2</div>
                <h2 className="text-xl font-bold text-white">Edición del Guion Científico</h2>
              </div>
              <button onClick={() => handleCopy(scriptText, 'script')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                {copiedStates['script'] ? <><Check className="w-4 h-4 text-emerald-400" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Guion</>}
              </button>
            </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/app/cuerpo-humano/page.tsx', content, 'utf8');
  console.log('Copy button added to Paso 2');
} else {
  console.log('Target string not found');
}
