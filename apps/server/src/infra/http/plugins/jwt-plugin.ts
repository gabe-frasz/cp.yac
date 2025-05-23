import { t } from "elysia";
import { jwt } from "@elysiajs/jwt";

import { env } from "@/env";
import { TOKEN_EXPIRATION } from "@/constants";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
  schema: t.Object({
    sub: t.String({ format: "email" }),
    username: t.String(),
    jti: t.Optional(t.String()),
  }),
  exp: TOKEN_EXPIRATION,
});
