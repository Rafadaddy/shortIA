const fs = require('fs');
const path = require('path');
const https = require('https');

const stylesDir = path.join(__dirname, 'public', 'styles');

if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
}

const imagesToDownload = [
    { name: 'anime.jpg', url: 'https://image.pollinations.ai/prompt/Studio%20Ghibli%20style%20anime%20landscape%20spirited%20away%20aesthetic?width=400&height=300&nologo=true&seed=4' },
    { name: 'cyberpunk.jpg', url: 'https://image.pollinations.ai/prompt/cyberpunk%20neon%20city%20rain%20futuristic%20sci-fi%20aesthetic?width=400&height=300&nologo=true&seed=88' },
    { name: 'comic.jpg', url: 'https://image.pollinations.ai/prompt/vintage%20comic%20book%20pop%20art%20superhero%20halftone?width=400&height=300&nologo=true&seed=33' },
    { name: 'acuarela.jpg', url: 'https://image.pollinations.ai/prompt/beautiful%20ethereal%20watercolor%20painting%20nature%20landscape?width=400&height=300&nologo=true&seed=15' },
    { name: 'minimalista.jpg', url: 'https://image.pollinations.ai/prompt/elegant%20black%20and%20white%20minimalist%20architecture%20photography?width=400&height=300&nologo=true&seed=90' },
    { name: 'horror.jpg', url: 'https://image.pollinations.ai/prompt/analog%20horror%20vhs%20footage%20creepy%20liminal%20space?width=400&height=300&nologo=true&seed=66' },
];

async function downloadAll() {
    console.log("Descargando NUEVAS imágenes fijas para el menú de estilos...");
    for (const img of imagesToDownload) {
        const filePath = path.join(stylesDir, img.name);
        await new Promise((resolve, reject) => {
            https.get(img.url, (response) => {
                if (response.statusCode === 200) {
                    const file = fs.createWriteStream(filePath);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Descargada: ${img.name}`);
                        resolve();
                    });
                } else {
                    reject(new Error(`Error downloading ${img.url}: ${response.statusCode}`));
                }
            }).on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        });
    }
    console.log("¡Todas las NUEVAS imágenes descargadas con éxito!");
}

downloadAll().catch(console.error);
