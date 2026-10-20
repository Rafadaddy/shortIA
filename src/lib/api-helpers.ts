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

  // PRIORIDAD 2: Groq del servidor (Activo y ultra rápido)
  if (groqKey) {
    const model = "openai/gpt-oss-120b";
    console.log(`[API-Helpers] Usando API key GROQ del servidor | Modelo: ${model}`);
    try {
      return await generateChatCompletion(
        { providerId: "groq", apiKey: groqKey, model },
        [{ role: "user", content: prompt }],
        { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
      );
    } catch (groqErr) {
      console.warn("[API-Helpers] Error con Groq, probando otros...", groqErr);
    }
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  console.log("[API-Helpers] NVIDIA_API_KEY from env:", nvidiaKey ? "EXISTS" : "NOT FOUND");

  // PRIORIDAD 2: Usar NVIDIA si est� configurado (M�xima velocidad e inteligencia)
  if (nvidiaKey) {
    console.log(`[API-Helpers] Fallback a API key NVIDIA del servidor`);
    try {
      return await generateChatCompletion(
        { providerId: "nvidia", apiKey: nvidiaKey, model: "meta/llama-3.2-90b-vision-instruct" },
        [{ role: "user", content: prompt }],
        { temperature: options?.temperature, jsonMode: false }
      );
    } catch (error: unknown) {
      console.error(`[API-Helpers] NVIDIA fall�, pasando a Gemini...`);
    }
  }

  // PRIORIDAD 3: Usar GEMINI Key del servidor (process.env.GEMINI_API_KEY) con soporte para multiples llaves
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

// ---------- Parsing robusto de JSON ----------

export class JsonParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonParseError";
  }
}

/**
 * Extrae y parsea JSON de una respuesta de modelo. Tolerante a:
 * - fences de markdown (```json ... ```)
 * - texto explicativo antes/después del JSON
 * Si no hay JSON o está truncado/roto, lanza JsonParseError con contexto.
 */
export function parseJsonResponse(text: string): unknown {
  if (!text || !text.trim()) {
    throw new JsonParseError("El modelo devolvió una respuesta vacía.");
  }
  const clean = text
    .replace(/```(?:json|javascript|js)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");
  if (firstBrace === -1 && firstBracket === -1) {
    throw new JsonParseError(`El modelo no devolvió JSON. Respuesta: "${clean.slice(0, 120)}"`);
  }
  const start =
    firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);

  const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
  if (end <= start) {
    throw new JsonParseError(`El modelo no devolvió JSON completo. Respuesta: "${clean.slice(0, 120)}"`);
  }

  const candidate = clean.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new JsonParseError(`JSON inválido del modelo: ${msg}. Inicio: "${candidate.slice(0, 100)}"`);
  }
}

/**
 * Igual que chatCompletion, pero devuelve el JSON ya parseado.
 * Si el JSON llega malformado (p. ej. truncado por max_tokens), reintenta la
 * generación una vez más antes de fallar. Solo reintenta errores de parseo,
 * no errores de proveedor (claves, cuota, etc.).
 */
export async function chatJsonCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean; retries?: number }
): Promise<any> {
  const retries = options?.retries ?? 1;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const jsonText = await chatCompletion(requestBody, prompt, options);
      return parseJsonResponse(jsonText);
    } catch (e) {
      const isParseError = e instanceof JsonParseError;
      if (!isParseError || attempt === retries) {
        throw e;
      }
      console.warn(`[API-Helpers] JSON malformado, reintentando generación (intento ${attempt + 2} de ${retries + 1})...`);
    }
  }
}

export async function generateImageWithGemini(
  prompt: string,
  apiKey: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  // Configurar ratio en el prompt para guiar al modelo
  const ratioDescription = aspectRatio.includes("9:16") 
    ? "Vertical format aspect ratio 9:16 portrait orientation" 
    : aspectRatio.includes("16:9")
    ? "Horizontal format aspect ratio 16:9 landscape orientation"
    : `Aspect ratio ${aspectRatio}`;

  const enhancedPrompt = `${prompt}. ${ratioDescription}.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: enhancedPrompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[API-Helpers] Gemini Image Error:", err);
    throw new Error(`Gemini Image Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error("El modelo generó respuesta pero no devolvió los datos de la imagen");
}

