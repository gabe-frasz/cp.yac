import type { Message } from "@/app/entities";

export class HttpMessageMapper {
  static toHttp(message: Message) {
    return {
      id: message.id,
      senderId: message.senderId,
      text: message.text,
    };
  }
}
