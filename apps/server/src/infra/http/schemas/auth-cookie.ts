import { t } from "elysia";

export const authCookie = t.Object({
  value: t.String(),
  httpOnly: t.Boolean(),
  maxAge: t.Number(),
});
