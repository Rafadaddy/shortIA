import { ProviderConfig, generateChatCompletion } from "./ai-provider";

export async function chatCompletion(
  requestBody: Record<string, unknown>,
  prompt: string,
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const providerConfig = requestBody._provider as ProviderConfig | undefined;

  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error("No AI provider configured. Go to Settings to add an API key.");
  }

  return generateChatCompletion(
    providerConfig,
    [{ role: "user", content: prompt }],
    { temperature: options?.temperature, jsonMode: options?.jsonMode ?? true }
  );
}
