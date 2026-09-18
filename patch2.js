const fs = require('fs');
let content = fs.readFileSync('src/app/casas-mexicanas/page.tsx', 'utf8');

const replacement = \
  const handleGenerateImage = async (sceneIndex: number, prompt: string) => {
    if (generatingImageFor !== null) return;
    setGeneratingImageFor(sceneIndex);
    try {
      // Intentar sacar la llave de Google guardada
      let clientApiKey = "";
      try {
        const saved = localStorage.getItem("ai-studio-settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          const google = parsed.providers?.find(p => p.id === "google");
          if (google && google.apiKey) {
            clientApiKey = google.apiKey;
          }
        }
      } catch (e) {}

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16", clientApiKey })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error generating image");
      
      setGeneratedImages(prev => ({ ...prev, [sceneIndex]: json.imageBase64 }));
      showToast("Imagen generada con éxito", "success");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Error al generar la imagen", "error");
    } finally {
      setGeneratingImageFor(null);
    }
  };\;

content = content.replace(/const handleGenerateImage = async \([^}]+\}[^}]+finally \{[^}]+\}[^}]+};/m, replacement);
fs.writeFileSync('src/app/casas-mexicanas/page.tsx', content);
