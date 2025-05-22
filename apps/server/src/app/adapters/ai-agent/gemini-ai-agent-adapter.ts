import type { Message } from "@/app/entities";
import { gemini } from "@/lib";
import type { AIAgentAdapter, AIAgentOptions } from "./adapter";

export class GeminiAIAgentAdapter implements AIAgentAdapter {
  async getResponse(message: Message, options?: AIAgentOptions) {
    const { context } = options ?? {};

    let prompt = "You are a helpful assistant.\n";

    if (context)
      prompt += `Here are the past messages between you and the user:\n${context}\n\n`;

    prompt += `The user is asking you to respond to the following message:\n${message.text}\n\n`;
    prompt += `Respond to the user's message as plain text or markdown code block when necessary.`;

    return gemini.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
  }
}
