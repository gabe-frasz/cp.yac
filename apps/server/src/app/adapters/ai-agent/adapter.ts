import type { Message } from "@/app/entities";

export type AIAgentOptions = {
  context?: string;
};

export interface AIAgentAdapter {
  getResponse(
    message: Message,
    options?: AIAgentOptions,
  ): Promise<AsyncGenerator>;
}
