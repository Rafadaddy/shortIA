'use client'

import React, { useState, useRef, useEffect } from 'react';
import { generateStory, generateScenes, generateAudio, generateImage, generateSubtitles } from '@/actions/generate';
import { compileVideo } from '@/actions/compile';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Video, CheckCircle, ArrowRight, Edit3, Image as ImageIcon, Settings2, FileText, Lightbulb, Link as LinkIcon, RefreshCw, Mic, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateVideo() {
  const router = useRouter();

  // Flujo principal de la aplicación
  const [step, setStep] = useState(1);
  
  // Flujo interno de creación (Setup Wizard)
  const [setupStep, setSetupStep] = useState(1); // 1: Modo, 2: Estilo, 3: Contenido
  
  // Datos del video
  const [mode, setMode] = useState('idea'); // idea, script, url, audio
  const [format, setFormat] = useState('Vertical');
  const [style, setStyle] = useState('3D Pixar');
  const [customStyle, setCustomStyle] = useState('');
  const [topic, setTopic] = useState('');
  
  // Datos generados
  const [scriptData, setScriptData] = useState<any>(null);
  const [fullStory, setFullStory] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  
  // Ajustes Multimedia
  const [voice, setVoice] = useState('Jorge (Español)');
  const [subColor, setSubColor] = useState('&H0000FFFF');
  const [music, setMusic] = useState('Ninguna');

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);

  const defaultStyles = [
    // 🎭 Estilos de Animación Digital
    { id: '3D Pixar', name: '3D Pixar / Disney', desc: 'Personajes expresivos, colores vivos', prompt: '3D Pixar Disney style, expressive characters, vibrant colors, masterpiece, 8k resolution, unreal engine 5', img: '/styles/pixar.jpg' },
    { id: 'Anime Cel-Shaded', name: 'Anime / Manga', desc: 'Animación japonesa, cel-shaded', prompt: 'Studio Ghibli masterpiece, anime style, highly detailed cel shaded, 4k', img: '/styles/anime.jpg' },
    { id: 'Motion Graphics 2D', name: 'Motion Graphics 2D', desc: 'Vectorial corporativo, geometría', prompt: 'Premium corporate 2D vector motion graphics illustration, flat design, clean geometric shapes', img: '/styles/motion.jpg' },
    { id: 'Claymation', name: 'Claymation / Stop-Motion', desc: 'Plastilina cuadro por cuadro', prompt: 'High quality claymation stop motion plasticine, handmade texture, studio lighting, Aardman style', img: '/styles/claymation.jpg' },
    { id: 'Cyberpunk', name: 'Cyberpunk / Neon-Noir', desc: 'Futurista, ciudad oscura, neón', prompt: 'Cyberpunk 2077 neon city rain, futuristic sci-fi aesthetic, cinematic lighting, unreal engine 5', img: '/styles/cyberpunk.jpg' },
    
    // 🎥 Estilos Cinematográficos y Reales
    { id: 'Cinematic 8K', name: 'Cinematic 8K Ultra-Realistic', desc: 'Máximo detalle, iluminación natural', prompt: 'Cinematic hollywood blockbuster action scene, dramatic lighting, 8k resolution, ARRI Alexa 65', img: '/styles/cine.jpg' },
    { id: 'Vintage Film', name: 'Vintage Film / VHS', desc: 'Retro 90s, grano, aberración', prompt: 'Analog horror VHS footage, creepy liminal space, vintage 1990s camcorder, static noise', img: '/styles/horror.jpg' },
    { id: 'Lo-Fi Aesthetic', name: 'Lo-Fi Aesthetic', desc: 'Tonos pastel, análogo suave', prompt: 'Lo-fi hip hop aesthetic, pastel colors, chill vibes, sunset lighting, highly detailed', img: '/styles/lofi.jpg' },
    { id: 'Documentary', name: 'Documentary / Handheld', desc: 'Cámara en mano, imperfecciones', prompt: 'Award winning documentary photography, gritty realism, handheld camera look, highly detailed', img: '/styles/raw.jpg' },
    { id: 'Drone View', name: 'Drone / Bird’s-Eye View', desc: 'Tomas aéreas, paisajes amplios', prompt: 'Breathtaking drone birds eye view aerial photography, massive cityscape at sunset, 4k resolution', img: '/styles/drone.jpg' },
    
    // 🎨 Estilos Artísticos y Abstractos
    { id: 'Watercolor', name: 'Watercolor Animation', desc: 'Acuarela, papel húmedo', prompt: 'Beautiful ethereal watercolor painting, magical nature landscape, soft brush strokes', img: '/styles/acuarela.jpg' },
    { id: 'Pixel Art', name: 'Pixel Art / 8-Bit Retro', desc: 'Videojuegos retro, nostálgico', prompt: 'High quality 8-bit pixel art, retro arcade video game landscape, nostalgic scene', img: '/styles/pixel.jpg' },
    { id: 'Surrealist Dreamcore', name: 'Surrealist Dreamcore', desc: 'Estética de ensueño, abstracto', prompt: 'Surrealist dreamcore liminal space, floating islands, weird aesthetic, hyperrealistic render', img: '/styles/surreal.jpg' },
    { id: 'Paper Cut-Out', name: 'Paper Cut-Out', desc: 'Figuras de papel en capas', prompt: 'Premium paper cut-out art, layered craft diorama, storybook illustration, studio lighting', img: '/styles/paper.jpg' },

    // 💀 Personajes, Esqueletos y Trazos Simples
    { id: 'Skeleton Cartoon', name: 'Skeleton Cartoon', desc: 'Esqueletos caricatura clásica', prompt: 'High quality 3D classic cartoon skeleton character, funny expressive animation style', img: '/styles/skeleton_cartoon.jpg' },
    { id: 'Spooky Skeleton', name: 'Spooky Skeleton', desc: 'Esqueletos góticos, misterio', prompt: 'Spooky retro horror skeleton, gothic creepy dark aesthetic, highly detailed digital painting', img: '/styles/spooky_skeleton.jpg' },
    { id: 'Calaca Style', name: 'Calaca Style', desc: 'Día de muertos, folclórico', prompt: 'Traditional mexican calaca skeleton, day of the dead, colorful folk art, highly detailed', img: '/styles/calaca.jpg' },
    { id: 'Object Head', name: 'Object Head Style', desc: 'Cuerpo humano, cabeza objeto', prompt: 'Surreal character with human body and vintage TV head, cyberpunk aesthetic, hyperrealistic', img: '/styles/object_head.jpg' },
    { id: 'Doodle Art', name: 'Doodle Art / Stickman', desc: 'Dibujos minimalistas a mano', prompt: 'Premium minimalist doodle art, stickman hand drawn, black and white, clean lines', img: '/styles/doodle.jpg' },
    { id: 'Spiky Cartoon', name: 'Spiky Cartoon', desc: 'Bordes afilados, alternativo', prompt: 'Alternative spiky cartoon character, sharp edges, punk aesthetic, vibrant colors', img: '/styles/spiky.jpg' },
    { id: 'Whiteboard', name: 'Whiteboard Animation', desc: 'Trazo negro sobre pizarrón', prompt: 'Whiteboard animation style, black marker hand drawn sketch, clean white background', img: '/styles/whiteboard.jpg' },
    { id: 'Flat 2D Puppet', name: 'Flat 2D Vector Puppet', desc: 'Muñecos digitales planos', prompt: 'Premium flat 2D vector puppet character rig, modern animation style, clean shapes', img: '/styles/puppet.jpg' },
  ];

  const [styles, setStyles] = useState(defaultStyles);
  const [showAddStyle, setShowAddStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState('Pexels'); // 'Pexels' o 'AI_Images'

  // Cargar estilos personalizados guardados en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('labsia_custom_styles');
    if (saved) {
      setStyles([...defaultStyles, ...JSON.parse(saved)]);
    }
  }, []);

  const openEditStyle = (e: React.MouseEvent, s: any) => {
    e.stopPropagation();
    setEditingStyleId(s.id);
    setNewStyleName(s.name);
    setNewStylePrompt(s.prompt || '');
    setShowAddStyle(true);
  };

  const handleAddNewStyle = () => {
    if (!newStyleName || !newStylePrompt) return;
    
    const encoded = encodeURIComponent(newStylePrompt.slice(0, 50));
    
    let updatedStyles = [...styles];
    
    if (editingStyleId) {
      // Actualizar estilo existente
      updatedStyles = styles.map(s => 
        s.id === editingStyleId 
          ? { ...s, name: newStyleName, prompt: newStylePrompt, img: `https://image.pollinations.ai/prompt/${encoded}?width=400&height=300&nologo=true` } 
          : s
      );
    } else {
      // Crear nuevo estilo
      const newStyle = {
        id: newStyleName,
        name: newStyleName,
        desc: 'Estilo de usuario personalizado',
        prompt: newStylePrompt,
        img: `https://image.pollinations.ai/prompt/${encoded}?width=400&height=300&nologo=true`
      };
      updatedStyles.push(newStyle);
    }
    
    setStyles(updatedStyles);
    setStyle(newStyleName);
    
    // Guardar overrides y nuevos estilos en localStorage
    // Para simplificar, guardamos todos los estilos que difieren de los originales
    const customOrEdited = updatedStyles.filter(s => {
      const orig = defaultStyles.find(ds => ds.id === s.id);
      return !orig || orig.prompt !== s.prompt || orig.name !== s.name;
    });
    localStorage.setItem('labsia_custom_styles', JSON.stringify(customOrEdited));
    
    setShowAddStyle(false);
    setEditingStyleId(null);
    setNewStyleName('');
    setNewStylePrompt('');
  };

  const templates = ['🏆 Top 5', '🔍 Dato curioso', '💀 True Crime', '📱 Tutorial', '👽 Conspiración', '📖 Storytelling'];
