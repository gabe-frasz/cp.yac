import type { User, Message } from "@/app/entities";

export interface ChatAdapter {
  upsertUser(user: User): Promise<void>;
  isUserInChat(userId: string, chatId: string): Promise<boolean>;
  createChat(chatId: string, userId: string): Promise<void>;
  sendMessage(chatId: string, message: Message): Promise<void>;
}
