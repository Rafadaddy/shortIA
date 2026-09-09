import { ProviderConfig, generateChatCompletion } from "./ai-provider";

export async function chatCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const providerConfig = requestBody._provider as ProviderConfig | undefined;
  const groqKey = process.env.GROQ_API_KEY;

  console.log("[API-Helpers] _provider from request:", providerConfig ? "EXISTS" : "NULL/UNDEFINED");
  console.log("[API-Helpers] GROQ_API_KEY from env:", groqKey ? "EXISTS (" + groqKey.substring(0, 8) + "...)" : "NOT FOUND");

  // If no provider config from client, fall back to env vars (legacy mode)
  if (!providerConfig || !providerConfig.apiKey) {
    if (groqKey) {
      console.log("[API-Helpers] Using fallback Groq from .env.local");
      return generateChatCompletion(
        { providerId: "groq", apiKey: groqKey, model: "llama-3.1-8b-instant" },
        [{ role: "user", content: prompt }],
        { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
      );
    }
    throw new Error("No hay API key configurada. Abre Configuracion y agrega una API key de Groq.");
  }

  console.log(`[API-Helpers] Using provider: ${providerConfig.providerId} | Model: ${providerConfig.model}`);

  try {
    return await generateChatCompletion(
      providerConfig,
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[API-Helpers] Error from ${providerConfig.providerId}:`, errMsg);
    throw new Error(errMsg);
  }
}
