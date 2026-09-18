const fs = require('fs');

const patches = [
  {
    file: 'src/app/ilustraciones/page.tsx',
    replacements: [
      { from: /const \[niche, setNiche\] = useState\(illustrationNiches\[0\]\);/, to: 'const [niche, setNiche] = useState("");' },
      { from: /const \[visualStyle, setVisualStyle\] = useState\("Cinemático Oscuro \(Motivación\)"\);/, to: 'const [visualStyle, setVisualStyle] = useState("");' }
    ]
  },
  {
    file: 'src/app/casas-mexicanas/page.tsx',
    replacements: [
      { from: /const \[topic, setTopic\] = useState\(mexTopics\[0\]\);/, to: 'const [topic, setTopic] = useState("");' }
    ]
  },
  {
    file: 'src/app/pato-financiero/page.tsx',
    replacements: [
      { from: /const \[topic, setTopic\] = useState\(duckTopics\[0\]\);/, to: 'const [topic, setTopic] = useState("");' }
    ]
  },
  {
    file: 'src/app/telenovelas/page.tsx',
    replacements: [
      { from: /const \[topic, setTopic\] = useState\(novelaTopics\[0\]\);/, to: 'const [topic, setTopic] = useState("");' }
    ]
  }
];

patches.forEach(p => {
  if (fs.existsSync(p.file)) {
    let content = fs.readFileSync(p.file, 'utf8');
    p.replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(p.file, content, 'utf8');
  }
});
console.log('Done');
