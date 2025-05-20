import { Message } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";
import type { ChatAdapter, AIAgentAdapter } from "@/app/adapters";
import { type Result, ok, err } from "@/utils";
import { errors } from "./errors";

import { ulid } from "ulid";

type Request = {
  email: string;
  chatId?: string | undefined;
  message: {
    text: string;
  };
};

type Response = {
  aiResponse: AsyncGenerator<{ text: string }>;
  chatId: string;
};

type Error = typeof errors.USER_NOT_FOUND | typeof errors.USER_NOT_IN_CHAT;

export class SendUserMessageUseCase {
  constructor(
    private userRepository: UserRepository,
    private chatAdapter: ChatAdapter,
    private aiAgentAdapter: AIAgentAdapter,
  ) {}

  async execute(request: Request): Promise<Result<Response, Error>> {
    const { email, message } = request;

    const user = await this.userRepository.findByEmail(email);
    if (!user) return err(errors.USER_NOT_FOUND);

    await this.chatAdapter.upsertUser(user);

    const chatId = request.chatId ?? ulid();
    if (!request.chatId) await this.chatAdapter.createChat(chatId, user.id);

    if (!this.chatAdapter.isUserInChat(user.id, chatId))
      return err(errors.USER_NOT_IN_CHAT);

    const domainMessage = new Message({
      senderId: user.id,
      text: message.text,
    });

    await this.chatAdapter.sendMessage(chatId, domainMessage);

    const response = await this.aiAgentAdapter.getResponse(domainMessage);

    return ok({
      aiResponse: response as AsyncGenerator<{ text: string }>,
      chatId,
    });
  }
}
