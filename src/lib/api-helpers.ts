import { ProviderConfig, generateChatCompletion } from "./ai-provider";

export async function chatCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const providerConfig = requestBody._provider as ProviderConfig | undefined;
  const groqKey = process.env.GROQ_API_KEY;

  console.log("[API-Helpers] GROQ_API_KEY from env:", groqKey ? "EXISTS" : "NOT FOUND");
  console.log("[API-Helpers] _provider from request:", providerConfig ? `${providerConfig.providerId} / ${providerConfig.model}` : "NULL");

  // PRIORITY 1: Use client provider config if fully configured
  if (providerConfig && providerConfig.apiKey) {
    console.log(`[API-Helpers] Using client provider: ${providerConfig.providerId} | Model: ${providerConfig.model}`);
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

  // PRIORITY 2: Fallback to server env var if no client key is provided
  if (groqKey) {
    // If the user selected a groq model but provided no key, try to use their selected model. Otherwise default to a stable model.
    const model = (providerConfig?.providerId === "groq" && providerConfig?.model) ? providerConfig.model : "llama-3.3-70b-versatile";
    console.log(`[API-Helpers] Using server Groq key | Model: ${model}`);
    return generateChatCompletion(
      { providerId: "groq", apiKey: groqKey, model },
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  }

  throw new Error("No hay API key configurada. Abre Configuracion y agrega una API key.");
}
