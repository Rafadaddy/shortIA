const fs = require('fs');

let content = fs.readFileSync('src/app/casas-mexicanas/page.tsx', 'utf8');

// 1. Add state variables
content = content.replace(
  'const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);',
  `const [regeneratingType, setRegeneratingType] = useState<"image" | "animation" | null>(null);\n  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});\n  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);`
);

// 2. Add generate image function
const funcCode = `
  const handleGenerateImage = async (sceneIndex: number, prompt: string) => {
    if (generatingImageFor !== null) return;
    setGeneratingImageFor(sceneIndex);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16" })
      });
      if (!res.ok) throw new Error("Error generating image");
      const json = await res.json();
      setGeneratedImages(prev => ({ ...prev, [sceneIndex]: json.imageBase64 }));
      showToast("Imagen generada con éxito", "success");
    } catch (error) {
      showToast("Error al generar la imagen", "error");
    } finally {
      setGeneratingImageFor(null);
    }
  };
`;

content = content.replace(
  'const handleCopyAll = () => {',
  `${funcCode}\n  const handleCopyAll = () => {`
);

// 3. Add UI button and image display in the scene card
const uiCode = `
                      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-blue-400 uppercase flex items-center gap-1 font-bold"><ImageIcon className="w-3.5 h-3.5" /> Image Prompt</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRegeneratePrompt(idx, "image")} disabled={regeneratingScene !== null} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300 disabled:opacity-50">
                              {regeneratingScene === idx && regeneratingType === "image" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleCopy(scene.image_prompt, \`img_\${idx}\`)} className="bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 text-blue-300">
                              {copiedStates[\`img_\${idx}\`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">{scene.image_prompt}</p>
                        
                        {/* GENERATED IMAGE SECTION */}
                        <div className="mt-auto pt-4 border-t border-slate-800">
                          {generatedImages[idx] ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-950 flex items-center justify-center">
                              <img src={\`data:image/jpeg;base64,\${generatedImages[idx]}\`} alt="Generated scene" className="w-full h-full object-cover" />
                              <a href={\`data:image/jpeg;base64,\${generatedImages[idx]}\`} download={\`escena_\${scene.scene_number}.jpg\`} className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white p-2 rounded-lg hover:bg-black transition-colors text-xs font-bold">Descargar</a>
                            </div>
                          ) : (
                            <button onClick={() => handleGenerateImage(idx, scene.image_prompt)} disabled={generatingImageFor !== null} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                              {generatingImageFor === idx ? <><Loader2 className="w-4 h-4 animate-spin" /> Dibujando...</> : <><ImageIcon className="w-4 h-4" /> Generar Imagen con Google</>}
                            </button>
                          )}
                        </div>
                      </div>
`;

content = content.replace(
  /<div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">[\s\S]*?<p className="text-xs text-slate-400 font-mono leading-relaxed">{scene\.image_prompt}<\/p>\s*<\/div>/,
  uiCode
);

fs.writeFileSync('src/app/casas-mexicanas/page.tsx', content, 'utf8');
console.log('Patched casas-mexicanas page');
