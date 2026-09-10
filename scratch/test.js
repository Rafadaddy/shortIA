const fetch = require('node-fetch'); // or use native fetch if Node 18+

async function runTest() {
  try {
    const res = await fetch('http://localhost:3000/api/generate-motivational', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: "Desarrollo personal",
        sceneCount: 3,
        _provider: {
          providerId: "groq",
          apiKey: process.env.GROQ_API_KEY || "dummy", // we don't have their real key if it's not in .env, wait!
          model: "llama-3.3-70b-versatile"
        }
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

runTest();
