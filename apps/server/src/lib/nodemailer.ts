import { createTransport } from "nodemailer";

import { env } from "@/env";

export const nodemailer = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: env.MAILTRAP_USERNAME,
    pass: env.MAILTRAP_PASSWORD,
  },
});
