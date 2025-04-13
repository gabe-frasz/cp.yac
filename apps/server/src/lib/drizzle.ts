import { drizzle as createDrizzleClient } from "drizzle-orm/postgres-js";

import { env } from "@/env";

export const drizzle = createDrizzleClient(env.DB_URL);
