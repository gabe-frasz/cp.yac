import { MAILING_FROM } from "@/constants";
import { nodemailer } from "@/lib";
import type { MailingAdapter, MailingAdapterSendRequest } from "./adapter";

export class MailtrapMailingAdapter implements MailingAdapter {
  async send(request: MailingAdapterSendRequest) {
    await nodemailer.sendMail({
      from: MAILING_FROM,
      to: request.to,
      subject: request.subject,
      text: request.text,
      html: request.html,
    });
  }
}
