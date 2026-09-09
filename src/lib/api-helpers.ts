import { ProviderConfig, generateChatCompletion } from "./ai-provider";

export async function chatCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const providerConfig = requestBody._provider as ProviderConfig | undefined;

  if (!providerConfig) {
    throw new Error("No hay proveedor de IA configurado. Abre Configuracion y agrega una API key.");
  }

  if (!providerConfig.apiKey) {
    throw new Error(`Sin API key para ${providerConfig.providerId}. Abre Configuracion y agrega tu key.`);
  }

  if (!providerConfig.providerId) {
    throw new Error("Configuracion de proveedor invalida. Abre Configuracion y selecciona un proveedor.");
  }

  console.log(`[AI] Provider: ${providerConfig.providerId} | Model: ${providerConfig.model}`);

  try {
    return await generateChatCompletion(
      providerConfig,
      [{ role: "user", content: prompt }],
      { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[AI] Error from ${providerConfig.providerId}:`, errMsg);
    throw new Error(errMsg);
  }
}
