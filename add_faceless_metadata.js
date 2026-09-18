const fs = require('fs');

// 1. UPDATE PAGE.TSX
const pagePath = 'src/app/faceless-youtube/page.tsx';
let page = fs.readFileSync(pagePath, 'utf-8');

// Update Interface
page = page.replace(
  /  script_sections: \{/g,
  `  caption?: string;\n  music_recommendation?: string;\n  hashtags?: string[];\n  script_sections: {`
);

// Add handleCopyMetadata function
const copyMetadataFn = `
  const handleCopyMetadata = () => {
    if (!data) return;
    let text = \`🎵 Música: \${data.music_recommendation}\\n\\n\`;
    text += \`\${data.caption}\\n\\n\`;
    text += data.hashtags ? data.hashtags.map(h => h.startsWith('#') ? h : \`#\${h}\`).join(" ") : "";
    handleCopy(text, "metadata");
  };
`;

page = page.replace(
  /  const handleCopyFullScript = \(\) => \{/,
  copyMetadataFn + '\n  const handleCopyFullScript = () => {'
);

// Append metadata to handleCopyFullScript
page = page.replace(
  /handleCopy\(fullText, 'full_script'\);/,
  `if (data.caption) {
        fullText += \`\\n--- PUBLICACIÓN ---\\n\`;
        fullText += \`Caption: \${data.caption}\\n\`;
        fullText += \`Música: \${data.music_recommendation}\\n\`;
        fullText += \`Hashtags: \${data.hashtags?.join(" ")}\\n\`;
      }
      handleCopy(fullText, 'full_script');`
);

// Add UI at the end
const metadataUI = `
            {/* Datos de Publicación */}
            {data.caption && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Datos de Publicación
                  </h3>
                  <button
                    onClick={handleCopyMetadata}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-sm font-semibold transition-colors border border-cyan-900/30"
                  >
                    {copiedStates["metadata"] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copiar Textos (Caption + Música)
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 block">
                      🎵 Música Sugerida
                    </span>
                    <p className="text-sm text-slate-300 italic">&quot;{data.music_recommendation}&quot;</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                    <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 block">
                      📝 Caption
                    </span>
                    <p className="text-slate-300 text-sm">{data.caption}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 block">
                      # Hashtags
                    </span>
                    <p className="text-slate-300 text-sm">{data.hashtags?.join(" ")}</p>
                  </div>
                </div>
              </div>
            )}
`;

page = page.replace(
  /            <\/div>\n\n          <\/div>\n        \)\}\n      <\/div>\n    <\/main>/,
  `            </div>\n${metadataUI}\n          </div>\n        )}\n      </div>\n    </main>`
);

fs.writeFileSync(pagePath, page, 'utf-8');
console.log('Updated page.tsx');


// 2. UPDATE ROUTE.TS
const routePath = 'src/app/api/generate-faceless/route.ts';
let route = fs.readFileSync(routePath, 'utf-8');

const rulesMetadata = `
🌟 REGLAS PARA LA METADATA (DATOS DE PUBLICACIÓN)
- ES OBLIGATORIO incluir "caption", "music_recommendation" y "hashtags".
- "caption": Un texto persuasivo para la descripción del video en redes (30-50 palabras).
- "music_recommendation": Describe una canción específica y su vibra (ej: "Beat phonk oscuro y rápido").
- "hashtags": Lista de 5 a 8 hashtags virales.
`;

// Insert the rules before the JSON structure instruction
route = route.replace(
  /Responde SOLO con un JSON v[^\n]*\n\{/,
  `${rulesMetadata}\nResponde SOLO con un JSON válido:\n{`
);

// Add to the JSON structure hint
route = route.replace(
  /      \}\n    \]\n  \}\n\}/g,
  `      }\n    ]\n  },\n  "caption": "Caption para redes sociales...",\n  "music_recommendation": "Música sugerida...",\n  "hashtags": ["#faceless", "#youtube"]\n}`
);

fs.writeFileSync(routePath, route, 'utf-8');
console.log('Updated route.ts');
