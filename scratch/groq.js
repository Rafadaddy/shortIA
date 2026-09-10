const key = require('fs').readFileSync('.env.local', 'utf8').match(/GROQ_API_KEY=\"(.*)\"/)[1];
fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': 'Bearer ' + key } })
  .then(res => res.json())
  .then(data => console.log(data.data.map(m => m.id).join('\n')));
