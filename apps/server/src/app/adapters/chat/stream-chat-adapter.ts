import type { User, Message } from "@/app/entities";
import { AI_AGENT_CHAT_ID } from "@/constants";
import { stream } from "@/lib";
import type { ChatAdapter } from "./adapter";

export class StreamChatAdapter implements ChatAdapter {
  async findUserById(userId: string) {
    const { users } = await stream.queryUsers({ id: userId });
    return users.length > 0;
  }

  async upsertUser(user: User) {
    await stream.upsertUser({
      id: user.id,
      username: user.username,
      role: "user",
    });
  }

  async createChat(chatId: string, userId: string) {
    await stream
      .channel("messaging", chatId, {
        members: [
          { user_id: userId, channel_role: "user" },
          { user_id: AI_AGENT_CHAT_ID, channel_role: "user" },
        ],
        created_by_id: userId,
      })
      .create();
  }

  async sendMessage(chatId: string, message: Message) {
    const channel = stream.getChannelById("messaging", chatId, {});

    await channel.sendMessage({
      id: message.id,
      user_id: message.senderId,
      text: message.text,
    });
  }
}
