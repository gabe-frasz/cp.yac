import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").notNull(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  twoFactorAuth: one(twoFactorAuthTable),
}));

export type UsersTableSelect = typeof usersTable.$inferSelect;
export type UsersTableInsert = typeof usersTable.$inferInsert;

export const twoFactorAuthTable = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  secret: varchar("secret").notNull(),
});

export const twoFactorAuthRelations = relations(
  twoFactorAuthTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [twoFactorAuthTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type TwoFactorAuthTableSelect = typeof twoFactorAuthTable.$inferSelect;
export type TwoFactorAuthTableInsert = typeof twoFactorAuthTable.$inferInsert;

export type UsersTableSelectWith2FA = {
  users: UsersTableSelect;
  twoFactorAuth: TwoFactorAuthTableSelect;
};