//... [salto de líneas en el pensamiento, reemplazaré solo la parte renderizada] ...

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    const activeStyleObj = styles.find(s => s.id === style);
    const activeStyle = activeStyleObj?.prompt || activeStyleObj?.id || style;
    
    setLoading(true);
    try {
      setProgressText('Escribiendo la historia...');
      const story = await generateStory(topic, format, activeStyle);
      setFullStory(story);

      setProgressText('Dividiendo en escenas...');
      const data = await generateScenes(story, activeStyle);
      if (!data.escenas && !data.scenes) throw new Error("Formato inválido");
      
      setScriptData(data);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Error generando el guion.');
    } finally {
      setLoading(false);
    }
  };

  const handleScriptEdit = (index: number, newText: string, field: 'narration' | 'imagePrompt') => {
    const newData = { ...scriptData };
    const scenesKey = newData.escenas ? 'escenas' : 'scenes';
    newData[scenesKey][index][field] = newText;
    setScriptData(newData);
  };

  const handleRegenerateSingleImage = async (index: number) => {
    setRegeneratingIndex(index);
    const id = Date.now().toString(); // Usar nuevo ID para no sobreescribir cache del navegador
    const scenesKey = scriptData.escenas ? 'escenas' : 'scenes';
    const scenes = scriptData[scenesKey];
    try {
      // Pasamos un index modificado para que el nombre del archivo sea distinto y fuerce recarga
      const newUrl = await generateImage(scenes[index].imagePrompt, id, index, format);
      setGeneratedImages(prev => {
        const newImages = [...prev];
        newImages[index] = newUrl;
        return newImages;
      });
    } catch (error) {
      console.error(error);
      alert('Error al regenerar esta imagen específica.');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleGenerateImages = async () => {
    setLoading(true);
    setStep(3);
    setProgressText('Dibujando imágenes con IA...');
    const id = Date.now().toString();
    const scenesKey = scriptData.escenas ? 'escenas' : 'scenes';
    const scenes = scriptData[scenesKey];
    try {
      const imageUrls = [];
      for (let i = 0; i < scenes.length; i++) { 
        const url = await generateImage(scenes[i].imagePrompt, id, i, format);
        imageUrls.push(url);
      }
      setGeneratedImages(imageUrls);
      setStep(4);
    } catch (error) {
      console.error(error);
      alert('Error al generar imágenes.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleProduceVideo = async () => {
    setStep(6);
    const id = Date.now().toString();
    const scenesKey = scriptData.escenas ? 'escenas' : 'scenes';
    const scenes = scriptData[scenesKey];
    
    // Concatenar todas las narraciones del guion
    const fullScript = scenes.map((s: any) => s.narration || s.narracion).join(" ");
    
    try {
      setProgressText('Enviando guion y configuraciones al motor MoneyPrinterTurbo...');
      const { startCompileVideo, checkCompileStatus } = await import('@/actions/compile');
      
      // Si el usuario elige Imágenes IA y tenemos generadas, las pasamos.
      const imagesToUse = (bgMode === 'AI_Images' && generatedImages.length > 0) ? generatedImages : [];
      
      const taskId = await startCompileVideo(id, topic, fullScript, voice, subColor, music, imagesToUse); 
      
      // Polling
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkCompileStatus(taskId);
          if (status.state === 1) { // Completado
            clearInterval(pollInterval);
            // MPT devuelve rutas relativas locales si no se usa cloud, pero lo copiamos 
            // Ojo: asumo que sirve el video en `http://127.0.0.1:8080/tasks/{task_id}/final.mp4`
            // o que en status.videos[0] viene la ruta local absoluta
            // Por simplicidad para el demo, mostraremos un enlace local o copia
            if (status.videos && status.videos.length > 0) {
              // MPT suele devolver rutas del sistema C:\... o relativas al root web
              const videoPath = status.videos[0]; 
              // En un entorno real se serviría el archivo o se pasaría por un proxy de next
              // pero como es la misma máquina local, podemos usar la URL del servidor MPT
              const videoUrl = `http://127.0.0.1:8080/api/v1/tasks/${taskId}/video`; // Un endpoint de descarga (ficticio, adaptemos si no existe)
              // Mejor usamos el que sepamos que existe: MPT guarda los videos en la ruta /tasks/
              // Si status.videos[0] tiene formato URL, la usamos. Si no, usamos el static de fastapi
              setResultVideoUrl(videoPath.startsWith('http') ? videoPath : `http://127.0.0.1:8080${videoPath.startsWith('/') ? '' : '/'}${videoPath}`);
            }
            setStep(7);
          } else if (status.state === -1) {
            clearInterval(pollInterval);
            console.error(status.error);
            alert(`Error de motor MPT: ${status.error}`);
            setStep(5);
          } else {
            setProgressText(`Ensamblando video (Progreso: ${status.progress || 0}%)...`);
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
      
    } catch (error) {
      console.error(error);
      alert('Hubo un error al iniciar la producción del video.');
      setStep(5);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      
      {/* NAVEGACIÓN SUPERIOR TIPO LABSIA */}
      {step === 1 && (
        <div className="flex items-center justify-center mb-12 relative">
          <div className="absolute h-0.5 bg-slate-800 w-full z-0 top-1/2 transform -translate-y-1/2"></div>
          <div className="absolute h-0.5 bg-indigo-500 z-0 top-1/2 transform -translate-y-1/2 transition-all duration-500" style={{ width: `${((setupStep - 1) / 2) * 100}%`, left: 0 }}></div>
          
          <div className="w-full flex justify-between z-10 px-8">
            <div className="flex flex-col items-center gap-2 bg-[#0B0F19] px-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${setupStep >= 1 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400'}`}>1</div>
              <span className={`text-xs font-bold uppercase tracking-wider ${setupStep >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}>Modo</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-[#0B0F19] px-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${setupStep >= 2 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400'}`}>2</div>
              <span className={`text-xs font-bold uppercase tracking-wider ${setupStep >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}>Estilo</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-[#0B0F19] px-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${setupStep >= 3 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400'}`}>3</div>
              <span className={`text-xs font-bold uppercase tracking-wider ${setupStep >= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>Contenido</span>
            </div>
          </div>
        </div>
      )}

      {/* SETUP WIZARD - FASE 1 */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto">
          {setupStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Crear nuevo video</h1>
                <p className="text-slate-400">Configura tu proyecto en unos pasos</p>
              </div>

              <h2 className="text-xl font-bold text-white mb-4">¿Cómo quieres crear tu video?</h2>
              
              <div className="space-y-3">
                <button className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${mode === 'script' ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`} onClick={() => setMode('script')}>
                  <div className={`p-3 rounded-xl ${mode === 'script' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}><FileText /></div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Desde Guion</h3>
                    <p className="text-slate-400 text-sm">Pega un guion ya redactado y genera el video automáticamente.</p>
                  </div>
                </button>

                <button className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${mode === 'idea' ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`} onClick={() => setMode('idea')}>
                  <div className={`p-3 rounded-xl ${mode === 'idea' ? 'bg-indigo-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400'}`}><Lightbulb /></div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Desde Idea</h3>
                    <p className="text-slate-400 text-sm">Escribe una idea breve y la IA generará el guion y el video.</p>
                  </div>
                </button>

                <button className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${mode === 'url' ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`} onClick={() => setMode('url')}>
                  <div className={`p-3 rounded-xl ${mode === 'url' ? 'bg-indigo-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}><LinkIcon /></div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Desde URL</h3>
                    <p className="text-slate-400 text-sm">Pega un link de YouTube o TikTok para reescribir y generar.</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={() => setSetupStep(2)} className="bg-indigo-600 hover:bg-indigo-700 py-6 px-12 text-lg rounded-xl shadow-lg shadow-indigo-500/20">Siguiente <ArrowRight className="ml-2 w-5 h-5" /></Button>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-white mb-2">Estilo visual</h2>
              <p className="text-slate-400 mb-6">El estilo define los colores, filtros y energía visual de tu video</p>
              
              <div className="grid grid-cols-3 gap-4">
                {styles.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group cursor-pointer ${style === s.id ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                  >
                    <div 
                      className="h-32 w-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" 
                      style={{ backgroundImage: `url('${s.img}')` }}
                    ></div>
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                      <h3 className="font-bold text-white text-sm mb-1">{s.name}</h3>
                      <p className="text-slate-400 text-xs leading-tight">{s.desc}</p>
                    </div>
                    {style === s.id && <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1 shadow-lg shadow-indigo-500/50"><CheckCircle className="w-4 h-4 text-white" /></div>}
                    <button
                      onClick={(e) => openEditStyle(e, s)}
                      className="absolute top-2 left-2 bg-black/60 hover:bg-black/90 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Editar prompt del estilo"
                    >
                      <Edit2 className="w-4 h-4 text-slate-200" />
                    </button>
                  </div>
                ))}
                
                {/* BOTÓN PARA AGREGAR NUEVO ESTILO AL GRID */}
                <button 
                  onClick={() => setShowAddStyle(true)}
                  className="flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/20 transition-all duration-200 group h-full min-h-[12rem]"
                >
                  <div className="bg-slate-800 group-hover:bg-indigo-600 rounded-full p-3 mb-3 transition-colors">
                    <Wand2 className="w-6 h-6 text-slate-400 group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-slate-300 group-hover:text-white mb-1">Crear Estilo</h3>
                  <p className="text-slate-500 text-xs px-4">Añade tu propio estilo a la cuadrícula</p>
                </button>
              </div>
              
              {/* FORMULARIO PARA GUARDAR ESTILO PERSONALIZADO */}
              {showAddStyle && (
                <div className="mt-6 p-6 bg-indigo-950/40 border border-indigo-500/50 rounded-xl animate-in fade-in zoom-in-95">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                    <Wand2 className="w-5 h-5 text-indigo-400" /> Nuevo Estilo Inteligente
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-300 text-sm font-semibold mb-1 block">Nombre del Estilo (Ej: Arte de Van Gogh)</label>
                      <input
                        type="text"
                        value={newStyleName}
                        onChange={(e) => setNewStyleName(e.target.value)}
                        placeholder="Nombra tu estilo..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm font-semibold mb-1 block">Prompt exacto para la IA (En inglés funciona mejor)</label>
                      <textarea
                        value={newStylePrompt}
                        onChange={(e) => setNewStylePrompt(e.target.value)}
                        placeholder="Ej: oil painting in the style of Van Gogh, thick brush strokes, vibrant colors, masterpiece..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="ghost" onClick={() => setShowAddStyle(false)} className="text-slate-400">Cancelar</Button>
                      <Button onClick={handleAddNewStyle} className="bg-indigo-600 hover:bg-indigo-700">Guardar Estilo</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ... [Código antiguo de custom (removido para no duplicar)] ... */}

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setSetupStep(1)} className="text-slate-400 hover:text-white py-6">Atrás</Button>
                <Button onClick={() => setSetupStep(3)} className="bg-indigo-600 hover:bg-indigo-700 py-6 px-12 text-lg rounded-xl shadow-lg shadow-indigo-500/20">Siguiente <ArrowRight className="ml-2 w-5 h-5" /></Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-white mb-2">Contenido</h2>
              <p className="text-slate-400 mb-6">Escribe tu idea o elige una plantilla rápida</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm text-slate-500 font-bold mr-2 self-center">Plantillas rápidas:</span>
                {templates.map((t) => (
                  <button key={t} onClick={() => setTopic(t + ": ")} className="bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-300 text-slate-300 text-xs font-bold px-4 py-2 rounded-full transition-colors border border-slate-700 hover:border-indigo-500/50">
                    {t}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu idea o palabra clave</span>
                </div>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-transparent p-6 text-white outline-none resize-none h-40 text-lg placeholder-slate-600"
                  placeholder="Ej: Los 5 hábitos de las personas más productivas..."
                />
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setSetupStep(2)} className="text-slate-400 hover:text-white py-6">Atrás</Button>
                <Button onClick={handleGenerateScript} disabled={loading || !topic} className="bg-indigo-600 hover:bg-indigo-700 py-6 px-12 text-lg rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {progressText}</> : <><Wand2 className="w-5 h-5 mr-2" /> Generar guion con IA</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FASE 2: GUION Y PROMPTS (El resto del código original se mantiene) */}
      {step === 2 && scriptData && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Edit3 className="w-6 h-6 text-indigo-400" /> Edición de Escenas
          </h2>
          <div className="space-y-6">
            {(scriptData.escenas || scriptData.scenes).map((escena: any, index: number) => (
              <div key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Voz en Off (Español)</label>
                  <textarea 
                    value={escena.narration}
                    onChange={(e) => handleScriptEdit(index, e.target.value, 'narration')}
                    className="w-full bg-slate-900 text-white border border-slate-700 rounded p-2 text-sm h-24 resize-none outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Prompt Visual (Inglés)</label>
                  <textarea 
                    value={escena.imagePrompt}
                    onChange={(e) => handleScriptEdit(index, e.target.value, 'imagePrompt')}
                    className="w-full bg-slate-900 text-indigo-200 border border-slate-700 rounded p-2 text-sm h-24 resize-none outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleGenerateImages} className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg mt-4 shadow-lg shadow-indigo-500/20">
            Generar Imágenes <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* FASES RESTANTES... (Se mantiene la lógica original para 3, 4, 5, 6 y 7) */}
      {step === 3 && (
        <div className="bg-slate-900 p-12 rounded-2xl text-center shadow-xl">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{progressText}</h2>
        </div>
      )}

      {/* FASE 4: GALERÍA DE IMÁGENES (EN LISTA CON PROMPTS) */}
      {step === 4 && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <ImageIcon className="w-6 h-6 text-indigo-400" /> Resultados de Imágenes
          </h2>
          <div className="space-y-6">
            {generatedImages.map((img, idx) => {
              const scenesKey = scriptData.escenas ? 'escenas' : 'scenes';
              const escena = scriptData[scenesKey][idx];
              return (
                <div key={idx} className="flex gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md items-center">
                  {/* Número e Imagen */}
                  <div className="relative w-32 md:w-48 aspect-[9/16] bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-700 group">
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      Escena {idx + 1}
                    </div>
                    {/* Botón flotante para rehacer imagen */}
                    <button 
                      onClick={() => handleRegenerateSingleImage(idx)}
                      disabled={regeneratingIndex === idx}
                      className="absolute top-2 right-2 bg-indigo-600/90 hover:bg-indigo-500 text-white p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:bg-slate-700"
                      title="Volver a generar esta imagen"
                    >
                      <RefreshCw className={`w-4 h-4 ${regeneratingIndex === idx ? 'animate-spin' : ''}`} />
                    </button>
                    
                    {regeneratingIndex === idx ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/80 absolute inset-0 z-0">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <span className="text-xs text-indigo-200">Dibujando...</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt={`scene ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Textos y Prompt */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Voz del Narrador</h4>
                      <p className="text-sm text-slate-300 italic bg-slate-900 p-3 rounded border border-slate-800">
                        "{escena?.narration}"
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-500/70 uppercase mb-1">Prompt Generado</h4>
                      <p className="text-xs text-indigo-200/50 bg-indigo-950/20 p-2 rounded">
                        {escena?.imagePrompt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={() => setStep(5)} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg mt-8 shadow-lg shadow-emerald-500/20">
            Aprobar imágenes e ir a Edición <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Settings2 className="w-6 h-6 text-indigo-400" /> Edición Multimedia
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2"><Settings2 className="w-4 h-4"/> Voz de la IA</label>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-lg outline-none border border-slate-700 hover:border-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="es-ES-AlvaroNeural">Álvaro (Español España - Serio)</option>
                <option value="es-MX-JorgeNeural">Jorge (Español México - Dinámico)</option>
                <option value="es-MX-DaliaNeural">Dalia (Español México - Dulce)</option>
                <option value="es-ES-ElviraNeural">Elvira (Español España - Formal)</option>
              </select>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2"><Image className="w-4 h-4"/> Fondo del Video</label>
              <select value={bgMode} onChange={(e) => setBgMode(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-lg outline-none border border-slate-700 hover:border-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="Pexels">Videos Reales de Stock (Pexels)</option>
                <option value="AI_Images" disabled={generatedImages.length === 0}>
                  {generatedImages.length === 0 ? 'Tus Imágenes IA (Debes generarlas en el paso anterior)' : 'Tus Imágenes Generadas por IA'}
                </option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2"><Type className="w-4 h-4"/> Estilo de Subtítulos</label>
              <select value={subColor} onChange={(e) => setSubColor(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-lg outline-none border border-slate-700 hover:border-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="#FFFF00">Amarillo Viral (CapCut)</option>
                <option value="#FFFFFF">Blanco Clásico</option>
                <option value="#00FF00">Verde Matrix</option>
                <option value="#FF00FF">Rosa Neón</option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2"><Mic className="w-4 h-4"/> Música de Fondo</label>
              <select value={music} onChange={(e) => setMusic(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-lg outline-none border border-slate-700 hover:border-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="random">Aleatoria (MPT decide)</option>
                <option value="none">Sin Música (Solo voz)</option>
              </select>
            </div>
          </div>
          <Button onClick={handleProduceVideo} className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg mt-6 font-bold shadow-lg shadow-indigo-500/20">
            Renderizar Video Final <Video className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {step === 6 && (
        <div className="bg-slate-900 p-12 rounded-2xl text-center shadow-xl">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Ensamblando Video en FFmpeg...</h2>
          <p className="text-slate-400 text-lg">{progressText}</p>
        </div>
      )}

      {step === 7 && resultVideoUrl && (
        <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-xl animate-in zoom-in-95 duration-500">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-6">¡Video Creado con Éxito!</h2>
          <div className="bg-black p-4 rounded-xl border border-slate-800 shadow-2xl max-w-sm mx-auto mb-8">
            <video src={resultVideoUrl} controls className="w-full rounded-lg" />
          </div>
          <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700 py-6 px-8 rounded-xl">
            Crear Otro Video
          </Button>
        </div>
      )}
    </div>
  );
}
