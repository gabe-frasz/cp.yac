import { t } from "elysia";
import jwt from "@elysiajs/jwt";

import { PENDING_TOKEN_EXPIRATION } from "@/constants";
import { env } from "@/env";

export const pendingJwtPlugin = jwt({
  name: "pendingJwt",
  secret: env.PENDING_JWT_SECRET,
  schema: t.Object({
    sub: t.String({ format: "email" }),
    username: t.String(),
  }),
  exp: PENDING_TOKEN_EXPIRATION,
});
