import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(["development", "production", "test"]),
    DB_URL: z.string().min(1),
    UPSTASH_REDIS_URL: z.url(),
    UPSTASH_REDIS_TOKEN: z.string().min(1),
    MAILTRAP_USERNAME: z.string().min(1),
    MAILTRAP_PASSWORD: z.string().min(1),
    FRONTEND_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    PENDING_JWT_SECRET: z.string().min(1),
    CRYPTO_KEY_SECRET: z.string().min(1),
    STREAM_API_KEY: z.string().min(1),
    STREAM_API_SECRET: z.string().min(1),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
