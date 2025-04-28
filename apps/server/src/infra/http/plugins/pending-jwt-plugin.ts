import { t } from "elysia";
import jwt from "@elysiajs/jwt";

import { env } from "@/env";

export const pendingJwtPlugin = jwt({
  name: "pendingJwt",
  secret: env.PENDING_JWT_SECRET,
  schema: t.Object({
    sub: t.String({ format: "email" }),
    awaiting2fa: t.Boolean(),
  }),
});
