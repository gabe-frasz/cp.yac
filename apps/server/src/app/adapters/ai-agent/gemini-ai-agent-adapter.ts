import type { Message } from "@/app/entities";
import { gemini } from "@/lib";
import type { AIAgentAdapter } from "./adapter";

export class GeminiAIAgentAdapter implements AIAgentAdapter {
  async getResponse(message: Message) {
    return gemini.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: message.text,
    });
  }
}
