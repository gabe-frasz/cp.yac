import type { Message } from "@/app/entities";

export interface AIAgentAdapter {
  getResponse(message: Message): Promise<AsyncGenerator>;
}
