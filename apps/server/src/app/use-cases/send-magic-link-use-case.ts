import type { MailingAdapter } from "@/app/adapters";

interface SendMagicLinkRequest {
  email: string;
  token: string;
}

export class SendMagicLinkUseCase {
  constructor(private mailer: MailingAdapter) {}

  async execute({ email, token }: SendMagicLinkRequest) {
    const link = `http://localhost:3333/auth/magic-link/verify?token=${token}`;
    await this.mailer.send({ to: email, html: link });
  }
}
