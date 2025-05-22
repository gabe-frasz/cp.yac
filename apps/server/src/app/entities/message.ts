import { z } from "zod";
import { ulid } from "ulid";

import { AI_AGENT_CHAT_ID } from "@/constants";

const messageSchema = z.object({
  id: z.ulid().default(ulid),
  senderId: z.union([z.literal(AI_AGENT_CHAT_ID), z.ulid()]),
  text: z.string(),
});

type MessageProps = z.output<typeof messageSchema>;
type MessageConstructorProps = z.input<typeof messageSchema>;

export class Message {
  private props: MessageProps;

  constructor(props: MessageConstructorProps) {
    this.props = this.validate(props);
  }

  get id() {
    return this.props.id;
  }

  get senderId() {
    return this.props.senderId;
  }

  get text() {
    return this.props.text;
  }

  toString() {
    return `${this.senderId}: ${this.text}`;
  }

  private validate(props: MessageConstructorProps) {
    const { success, error, data } = messageSchema.safeParse(props);
    if (!success) throw new Error(z.prettifyError(error));

    return data;
  }
}
