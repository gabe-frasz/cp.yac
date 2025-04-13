import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations/",
  introspect: { casing: "camel" },
  dbCredentials: { url: env.DB_URL },
});
