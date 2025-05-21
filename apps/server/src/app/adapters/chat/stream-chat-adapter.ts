import { type User, Message } from "@/app/entities";
import { AI_AGENT_CHAT_ID, MAX_MESSAGES_PER_REQUEST } from "@/constants";
import { stream } from "@/lib";
import type { ChatAdapter } from "./adapter";

export class StreamChatAdapter implements ChatAdapter {
  async upsertUser(user: User) {
    await stream.upsertUser({
      id: user.id,
      username: user.username,
      role: "user",
    });
  }

  async isUserInChat(userId: string, chatId: string) {
    const channels = await stream.queryChannels({
      id: chatId,
      type: "messaging",
      members: { $in: [userId] },
    });
    return channels.length > 0;
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

  async getChatHistory(chatId: string, offset: number = 0) {
    const channel = stream.getChannelById("messaging", chatId, {});
    const lastMessage = channel.lastMessage();
    if (!lastMessage) return [];

    const { messages } = await channel.query({
      messages: {
        limit: MAX_MESSAGES_PER_REQUEST,
        offset,
        id_lte: lastMessage.id,
      },
    });

    // TODO: handle undefined keys

    return messages.map(
      (message) =>
        new Message({
          id: message.id,
          senderId: message.user_id!,
          text: message.text!,
        }),
    );
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
