import { Elysia } from "elysia";

import { authRoute, corsPlugin } from "@/infra/http";
import { env } from "@/env";

const app = new Elysia().use(corsPlugin).use(authRoute).listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
