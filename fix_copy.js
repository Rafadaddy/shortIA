const fs = require('fs');
let content = fs.readFileSync('src/app/naturaleza-salvaje/page.tsx', 'utf8');

const regex = /const handleCopyAll = \(\) => \{[\s\S]*?showToast\("Guion completo copiado", "success"\);\s*\};/;

const newHandle = `const handleCopyAll = () => {
    if (!data) return;
    let text = \`🎬 TÍTULO: \${data.title}\\n\`;
    text += \`🏆 VEREDICTO: \${data.winner_stats}\\n\`;
    text += \`🎵 MÚSICA: \${data.music}\\n\\n\`;
    data.scenes.forEach((s) => {
      text += \`⏱️ [\${s.timestamp}] ESCENA \${s.scene_number}\\n\`;
      text += \`🎙️ Narración: \${s.narration}\\n\`;
      text += \`🔤 Texto: \${s.text_overlay}\\n\`;
      text += \`🎥 Cámara: \${s.camera_movement}\\n\`;
      text += \`🔊 Sonido: \${s.audio_cues}\\n\`;
      text += \`👁️ Visual: \${s.visual_concept}\\n\`;
      text += \`📸 Prompt Imagen: \${s.image_prompt}\\n\\n\`;
    });
    text += \`\\n📌 CTA: \${data.cta}\\n\`;
    if (data.hashtags) text += \`🏷️ Hashtags: \${data.hashtags.join(" ")}\\n\`;
    handleCopy(text, "all");
    showToast("Guion completo copiado", "success");
  };`;

content = content.replace(regex, newHandle);
fs.writeFileSync('src/app/naturaleza-salvaje/page.tsx', content);
