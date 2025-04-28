import { Elysia, t } from "elysia";
import { ulid } from "ulid";

import { CreateUserUseCase, SendMagicLinkUseCase } from "@/app/use-cases";
import { MailtrapMailingAdapter } from "@/app/adapters";
import { RedisAuthCache } from "@/infra/cache";
import { DrizzleUserRepository } from "@/infra/database";
import { jwtPlugin, pendingJwtPlugin } from "@/infra/http/plugins";
import { tryCatch } from "@/utils";
import { TOKEN_MAX_AGE } from "@/constants";
import { env } from "@/env";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(pendingJwtPlugin)
  .post(
    "/magic-link/login",
    async ({ body, jwt }) => {
      const { username, email } = body;

      const jti = ulid();
      const token = await jwt.sign({ sub: email, username, jti });

      const authCache = new RedisAuthCache();
      await authCache.addToAllowlist(jti);

      const mailer = new MailtrapMailingAdapter();
      const sendMagicLinkUseCase = new SendMagicLinkUseCase(mailer);
      await sendMagicLinkUseCase.execute({ email, token });

      return new Response(null, { status: 200 });
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String({ format: "email" }),
      }),
    },
  )
  .get(
    "/magic-link/verify",
    async ({ query, jwt, pendingJwt, cookie }) => {
      const { token } = query;

      const [result, jwtError] = await tryCatch(jwt.verify(token));
      if (!result || jwtError)
        return new Response("Invalid token", { status: 401 });

      const { sub: email, username, jti } = result;

      const authCache = new RedisAuthCache();
      const [isAllowed, cacheError] = await tryCatch(authCache.getStatus(jti));
      if (!isAllowed || cacheError)
        return new Response("Expired or revoked token", { status: 401 });

      await authCache.removeFromAllowlist(jti);

      const userRepository = new DrizzleUserRepository();
      const user = await userRepository.findByEmail(email);
      if (!user) {
        const createUserUseCase = new CreateUserUseCase(userRepository);
        await createUserUseCase.execute({ email, username });
      }
      cookie["auth"].set({
        value: token,
        httpOnly: true,
        sameSite: "lax",
        maxAge: TOKEN_MAX_AGE,
      });

      return Response.redirect(env.FRONTEND_URL);
    },
    {
      query: t.Object({ token: t.String() }),
    },
  )
  .post("/2fa/setup", async () => {})
  .post("/2fa/enable", async () => {})
  .post("/2fa/verify", async () => {})
  .post("/2fa/disable", async () => {})
  .post("/logout", async () => {});
