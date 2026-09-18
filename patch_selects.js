const fs = require('fs');
const path = require('path');

const filesToPatch = [
  {
    file: 'src/app/videos-motivacionales/page.tsx',
    field: 'niche',
    optionsName: 'motivationalNiches',
    label: 'Nicho / Temática',
    placeholder: 'Ej. Superación, Escribe el tuyo o déjalo en blanco'
  },
  {
    file: 'src/app/ilustraciones/page.tsx',
    field: 'niche',
    optionsName: 'illustrationNiches',
    label: 'Nicho / Temática',
    placeholder: 'Ej. Motivación, Escribe el tuyo o déjalo en blanco'
  },
  {
    file: 'src/app/casas-mexicanas/page.tsx',
    field: 'topic',
    optionsName: 'mexicoCategories',
    label: 'Categoría (Tema)',
    placeholder: 'Ej. Visitas, Escribe el tuyo o déjalo en blanco'
  },
  {
    file: 'src/app/pato-financiero/page.tsx',
    field: 'topic',
    optionsName: 'financeTopics',
    label: 'Tema Financiero',
    placeholder: 'Ej. Ahorro, Escribe el tuyo o déjalo en blanco'
  },
  {
    file: 'src/app/telenovelas/page.tsx',
    field: 'topic',
    optionsName: 'telenovelaTropes',
    label: 'Nicho / Tropo',
    placeholder: 'Ej. Venganza, Escribe el tuyo o déjalo en blanco'
  },
  {
    file: 'src/app/stickman/page.tsx',
    field: 'topic',
    optionsName: 'stickmanTopics',
    label: 'Tema del Video',
    placeholder: 'Ej. Psicología, Escribe el tuyo o déjalo en blanco'
  }
];

function patchFile(f) {
  let content = fs.readFileSync(f.file, 'utf8');
  
  // 1. Replace the <select> with <input list> + <datalist>
  const selectRegex = new RegExp(`<select\\s+value=\\{${f.field}\\}\\s+onChange=\\{\\(e\\) => set${f.field.charAt(0).toUpperCase() + f.field.slice(1)}\\(e\\.target\\.value\\)\\}\\s+className="([^"]+)"[\\s\\S]*?<\\/select>`);
  
  const replacement = `<input
                type="text"
                value={${f.field}}
                onChange={(e) => set${f.field.charAt(0).toUpperCase() + f.field.slice(1)}(e.target.value)}
                placeholder="${f.placeholder}"
                list="${f.field}-list"
                className="$1"
              />
              <datalist id="${f.field}-list">
                <option value="🎲 Aleatorio / Sorpréndeme" />
                {${f.optionsName}.map(n => <option key={n} value={n} />)}
              </datalist>`;
  
  content = content.replace(selectRegex, replacement);

  // 2. Remove !topic or !niche from disabled
  // e.g. disabled={!niche || isGeneratingIdeas} -> disabled={isGeneratingIdeas}
  content = content.replace(new RegExp(`disabled=\\{!${f.field} \\|\\| `, 'g'), `disabled={` );
  content = content.replace(new RegExp(`disabled=\\{!${f.field} \\? true : `, 'g'), `disabled={` ); // Just in case
  
  // Also if (!niche) return; -> // if (!niche) return;
  content = content.replace(new RegExp(`if \\(!${f.field}\\) return;`, 'g'), `// if (!${f.field}) return;`);
  content = content.replace(new RegExp(`if \\(!finalTopic\\) return showToast\\("Ingresa un tema primero", "error"\\);`, 'g'), `// if (!finalTopic) return showToast("Ingresa un tema primero", "error");`);
  
  fs.writeFileSync(f.file, content, 'utf8');
  console.log('Patched', f.file);
}

filesToPatch.forEach(patchFile);

// For timeline, it's already an input, but we need to remove the disabled constraint and the return constraint.
let timeline = fs.readFileSync('src/app/timeline/page.tsx', 'utf8');
timeline = timeline.replace(/if \(!finalTopic\) return showToast\("Ingresa un tema primero", "error"\);/, '// if (!finalTopic) return showToast("Ingresa un tema primero", "error");');
timeline = timeline.replace(/disabled=\{isGeneratingScript \|\| isGeneratingImages \|\| !topic\}/, 'disabled={isGeneratingScript || isGeneratingImages}');
fs.writeFileSync('src/app/timeline/page.tsx', timeline, 'utf8');
console.log('Patched timeline');
