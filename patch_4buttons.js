const fs = require('fs');
let content = fs.readFileSync('src/app/cuerpo-humano/page.tsx', 'utf8');

const oldCopyFn = `  const handleCopyAll = () => {
    if (!data) return;
    let text = \`🎬 TÍTULO: \${data.title}\\n\\n\`;
    text += \`🖼️ IDEA DE MINIATURA:\\n\`;
    text += \`Texto: \${data.thumbnail.text}\\n\`;
    text += \`Prompt: \${data.thumbnail.image_prompt}\\n\\n\`;
    text += \`---\\n\\n\`;
    data.scenes.forEach((s) => {
      text += \`⏱️ ESCENA \${s.scene_number}\\n\`;
      text += \`🗣️ Voz: \${s.narration}\\n\`;
      text += \`👀 Concepto: \${s.visual_concept}\\n\`;
      text += \`🎨 Image Prompt (Midjourney): \${s.image_prompt}\\n\`;
      text += \`✨ Animation Prompt (Runway/Kling): \${s.animation_prompt}\\n\\n\`;
    });
    text += \`📝 CAPTION:\\n\${data.caption}\\n\`;
    text += \`\${data.hashtags?.join(" ") || ""}\`;
    handleCopy(text, "all");
  };`;

const newCopyFn = `  const handleCopyBulk = (type: "all" | "images" | "animations" | "text") => {
    if (!data) return;
    let text = "";
    
    if (type === "all") {
      text = \`🎬 TÍTULO: \${data.title}\\n\\n\`;
      text += \`🖼️ IDEA DE MINIATURA:\\nTexto: \${data.thumbnail.text}\\nPrompt: \${data.thumbnail.image_prompt}\\n\\n---\\n\\n\`;
      data.scenes.forEach((s) => {
        text += \`⏱️ ESCENA \${s.scene_number}\\n🗣️ Voz: \${s.narration}\\n👀 Concepto: \${s.visual_concept}\\n🎨 Image: \${s.image_prompt}\\n✨ Anim: \${s.animation_prompt}\\n\\n\`;
      });
      text += \`📝 CAPTION:\\n\${data.caption}\\n\${data.hashtags?.join(" ") || ""}\`;
    } else if (type === "images") {
      text = \`Miniatura:\\n\${data.thumbnail.image_prompt}\\n\\n\`;
      data.scenes.forEach(s => text += \`Escena \${s.scene_number}:\\n\${s.image_prompt}\\n\\n\`);
    } else if (type === "animations") {
      data.scenes.forEach(s => text += \`Escena \${s.scene_number}:\\n\${s.animation_prompt}\\n\\n\`);
    } else if (type === "text") {
      text = \`TÍTULO: \${data.title}\\n\\nVOZ EN OFF:\\n\`;
      data.scenes.forEach(s => text += \`[\${s.scene_number}] \${s.narration}\\n\`);
      text += \`\\nCAPTION:\\n\${data.caption}\\n\${data.hashtags?.join(" ") || ""}\`;
    }
    
    handleCopy(text, \`bulk_\${type}\`);
  };`;

content = content.replace(oldCopyFn, newCopyFn);

const oldButtons = `<div className="flex justify-between items-center mb-8 border-b border-slate-800/60 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                  <p className="text-red-400 text-sm font-semibold">Tema listo para animar</p>
                </div>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-red-600/40 transition-colors">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>`;

const newButtons = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800/60 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                  <p className="text-red-400 text-sm font-semibold">Tema listo para animar</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleCopyBulk('text')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_text'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Type className="w-3.5 h-3.5" />} Textos
                  </button>
                  <button onClick={() => handleCopyBulk('images')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_images'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5" />} Img Prompts
                  </button>
                  <button onClick={() => handleCopyBulk('animations')} className="flex items-center gap-2 bg-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                    {copiedStates['bulk_animations'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />} Anim Prompts
                  </button>
                  <button onClick={() => handleCopyBulk('all')} className="flex items-center gap-2 bg-red-600/20 text-red-400 py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-600/40 transition-colors">
                    {copiedStates['bulk_all'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Todo
                  </button>
                </div>
              </div>`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync('src/app/cuerpo-humano/page.tsx', content, 'utf8');
console.log('4 Buttons added');
