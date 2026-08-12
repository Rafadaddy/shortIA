async function testAPI() {
  console.log("Testing API endpoint...");
  try {
    const res = await fetch("http://localhost:3000/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "idea",
        ideaText: "Un dato curioso de los gatos",
        duration: "30",
        voice: "es-MX"
      })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE BODY:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
testAPI();
