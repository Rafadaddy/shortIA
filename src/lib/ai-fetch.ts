"use client";

import { AIProvider } from "./SettingsContext";

export function getProviderConfig(): { providerId: string; apiKey: string; model: string } | null {
  try {
    const saved = localStorage.getItem("ai-studio-settings");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const provider = parsed.providers?.find((p: AIProvider) => p.id === parsed.activeProviderId);
    if (!provider || !provider.apiKey) return null;
    return {
      providerId: provider.id,
      apiKey: provider.apiKey,
      model: provider.selectedModel,
    };
  } catch {
    return null;
  }
}

export async function aiFetch(url: string, body: Record<string, unknown>): Promise<Response> {
  const config = getProviderConfig();
  const payload = { ...body, _provider: config };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
