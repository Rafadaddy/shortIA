require('dotenv').config({ path: '.env.local' });
const { POST } = require('./.next/server/app/api/generate-motivational/route.js');

async function run() {
  const req = {
    json: async () => ({
      niche: 'Hábitos tóxicos y crecimiento',
      idea: 'De la autocompasión al impulso de acción',
      tone: 'Emotivo',
      style: 'Cinemático Oscuro',
      sceneCount: 7,
      duration: '10 Segundos',
      _provider: { providerId: 'google', apiKey: process.env.GROQ_API_KEY, model: 'gemini-2.0-flash' } // mock
    })
  };

  try {
    const res = await POST(req);
    const json = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Uncaught Server Error:", e);
  }
}
run();
