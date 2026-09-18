const fs = require('fs');
let file = 'src/app/naturaleza-salvaje/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add animalList constant
const animalListStr = `const animalsList = [
  "León Africano",
  "Tigre Siberiano",
  "Oso Grizzly",
  "Oso Polar",
  "Gorila Espalda Plateada",
  "Hipopótamo",
  "Rinoceronte Negro",
  "Cocodrilo del Nilo",
  "Anaconda Verde",
  "Dragón de Komodo",
  "Jaguar",
  "Lobo Gris (Alfa)",
  "Hiena Manchada",
  "Tiburón Blanco",
  "Orca (Ballena Asesina)",
  "Águila Harpía",
  "Mamba Negra",
  "Elefante Africano",
  "Búfalo del Cabo",
  "Medusa Avispa de Mar"
];

const tones`;

content = content.replace(/const tones/, animalListStr);

// 2. Replace animalA input
const newAnimalA = `<input
                type="text"
                value={animalA}
                onChange={(e) => setAnimalA(e.target.value)}
                placeholder="Elige de la lista o escribe el tuyo"
                list="animals-list"
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />`;
content = content.replace(/<input\s*type="text"\s*value=\{animalA\}[\s\S]*?outline-none"\s*\/>/m, newAnimalA);

// 3. Replace animalB input and add datalist
const newAnimalB = `<input
                type="text"
                value={animalB}
                onChange={(e) => setAnimalB(e.target.value)}
                placeholder="Elige de la lista o escribe el tuyo"
                list="animals-list"
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-red-500 outline-none"
              />
              <datalist id="animals-list">
                {animalsList.map(a => <option key={a} value={a} />)}
              </datalist>`;
content = content.replace(/<input\s*type="text"\s*value=\{animalB\}[\s\S]*?outline-none"\s*\/>/m, newAnimalB);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed animal lists');
