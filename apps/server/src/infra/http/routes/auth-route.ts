import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { ulid } from "ulid";

import { CreateUserUseCase, SendMagicLinkUseCase } from "@/app/use-cases";
import { MailtrapMailingAdapter } from "@/app/adapters";
import { RedisAuthCache } from "@/infra/cache";
import { DrizzleUserRepository } from "@/infra/database";
import { tryCatch } from "@/utils";
import { TOKEN_MAX_AGE } from "@/constants";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: "some-secret",
      schema: t.Object({
        sub: t.String({ format: "email" }),
        username: t.String(),
        jti: t.String(),
      }),
    }),
  )
  .post(
    "/signup",
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
  .post("/login", async () => {})
  .post("/logout", async () => {})
  .get(
    "/magic-link",
    async ({ query, jwt, cookie }) => {
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
      const createUserUseCase = new CreateUserUseCase(userRepository);
      await createUserUseCase.execute({ email, username });

      cookie["auth"].set({
        value: token,
        httpOnly: true,
        maxAge: TOKEN_MAX_AGE,
      });

      return Response.redirect("http://localhost:3000/");
    },
    {
      query: t.Object({ token: t.String() }),
    },
  );
