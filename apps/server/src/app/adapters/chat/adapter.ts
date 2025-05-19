import type { User, Message } from "@/app/entities";

export interface ChatAdapter {
  findUserById(userId: string): Promise<boolean>;
  upsertUser(user: User): Promise<void>;
  createChat(chatId: string, userId: string): Promise<void>;
  sendMessage(chatId: string, message: Message): Promise<void>;
}
