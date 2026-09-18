const fs = require('fs');
let content = fs.readFileSync('src/app/naturaleza-salvaje/page.tsx', 'utf8');

// 1. Interfaces
content = content.replace(/interface WildlifeIdea \{[\s\S]*?interface WildlifeData \{[\s\S]*?\}/, `interface WildlifeIdea {
  title: string;
  description: string;
}

interface Scene {
  scene_number: number;
  timestamp: string;
  narration: string;
  text_overlay: string;
  visual_concept: string;
  camera_movement: string;
  audio_cues: string;
  image_prompt: string;
  animation_prompt: string;
}

interface WildlifeData {
  title: string;
  music: string;
  hashtags: string[];
  winner_stats: string;
  cta: string;
  scenes: Scene[];
}`);

// If WildlifeIdea doesn't match, maybe they were still MexIdea
content = content.replace(/interface MexIdea \{[\s\S]*?interface MexData \{[\s\S]*?\}/, `interface WildlifeIdea {
  title: string;
  description: string;
}

interface Scene {
  scene_number: number;
  timestamp: string;
  narration: string;
  text_overlay: string;
  visual_concept: string;
  camera_movement: string;
  audio_cues: string;
  image_prompt: string;
  animation_prompt: string;
}

interface WildlifeData {
  title: string;
  music: string;
  hashtags: string[];
  winner_stats: string;
  cta: string;
  scenes: Scene[];
}`);

// 2. States
content = content.replace(/useState<MexIdea\[\]>/, 'useState<WildlifeIdea[]>');
content = content.replace(/useState<MexData \| null>/, 'useState<WildlifeData | null>');

// 3. UI replacement for Header info
const newHeader = `              <div className="flex justify-between items-start mb-8 border-b border-slate-800/60 pb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.hashtags?.map(tag => <span key={tag} className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-md">{tag}</span>)}
                  </div>
                  <p className="text-slate-400 text-sm font-medium flex items-center gap-2">🎵 {data.music}</p>
                </div>
                <button onClick={handleCopyAll} className="flex items-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-red-600/40 transition-colors shrink-0">
                  {copiedStates['all'] ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar Todo</>}
                </button>
              </div>

              {/* Veredicto & CTA */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-red-500/30 mb-8 relative">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🏆 Veredicto de la Batalla</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase">Estadísticas Finales:</span>
                    <p className="text-white font-bold text-xl mt-1">{data.winner_stats}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase">Llamado a la acción (CTA):</span>
                    <p className="text-slate-300 font-mono text-sm mt-1">{data.cta}</p>
                  </div>
                </div>
              </div>`;

content = content.replace(/<div className="flex justify-between items-center mb-8 border-b border-slate-800\/60 pb-6">[\s\S]*?<!-- Scenes -->/, newHeader + "\n\n              {/* Scenes */}");


// 4. UI replacement for Scene details
const sceneContentRegex = /<span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full text-sm mb-4 inline-block">Escena \{scene\.scene_number\}<\/span>[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g;

content = content.replace(sceneContentRegex, `<div className="flex items-center gap-3 mb-4">
                      <span className="bg-red-900/40 text-red-300 border border-red-800/50 font-bold px-3 py-1 rounded-full text-sm">Escena {scene.scene_number}</span>
                      {scene.timestamp && <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-mono">{scene.timestamp}</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="relative pr-12">
                          <span className="text-xs font-semibold text-slate-500 uppercase">🎙️ Narración</span>
                          <p className="text-red-200/90 text-sm mt-1 italic leading-relaxed">&quot;{scene.narration}&quot;</p>
                          <button onClick={() => handleCopy(scene.narration, \`vo_\${idx}\`)} className="absolute right-0 top-0 text-xs bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-red-300 transition-colors">
                            {copiedStates[\`vo_\${idx}\`] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🔤 Texto en Pantalla</span>
                          <p className="text-yellow-400 font-black text-sm mt-1 tracking-wide">{scene.text_overlay}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🎥 Cámara y Movimiento</span>
                          <p className="text-slate-300 text-sm mt-1 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">{scene.camera_movement}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">🔊 Diseño Sonoro</span>
                          <p className="text-blue-300 text-sm mt-1 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">{scene.audio_cues}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase">👁️ Visual Concept</span>
                      <p className="text-slate-400 text-sm mt-1">{scene.visual_concept}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`);

fs.writeFileSync('src/app/naturaleza-salvaje/page.tsx', content);
