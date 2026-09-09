declare module "@mistralai/mistralai" {
  interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
  }

  interface ChatResponse {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  }

  interface ChatParams {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
  }

  export default class MistralAI {
    constructor(options: { apiKey: string });
    chat: {
      complete(params: ChatParams): Promise<ChatResponse>;
    };
  }
}
