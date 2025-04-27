import { t } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: "some-secret",
  schema: t.Object({
    sub: t.String({ format: "email" }),
    username: t.String(),
    jti: t.String(),
  }),
});
