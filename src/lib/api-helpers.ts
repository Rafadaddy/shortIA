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

  // PRIORIDAD 1: Usar la API Key local del servidor (process.env) si existe, pero respetando el modelo elegido en la UI.
  if (groqKey) {
    // Si el usuario seleccionó un modelo de Groq en la UI, usamos ese. Si no, usamos llama-3.3 por defecto.
    const model = (providerConfig?.providerId === "groq" && providerConfig?.model) 
      ? providerConfig.model 
      : "llama-3.3-70b-versatile";
      
    console.log(`[API-Helpers] Usando API key LOCAL del servidor | Modelo: ${model}`);
    return generateChatCompletion(
      { providerId: "groq", apiKey: groqKey, model },
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  }

  // PRIORIDAD 2: Usar la API Key y configuración enviada desde el cliente (UI)
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
      throw new Error(errMsg);
    }
  }

  throw new Error("No hay API key configurada. Abre Configuracion y agrega una API key.");
}
