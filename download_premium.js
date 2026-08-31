const fs = require('fs');
const path = require('path');
const https = require('https');

const stylesDir = path.join(__dirname, 'public', 'styles');

const premiumPrompts = [
    { name: 'pixar.jpg', url: 'https://image.pollinations.ai/prompt/Masterpiece%203D%20Pixar%20Disney%20style%20close-up%20of%20a%20cute%20expressive%20boy%20adventurer,%20stunning%20warm%20volumetric%20lighting,%208k%20resolution,%20unreal%20engine%205?width=800&height=600&model=flux&nologo=true&seed=42' },
    { name: 'anime.jpg', url: 'https://image.pollinations.ai/prompt/Studio%20Ghibli%20masterpiece,%20breathtaking%20anime%20landscape,%20spirited%20away%20aesthetic,%20glowing%20lights,%20highly%20detailed%20cel%20shaded,%204k?width=800&height=600&model=flux&nologo=true&seed=4' },
    { name: 'motion.jpg', url: 'https://image.pollinations.ai/prompt/Premium%20corporate%202D%20vector%20motion%20graphics%20illustration,%20flat%20design,%20clean%20geometric%20shapes,%20vibrant%20gradients,%20modern%20UI%20aesthetic?width=800&height=600&model=flux&nologo=true&seed=1' },
    { name: 'claymation.jpg', url: 'https://image.pollinations.ai/prompt/High%20quality%20claymation%20stop%20motion%20plasticine,%20cute%20detailed%20character,%20handmade%20texture,%20studio%20lighting,%20Aardman%20style,%208k?width=800&height=600&model=flux&nologo=true&seed=2' },
    { name: 'cyberpunk.jpg', url: 'https://image.pollinations.ai/prompt/Cyberpunk%202077%20neon%20city%20rain,%20futuristic%20sci-fi%20aesthetic,%20cinematic%20lighting,%20hyperrealistic,%20unreal%20engine%205,%208k?width=800&height=600&model=flux&nologo=true&seed=88' },
    { name: 'cine.jpg', url: 'https://image.pollinations.ai/prompt/Cinematic%20hollywood%20blockbuster%20action%20scene,%20dramatic%20lighting,%208k%20resolution,%20ARRI%20Alexa%2065,%20photorealistic?width=800&height=600&model=flux&nologo=true&seed=1' },
    { name: 'horror.jpg', url: 'https://image.pollinations.ai/prompt/Analog%20horror%20VHS%20footage,%20creepy%20liminal%20space,%20vintage%201990s%20camcorder,%20static%20noise,%20eerie%20atmosphere?width=800&height=600&model=flux&nologo=true&seed=66' },
    { name: 'lofi.jpg', url: 'https://image.pollinations.ai/prompt/Lo-fi%20hip%20hop%20aesthetic%20anime%20girl%20studying,%20pastel%20colors,%20chill%20vibes,%20sunset%20lighting,%20highly%20detailed?width=800&height=600&model=flux&nologo=true&seed=3' },
    { name: 'raw.jpg', url: 'https://image.pollinations.ai/prompt/Award%20winning%20documentary%20photography,%20gritty%20realism,%20handheld%20camera%20look,%20highly%20detailed%20portrait,%208k?width=800&height=600&model=flux&nologo=true&seed=5' },
    { name: 'drone.jpg', url: 'https://image.pollinations.ai/prompt/Breathtaking%20drone%20birds%20eye%20view%20aerial%20photography,%20massive%20cyberpunk%20cityscape%20at%20sunset,%204k%20resolution?width=800&height=600&model=flux&nologo=true&seed=4' },
    { name: 'acuarela.jpg', url: 'https://image.pollinations.ai/prompt/Beautiful%20ethereal%20watercolor%20painting,%20magical%20nature%20landscape,%20soft%20brush%20strokes,%20trending%20on%20artstation?width=800&height=600&model=flux&nologo=true&seed=15' },
    { name: 'pixel.jpg', url: 'https://image.pollinations.ai/prompt/High%20quality%208-bit%20pixel%20art,%20retro%20arcade%20video%20game%20landscape,%20nostalgic%20cyberpunk%20scene,%20vibrant%20colors?width=800&height=600&model=flux&nologo=true&seed=5' },
    { name: 'surreal.jpg', url: 'https://image.pollinations.ai/prompt/Surrealist%20dreamcore%20liminal%20space,%20floating%20islands,%20weird%20aesthetic,%20hyperrealistic%20render,%208k?width=800&height=600&model=flux&nologo=true&seed=6' },
    { name: 'paper.jpg', url: 'https://image.pollinations.ai/prompt/Premium%20paper%20cut-out%20art,%20layered%20craft%20diorama,%20storybook%20illustration,%20studio%20lighting,%20highly%20detailed?width=800&height=600&model=flux&nologo=true&seed=7' },
    { name: 'skeleton_cartoon.jpg', url: 'https://image.pollinations.ai/prompt/High%20quality%203D%20classic%20cartoon%20skeleton%20character,%20funny%20expressive%20animation%20style,%20pixar%20lighting,%208k?width=800&height=600&model=flux&nologo=true&seed=1' },
    { name: 'spooky_skeleton.jpg', url: 'https://image.pollinations.ai/prompt/Spooky%20retro%20horror%20skeleton,%20gothic%20creepy%20dark%20aesthetic,%20highly%20detailed%20digital%20painting,%204k?width=800&height=600&model=flux&nologo=true&seed=2' },
    { name: 'calaca.jpg', url: 'https://image.pollinations.ai/prompt/Traditional%20mexican%20calaca%20skeleton,%20day%20of%20the%20dead,%20colorful%20folk%20art,%20highly%20detailed,%20vibrant%20lighting?width=800&height=600&model=flux&nologo=true&seed=3' },
    { name: 'object_head.jpg', url: 'https://image.pollinations.ai/prompt/Surreal%20character%20with%20human%20body%20and%20vintage%20TV%20head,%20cyberpunk%20aesthetic,%20hyperrealistic,%208k?width=800&height=600&model=flux&nologo=true&seed=4' },
    { name: 'doodle.jpg', url: 'https://image.pollinations.ai/prompt/Premium%20minimalist%20doodle%20art,%20stickman%20hand%20drawn,%20black%20and%20white,%20clean%20lines,%20vector%20style?width=800&height=600&model=flux&nologo=true&seed=5' },
    { name: 'spiky.jpg', url: 'https://image.pollinations.ai/prompt/Alternative%20spiky%20cartoon%20character,%20sharp%20edges,%20punk%20aesthetic,%20vibrant%20colors,%20high%20quality%20illustration?width=800&height=600&model=flux&nologo=true&seed=6' },
    { name: 'whiteboard.jpg', url: 'https://image.pollinations.ai/prompt/Whiteboard%20animation%20style,%20black%20marker%20hand%20drawn%20sketch,%20clean%20white%20background,%20highly%20detailed?width=800&height=600&model=flux&nologo=true&seed=7' },
    { name: 'puppet.jpg', url: 'https://image.pollinations.ai/prompt/Premium%20flat%202D%20vector%20puppet%20character%20rig,%20modern%20animation%20style,%20clean%20shapes,%20vibrant%20colors?width=800&height=600&model=flux&nologo=true&seed=8' },
    { name: 'custom.jpg', url: 'https://image.pollinations.ai/prompt/Abstract%20colorful%20paint%20explosion,%20creative%20studio,%20masterpiece,%208k%20resolution?width=800&height=600&model=flux&nologo=true&seed=7' }
];

async function downloadAll() {
    console.log("Descargando imágenes PREMIUM para el menú de estilos...");
    for (const img of premiumPrompts) {
        const filePath = path.join(stylesDir, img.name);
        await new Promise((resolve, reject) => {
            https.get(img.url, (response) => {
                if (response.statusCode === 200) {
                    const file = fs.createWriteStream(filePath);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Descargada HD: ${img.name}`);
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
    console.log("¡Todas las imágenes PREMIUM descargadas con éxito!");
}

downloadAll().catch(console.error);
