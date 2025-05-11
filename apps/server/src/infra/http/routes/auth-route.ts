import { Elysia, t } from "elysia";
import { ulid } from "ulid";

import {
  CreateUserUseCase,
  SendMagicLinkUseCase,
  VerifyMagicLinkUseCase,
  Setup2FAUseCase,
  Enable2FAUseCase,
  Verify2FAUseCase,
  Disable2FAUseCase,
  GenerateBackupCodesUseCase,
  RemoveBackupCodesUseCase,
  VerifyBackupCodeUseCase,
} from "@/app/use-cases";
import { MailtrapMailingAdapter, TOTPAuthAdapter } from "@/app/adapters";
import { RedisAuthCache } from "@/infra/cache";
import { DrizzleUserRepository } from "@/infra/database";
import { jwtPlugin, pendingJwtPlugin } from "@/infra/http/plugins";
import { TOKEN_MAX_AGE, PENDING_TOKEN_MAX_AGE } from "@/constants";
import { env } from "@/env";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(pendingJwtPlugin)
  .post(
    "/magic-link/login",
    async ({ body, cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (result) return Response.redirect("http://localhost:3000");

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
      cookie: t.Cookie({ auth: t.Optional(t.String()) }),
    },
  )
  .get(
    "/magic-link/verify",
    async ({ query, jwt, pendingJwt, cookie }) => {
      let { token } = query;

      const result = await jwt.verify(token);
      if (!result || !result.jti)
        return new Response("Invalid token", { status: 401 });

      const { sub: email, username, jti } = result;

      const authCache = new RedisAuthCache();
      const verifyMagicLinkUseCase = new VerifyMagicLinkUseCase(authCache);

      const isAllowed = await verifyMagicLinkUseCase.execute({ jti });
      if (!isAllowed)
        return new Response("Expired or revoked token", { status: 401 });

      const userRepository = new DrizzleUserRepository();
      const user = await userRepository.findByEmail(email, true);
      if (!user) {
        const createUserUseCase = new CreateUserUseCase(userRepository);
        await createUserUseCase.execute({ email, username });
      }

      let maxAge = TOKEN_MAX_AGE;
      let redirectUrl = env.FRONTEND_URL;

      if (user && user.twoFactorAuthSecret) {
        token = await pendingJwt.sign({ sub: email, username });
        maxAge = PENDING_TOKEN_MAX_AGE;
        redirectUrl = "http://localhost:3000/login?twoFA=true";
      }

      cookie.auth.set({
        value: token,
        httpOnly: true,
        sameSite: "lax",
        maxAge,
      });

      return Response.redirect(redirectUrl);
    },
    {
      query: t.Object({ token: t.String() }),
      cookie: t.Cookie({ auth: t.Optional(t.String()) }),
    },
  )
  .get(
    "/2fa/setup",
    async ({ cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email } = result;

      const userRepository = new DrizzleUserRepository();
      const authCache = new RedisAuthCache();
      const totpAdapter = new TOTPAuthAdapter();

      const setup2FAUseCase = new Setup2FAUseCase(
        userRepository,
        authCache,
        totpAdapter,
      );
      const [data, error] = await setup2FAUseCase.execute({ email });

      if (error) {
        switch (error.name) {
          case "USER_NOT_FOUND":
            return new Response("Internal server error", { status: 500 });
          case "USER_2FA_ALREADY_ENABLED":
            return new Response(error.message, {
              status: 400,
            });
        }
      }

      const responseBody = JSON.stringify({
        uri: encodeURIComponent(data.uri),
      });

      return new Response(responseBody, { status: 200 });
    },
    { cookie: t.Cookie({ auth: t.String() }) },
  )
  .post(
    "/2fa/enable",
    async ({ body, cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email } = result;
      const { code } = body;

      const userRepository = new DrizzleUserRepository();
      const authCache = new RedisAuthCache();
      const totpAdapter = new TOTPAuthAdapter();

      const enable2FAUseCase = new Enable2FAUseCase(
        userRepository,
        authCache,
        totpAdapter,
      );
      const [success, enable2FAError] = await enable2FAUseCase.execute({
        email,
        code,
      });

      if (!success) {
        switch (enable2FAError.name) {
          case "USER_NOT_FOUND":
            return new Response("Internal server error", { status: 500 });
          case "INVALID_TOTP":
          case "EXPIRED_TOTP":
            return new Response(enable2FAError.message, { status: 401 });
        }
      }

      const generateBackupCodesUseCase = new GenerateBackupCodesUseCase(
        userRepository,
      );
      const [backupCodes, generateBackupCodesError] =
        await generateBackupCodesUseCase.execute({ email });

      if (generateBackupCodesError) {
        switch (generateBackupCodesError.name) {
          case "USER_NOT_FOUND":
            return new Response("Internal server error", { status: 500 });
          case "USER_2FA_DISABLED":
            return new Response(generateBackupCodesError.message, {
              status: 400,
            });
        }
      }

      const responseBody = JSON.stringify({ backupCodes });
      return new Response(responseBody, { status: 200 });
    },
    {
      body: t.Object({ code: t.String() }),
      cookie: t.Cookie({ auth: t.String() }),
    },
  )
  .post(
    "/2fa/verify",
    async ({ body, cookie, jwt, pendingJwt }) => {
      const result = await pendingJwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email, username } = result;
      const { code } = body;

      const userRepository = new DrizzleUserRepository();
      const totpAdapter = new TOTPAuthAdapter();

      const verify2FAUseCase = new Verify2FAUseCase(
        userRepository,
        totpAdapter,
      );
      const [success, error] = await verify2FAUseCase.execute({
        email,
        code,
      });

      if (!success) {
        switch (error.name) {
          case "USER_NOT_FOUND":
          case "USER_2FA_DISABLED":
            return new Response("Internal server error", { status: 500 });
          case "INVALID_TOTP":
            return new Response("Invalid code", { status: 401 });
        }
      }

      cookie.auth.set({
        value: await jwt.sign({ sub: email, username }),
        httpOnly: true,
        sameSite: "lax",
        maxAge: TOKEN_MAX_AGE,
      });

      return Response.redirect("http://localhost:3000");
    },
    {
      body: t.Object({ code: t.String() }),
      cookie: t.Cookie({ auth: t.String() }),
    },
  )
  .delete(
    "/2fa/disable",
    async ({ body, cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email } = result;
      const { code } = body;

      const userRepository = new DrizzleUserRepository();
      const totpAdapter = new TOTPAuthAdapter();

      const disable2FAUseCase = new Disable2FAUseCase(
        userRepository,
        totpAdapter,
      );
      const [disabled, disable2FAError] = await disable2FAUseCase.execute({
        email,
        code,
      });

      if (!disabled) {
        switch (disable2FAError.name) {
          case "USER_NOT_FOUND":
          case "USER_2FA_DISABLED":
            return new Response("Internal server error", { status: 500 });
          case "INVALID_TOTP":
            return new Response("Invalid code", { status: 401 });
        }
      }

      const removeBackupCodesUseCase = new RemoveBackupCodesUseCase(
        userRepository,
      );
      const [removed, removeBackupCodesError] =
        await removeBackupCodesUseCase.execute({ email });

      if (!removed) {
        switch (removeBackupCodesError.name) {
          case "USER_NOT_FOUND":
          case "USER_2FA_DISABLED":
            return new Response("Internal server error", { status: 500 });
        }
      }

      return new Response(null, { status: 200 });
    },
    {
      body: t.Object({ code: t.String() }),
      cookie: t.Cookie({ auth: t.String() }),
    },
  )
  .post(
    "/backup-codes/verify",
    async ({ body, cookie, jwt, pendingJwt }) => {
      const result = await pendingJwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email, username } = result;
      const { code } = body;

      const userRepository = new DrizzleUserRepository();
      const verifyBackupCodeUseCase = new VerifyBackupCodeUseCase(
        userRepository,
      );
      const [success, error] = await verifyBackupCodeUseCase.execute({
        email,
        code,
      });

      if (error) {
        switch (error.name) {
          case "USER_NOT_FOUND":
          case "USER_2FA_DISABLED":
            return new Response("Internal server error", { status: 500 });
        }
      }

      if (!success) return new Response("Invalid code", { status: 401 });

      cookie.auth.set({
        value: await jwt.sign({ sub: email, username }),
        httpOnly: true,
        sameSite: "lax",
        maxAge: TOKEN_MAX_AGE,
      });

      return Response.redirect("http://localhost:3000");
    },
    {
      body: t.Object({ code: t.String() }),
      cookie: t.Cookie({ auth: t.String() }),
    },
  )
  .post(
    "/backup-codes/reset",
    async ({ cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      const { sub: email } = result;

      const userRepository = new DrizzleUserRepository();
      const removeBackupCodesUseCase = new RemoveBackupCodesUseCase(
        userRepository,
      );
      const [removed, removeBackupCodesError] =
        await removeBackupCodesUseCase.execute({ email });

      if (!removed) {
        switch (removeBackupCodesError.name) {
          case "USER_NOT_FOUND":
            return new Response("Internal server error", { status: 500 });
          case "USER_2FA_DISABLED":
            return new Response(removeBackupCodesError.message, {
              status: 400,
            });
        }
      }

      const generateBackupCodesUseCase = new GenerateBackupCodesUseCase(
        userRepository,
      );
      const [backupCodes, generateBackupCodesError] =
        await generateBackupCodesUseCase.execute({ email });

      if (generateBackupCodesError) {
        switch (generateBackupCodesError.name) {
          case "USER_NOT_FOUND":
          case "USER_2FA_DISABLED":
            return new Response("Internal server error", { status: 500 });
        }
      }

      return new Response(JSON.stringify({ backupCodes }), { status: 200 });
    },
    {
      cookie: t.Cookie({ auth: t.String() }),
    },
  )
  .delete(
    "/logout",
    async ({ cookie, jwt }) => {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Invalid token", { status: 401 });

      cookie.auth.remove();

      return Response.redirect("http://localhost:3000/login");
    },
    { cookie: t.Cookie({ auth: t.String() }) },
  );
