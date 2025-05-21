import type { UserRepository } from "@/app/repositories";
import type { ChatAdapter } from "@/app/adapters";
import type { Message } from "@/app/entities";
import { err, ok, type Result } from "@/utils";
import { errors } from "./errors";

type Request = {
  email: string;
  chatId: string;
  offset?: number;
};

type Response = {
  chatHistory: Message[];
};

type Error = typeof errors.USER_NOT_FOUND | typeof errors.USER_NOT_IN_CHAT;

export class GetChatHistoryUseCase {
  constructor(
    private userRepository: UserRepository,
    private chatAdapter: ChatAdapter,
  ) {}

  async execute(request: Request): Promise<Result<Response, Error>> {
    const { email, chatId, offset } = request;

    const user = await this.userRepository.findByEmail(email);
    if (!user) return err(errors.USER_NOT_FOUND);

    if (!(await this.chatAdapter.isUserInChat(user.id, chatId)))
      return err(errors.USER_NOT_IN_CHAT);

    const chatHistory = await this.chatAdapter.getChatHistory(chatId, offset);

    return ok({ chatHistory });
  }
}
