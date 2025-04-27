export interface MailingAdapterSendRequest {
  to: string | string[];
  subject?: string;
  text?: string;
  html: string;
}

export interface MailingAdapter {
  send(request: MailingAdapterSendRequest): Promise<void>;
}
