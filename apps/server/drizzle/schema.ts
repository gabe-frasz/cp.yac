import { pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").notNull(),
});

export type UsersTableSelect = typeof usersTable.$inferSelect;
export type UsersTableInsert = typeof usersTable.$inferInsert;
