const fs = require('fs');
const path = require('path');
const https = require('https');

const stylesDir = path.join(__dirname, 'public', 'styles');

const imagesToDownload = [
    { name: 'motion.jpg', url: 'https://image.pollinations.ai/prompt/corporate%202d%20vector%20motion%20graphics%20flat%20design%20clean%20geometric?width=400&height=300&nologo=true&seed=1' },
    { name: 'claymation.jpg', url: 'https://image.pollinations.ai/prompt/claymation%20stop%20motion%20plasticine%20cute%20character%20handmade%20texture?width=400&height=300&nologo=true&seed=2' },
    { name: 'lofi.jpg', url: 'https://image.pollinations.ai/prompt/lo-fi%20hip%20hop%20aesthetic%20anime%20girl%20studying%20pastel%20colors%20chill?width=400&height=300&nologo=true&seed=3' },
    { name: 'drone.jpg', url: 'https://image.pollinations.ai/prompt/beautiful%20drone%20birds%20eye%20view%20aerial%20photography%20cityscape%20sunset?width=400&height=300&nologo=true&seed=4' },
    { name: 'pixel.jpg', url: 'https://image.pollinations.ai/prompt/8-bit%20pixel%20art%20retro%20arcade%20video%20game%20landscape%20nostalgic?width=400&height=300&nologo=true&seed=5' },
    { name: 'surreal.jpg', url: 'https://image.pollinations.ai/prompt/surrealist%20dreamcore%20liminal%20space%20floating%20islands%20weird%20aesthetic?width=400&height=300&nologo=true&seed=6' },
    { name: 'paper.jpg', url: 'https://image.pollinations.ai/prompt/paper%20cut-out%20art%20layered%20craft%20diorama%20storybook%20illustration?width=400&height=300&nologo=true&seed=7' },
];

async function downloadAll() {
    console.log("Descargando NUEVAS imágenes de estilos...");
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
    console.log("¡Imágenes adicionales descargadas con éxito!");
}

downloadAll().catch(console.error);
