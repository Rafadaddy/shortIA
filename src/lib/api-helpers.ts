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
      console.error(`[API-Helpers] Error desde ${providerConfig.providerId}, intentando fallback a servidor local:`, errMsg);
      // No lanzamos error aquí, dejamos que intente la Prioridad 2
    }
  }

  // PRIORIDAD 2: Usar la API Key local del servidor (process.env) como fallback
  if (groqKey) {
    const model = "openai/gpt-oss-120b";
    console.log(`[API-Helpers] Fallback a API key LOCAL del servidor | Modelo forzado: ${model}`);
    return generateChatCompletion(
      { providerId: "groq", apiKey: groqKey, model },
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  }

  throw new Error("No hay API key configurada o la API key falló. Abre Configuracion y agrega una API key válida.");