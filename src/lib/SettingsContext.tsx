"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  models: string[];
  apiKeyUrl: string;
  enabled: boolean;
  apiKey: string;
  selectedModel: string;
}

interface SettingsData {
  providers: AIProvider[];
  activeProviderId: string;
}

const defaultProviders: AIProvider[] = [
  {
    id: "groq",
    name: "Groq",
    icon: "⚡",
    color: "text-orange-400",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it", "openai/gpt-oss-120b", "openai/gpt-4o-mini"],
    apiKeyUrl: "https://console.groq.com/keys",
    enabled: true,
    apiKey: "",
    selectedModel: "llama-3.3-70b-versatile",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    color: "text-emerald-400",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    apiKeyUrl: "https://platform.openai.com/api-keys",
    enabled: false,
    apiKey: "",
    selectedModel: "gpt-4o",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    icon: "🧠",
    color: "text-amber-400",
    models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    enabled: false,
    apiKey: "",
    selectedModel: "claude-sonnet-4-20250514",
  },
  {
    id: "google",
    name: "Google Gemini",
    icon: "💎",
    color: "text-blue-400",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    apiKeyUrl: "https://aistudio.google.com/apikey",
    enabled: false,
    apiKey: "",
    selectedModel: "gemini-2.0-flash",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    icon: "🌊",
    color: "text-cyan-400",
    models: ["mistral-large-latest", "mistral-medium-latest", "open-mixtral-8x22b", "open-mixtral-8x7b"],
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    enabled: false,
    apiKey: "",
    selectedModel: "mistral-large-latest",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🔮",
    color: "text-violet-400",
    models: ["deepseek-chat", "deepseek-reasoner"],
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    enabled: false,
    apiKey: "",
    selectedModel: "deepseek-chat",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    icon: "✖",
    color: "text-sky-400",
    models: ["grok-2", "grok-2-mini"],
    apiKeyUrl: "https://console.x.ai/api-keys",
    enabled: false,
    apiKey: "",
    selectedModel: "grok-2",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: "🔀",
    color: "text-rose-400",
    models: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "google/gemini-2.0-flash", "meta-llama/llama-3.3-70b-instruct"],
    apiKeyUrl: "https://openrouter.ai/keys",
    enabled: false,
    apiKey: "",
    selectedModel: "openai/gpt-4o",
  },
];

const SettingsContext = createContext<{
  settings: SettingsData;
  updateProvider: (id: string, updates: Partial<AIProvider>) => void;
  setActiveProvider: (id: string) => void;
  getActiveProvider: () => AIProvider | undefined;
} | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>({
    providers: defaultProviders,
    activeProviderId: "groq",
  });

  useEffect(() => {
    const saved = localStorage.getItem("ai-studio-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = defaultProviders.map((dp) => {
          const savedProvider = parsed.providers?.find((p: AIProvider) => p.id === dp.id);
          return savedProvider ? { ...dp, ...savedProvider } : dp;
        });
        setSettings({
          providers: merged,
          activeProviderId: parsed.activeProviderId || "groq",
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-studio-settings", JSON.stringify(settings));
  }, [settings]);

  const updateProvider = (id: string, updates: Partial<AIProvider>) => {
    setSettings((prev) => {
      const newProviders = prev.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      // Auto-activate provider if API key is provided and provider was disabled
      let newActiveId = prev.activeProviderId;
      if (updates.apiKey && updates.apiKey.length > 10 && !prev.providers.find(p => p.id === id)?.enabled) {
        newActiveId = id;
      }
      return { providers: newProviders, activeProviderId: newActiveId };
    });
  };

  const setActiveProvider = (id: string) => {
    setSettings((prev) => ({ ...prev, activeProviderId: id }));
  };

  const getActiveProvider = () => {
    return settings.providers.find((p) => p.id === settings.activeProviderId);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateProvider, setActiveProvider, getActiveProvider }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
