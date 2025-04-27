import { Elysia, t } from "elysia";

import { CreateUserUseCase } from "@/app/use-cases";
import { DrizzleUserRepository } from "@/infra/database";

export const userRoute = new Elysia({ prefix: "/user" })
  .post(
    "/",
    async ({ body }) => {
      const { email } = body;

      const userRepository = new DrizzleUserRepository();
      const createUserUseCase = new CreateUserUseCase(userRepository);

      // TODO: send magic link instead of creating user
      await createUserUseCase.execute({ email });

      return new Response(null, { status: 200 });
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
      }),
    },
  )
  .get(
    "/verify",
    async ({ query }) => {
      const { token } = query;
      token;
      // TODO: verify token
      return Response.redirect("/login");
    },
    {
      query: t.Object({ token: t.String() }),
    },
  );
