const fs = require('fs');
const path = require('path');
const https = require('https');

const stylesDir = path.join(__dirname, 'public', 'styles');

const imagesToDownload = [
    { name: 'skeleton_cartoon.jpg', url: 'https://image.pollinations.ai/prompt/classic%20cartoon%20skeleton%20character%20funny%20expressive%20animation%20style?width=400&height=300&nologo=true&seed=1' },
    { name: 'spooky_skeleton.jpg', url: 'https://image.pollinations.ai/prompt/spooky%20retro%20horror%20skeleton%20gothic%20creepy%20dark%20aesthetic?width=400&height=300&nologo=true&seed=2' },
    { name: 'calaca.jpg', url: 'https://image.pollinations.ai/prompt/traditional%20mexican%20calaca%20skeleton%20day%20of%20the%20dead%20colorful%20folk%20art?width=400&height=300&nologo=true&seed=3' },
    { name: 'object_head.jpg', url: 'https://image.pollinations.ai/prompt/surreal%20character%20with%20human%20body%20and%20speaker%20head%20aesthetic?width=400&height=300&nologo=true&seed=4' },
    { name: 'doodle.jpg', url: 'https://image.pollinations.ai/prompt/simple%20minimalist%20doodle%20art%20stickman%20hand%20drawn%20black%20and%20white?width=400&height=300&nologo=true&seed=5' },
    { name: 'spiky.jpg', url: 'https://image.pollinations.ai/prompt/alternative%20spiky%20cartoon%20character%20sharp%20edges%20punk%20aesthetic?width=400&height=300&nologo=true&seed=6' },
    { name: 'whiteboard.jpg', url: 'https://image.pollinations.ai/prompt/whiteboard%20animation%20style%20black%20marker%20hand%20drawn%20sketch?width=400&height=300&nologo=true&seed=7' },
    { name: 'puppet.jpg', url: 'https://image.pollinations.ai/prompt/flat%202d%20vector%20puppet%20character%20rig%20animation%20style?width=400&height=300&nologo=true&seed=8' },
];

async function downloadAll() {
    console.log("Descargando 8 imágenes de estilos raros/cartoons...");
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
    console.log("¡Todas descargadas con éxito!");
}

downloadAll().catch(console.error);
