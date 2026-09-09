"use client";

import { AIProvider } from "./SettingsContext";

export function getProviderConfig(): { providerId: string; apiKey: string; model: string } | null {
  try {
    const saved = localStorage.getItem("ai-studio-settings");
    if (!saved) {
      console.error("[aiFetch] No settings found in localStorage");
      return null;
    }
    const parsed = JSON.parse(saved);
    console.log("[aiFetch] Active provider ID:", parsed.activeProviderId);
    const provider = parsed.providers?.find((p: AIProvider) => p.id === parsed.activeProviderId);
    if (!provider) {
      console.error("[aiFetch] Provider not found:", parsed.activeProviderId);
      return null;
    }
    if (!provider.apiKey) {
      console.error("[aiFetch] No API key for provider:", provider.id);
      return null;
    }
    console.log("[aiFetch] Using provider:", provider.id, "model:", provider.selectedModel);
    return {
      providerId: provider.id,
      apiKey: provider.apiKey,
      model: provider.selectedModel,
    };
  } catch (e) {
    console.error("[aiFetch] Error reading settings:", e);
    return null;
  }
}

export async function aiFetch(url: string, body: Record<string, unknown>): Promise<Response> {
  const config = getProviderConfig();
  if (!config) {
    console.error("[aiFetch] No provider config available!");
  }
  const payload = { ...body, _provider: config };
  console.log("[aiFetch] Sending to:", url, "provider:", config?.providerId);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
