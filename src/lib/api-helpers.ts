import { ProviderConfig, generateChatCompletion } from "./ai-provider";

export async function chatCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const providerConfig = requestBody._provider as ProviderConfig | undefined;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("[API-Helpers] GROQ_API_KEY from env:", groqKey ? "EXISTS" : "NOT FOUND");
  console.log("[API-Helpers] GEMINI_API_KEY from env:", geminiKey ? "EXISTS" : "NOT FOUND");
  console.log("[API-Helpers] _provider from request:", providerConfig ? `${providerConfig.providerId} / ${providerConfig.model}` : "NULL");

  // PRIORIDAD 1: Usar la API Key y configuración enviada desde el cliente (UI)
  if (providerConfig && providerConfig.apiKey) {
    console.log(`[API-Helpers] Usando configuración del cliente: ${providerConfig.providerId} | Modelo: ${providerConfig.model}`);
    try {
      return await generateChatCompletion(
        providerConfig,
        [{ role: "user", content: prompt }],
        { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`[API-Helpers] Error desde ${providerConfig.providerId}:`, errMsg);
      console.error(`[API-Helpers] Fallando a claves locales si existen...`);
    }
  }

  // PRIORIDAD 2: Usar GEMINI Key del servidor (process.env.GEMINI_API_KEY) con soporte para multiples llaves
  if (geminiKey) {
    const keys = geminiKey.split(',').map(k => k.trim()).filter(Boolean);
    console.log(`[API-Helpers] Fallback a API key GEMINI del servidor (${keys.length} llaves detectadas)`);
    
    for (const key of keys) {
      try {
        return await generateChatCompletion(
          { providerId: "google", apiKey: key, model: "gemini-2.0-flash" },
          [{ role: "user", content: prompt }],
          { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
        );
      } catch (error: unknown) {
        console.error(`[API-Helpers] La llave de Gemini terminada en ...${key.slice(-4)} falló. Intentando con la siguiente si existe...`);
      }
    }
    console.error(`[API-Helpers] Todas las llaves de Gemini fallaron. Pasando al salvavidas final (Groq).`);
  }

  // PRIORIDAD 3: Usar la API Key de Groq local del servidor (process.env) como último fallback
  if (groqKey) {
    const model = "openai/gpt-oss-120b";
    console.log(`[API-Helpers] Fallback a API key GROQ del servidor | Modelo forzado: ${model}`);
    return generateChatCompletion(
      { providerId: "groq", apiKey: groqKey, model },
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  }

  throw new Error("No hay API key configurada. Abre Configuracion y agrega una API key.");
}

export async function generateImageWithGemini(
  prompt: string,
  apiKey: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  // Map standard aspect ratios to Gemini supported formats
  let geminiRatio = "1:1";
  if (aspectRatio.includes("16:9")) geminiRatio = "16:9";
  if (aspectRatio.includes("9:16")) geminiRatio = "9:16";
  if (aspectRatio.includes("3:4")) geminiRatio = "3:4";
  if (aspectRatio.includes("4:3")) geminiRatio = "4:3";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: geminiRatio,
        outputOptions: { mimeType: "image/jpeg" },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[API-Helpers] Gemini Image Error:", err);
    throw new Error(`Gemini Image Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.predictions && data.predictions.length > 0) {
    return data.predictions[0].bytesBase64Encoded;
  }
  
  throw new Error("No se pudo generar la imagen con Gemini");
}
