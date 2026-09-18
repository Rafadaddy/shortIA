const https = require('https');
const options = {
  hostname: 'html.duckduckgo.com',
  path: '/html/?q=' + encodeURIComponent('temas reflexiones tiktok 2024 cansancio soledad parejas'),
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(data)) !== null && count < 5) {
      console.log('Result: ' + match[1].replace(/<[^>]+>/g, '').trim());
      count++;
    }
  });
});
