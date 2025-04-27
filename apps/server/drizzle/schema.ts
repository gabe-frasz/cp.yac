import { pgTable, varchar } from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").notNull(),
});

export type UsersTableSelect = typeof users.$inferSelect;
export type UsersTableInsert = typeof users.$inferInsert;

export const tables = {
  users,
};
