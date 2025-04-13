import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// import { someRoute } from "@/infra/http/routes";
import { env } from "@/env";

const corsOptions = cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
});

const app = new Elysia()
  .use(corsOptions)
  .get("/", () => "Hello Elysia")
  // .use(someRoute)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
