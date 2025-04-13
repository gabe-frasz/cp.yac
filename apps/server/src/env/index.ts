import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.number().default(3333),
    NODE_ENV: z.enum(["development", "production", "test"]),
    DB_URL: z.string(),
  },
  clientPrefix: "PUBLIC_",
  client: {},
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
