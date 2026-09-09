import Groq from "groq-sdk";
import OpenAI from "openai";

export interface ProviderConfig {
  providerId: string;
  apiKey: string;
  model: string;
}

interface ChatMessage {
  role: "user" | "system";
  content: string;
}

export async function generateChatCompletion(
  config: ProviderConfig,
  messages: ChatMessage[],
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const { providerId, apiKey, model } = config;
  const temperature = options?.temperature ?? 0.85;
  const jsonMode = options?.jsonMode ?? true;

  if (!apiKey) {
    throw new Error(`No API key configured for ${providerId}. Go to Settings to add one.`);
  }

  try {
    switch (providerId) {
      case "groq": {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
          messages,
          model,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          temperature,
        });
        return completion.choices[0]?.message?.content || "{}";
      }

      case "openai": {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          messages,
          model,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          temperature,
        });
        return completion.choices[0]?.message?.content || "{}";
      }

      case "anthropic": {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const anthropic = new Anthropic({ apiKey });
        const systemMessage = messages.find(m => m.role === "system")?.content || "";
        const userMessages = messages.filter(m => m.role === "user");
        const response = await anthropic.messages.create({
          model,
          max_tokens: 4096,
          system: systemMessage,
          messages: userMessages.map(m => ({ role: "user" as const, content: m.content })),
        });
        const textBlock = response.content[0];
        return textBlock?.type === "text" ? textBlock.text : "{}";
      }

      case "google": {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const genModel = genAI.getGenerativeModel({ model });
        const systemInstruction = messages.find(m => m.role === "system")?.content;
        const userPrompt = messages.filter(m => m.role === "user").map(m => m.content).join("\n");
        const result = await genModel.generateContent({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature,
            ...(jsonMode ? { responseMimeType: "application/json" } : {}),
          },
          ...(systemInstruction ? { systemInstruction } : {}),
        });
        return result.response.text() || "{}";
      }

      case "mistral": {
        const MistralClient = (await import("@mistralai/mistralai")).default;
        const mistral = new MistralClient({ apiKey });
        const response = await mistral.chat.complete({
          model,
          messages: messages.map(m => ({ role: m.role === "system" ? ("system" as const) : ("user" as const), content: m.content })),
          temperature,
        });
        return response.choices?.[0]?.message?.content || "{}";
      }

      case "deepseek": {
        const deepseekOpenai = new OpenAI({
          apiKey,
          baseURL: "https://api.deepseek.com",
        });
        const completion = await deepseekOpenai.chat.completions.create({
          messages,
          model,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          temperature,
        });
        return completion.choices[0]?.message?.content || "{}";
      }

      case "xai": {
        const xaiOpenai = new OpenAI({
          apiKey,
          baseURL: "https://api.x.ai/v1",
        });
        const completion = await xaiOpenai.chat.completions.create({
          messages,
          model,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          temperature,
        });
        return completion.choices[0]?.message?.content || "{}";
      }

      case "openrouter": {
        const openrouterOpenai = new OpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "anthropic/http-referer": "https://ai-studio.app",
            "anthropic/title": "AI Studio",
          },
        });
        const completion = await openrouterOpenai.chat.completions.create({
          messages,
          model,
          temperature,
        });
        return completion.choices[0]?.message?.content || "{}";
      }

      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[AI Provider Error] ${providerId}:`, errMsg);
    throw new Error(`Error from ${providerId}: ${errMsg}`);
  }
}
