import { and, eq } from "drizzle-orm";

import type { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";
import { DrizzleUserMapper } from "@/infra/database";
import { drizzle } from "@/lib";
import { encrypt } from "@/utils";
import { usersTable, twoFactorAuthTable, backupCodesTable } from "~/schema";

export class DrizzleUserRepository implements UserRepository {
  async findById(id: string, include2FA?: boolean) {
    const users = await drizzle
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (users.length === 0) return null;
    if (!include2FA) return DrizzleUserMapper.toDomain(users[0]);

    const twoFactorAuth = await drizzle
      .select()
      .from(twoFactorAuthTable)
      .where(eq(twoFactorAuthTable.userId, id));

    if (twoFactorAuth.length === 0) return DrizzleUserMapper.toDomain(users[0]);

    return DrizzleUserMapper.toDomain(users[0], twoFactorAuth[0]);
  }

  async findByEmail(email: string, include2FA?: boolean) {
    const users = await drizzle
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) return null;
    if (!include2FA) return DrizzleUserMapper.toDomain(users[0]);

    const twoFactorAuth = await drizzle
      .select()
      .from(twoFactorAuthTable)
      .where(eq(twoFactorAuthTable.userId, users[0].id));

    if (twoFactorAuth.length === 0) return DrizzleUserMapper.toDomain(users[0]);

    return DrizzleUserMapper.toDomain(users[0], twoFactorAuth[0]);
  }

  async create(user: User) {
    await drizzle.insert(usersTable).values({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  async enable2FA(userId: string, secret: string) {
    await drizzle.insert(twoFactorAuthTable).values({
      userId,
      secret: encrypt(secret),
    });
  }

  async disable2FA(userId: string) {
    await drizzle
      .delete(twoFactorAuthTable)
      .where(eq(twoFactorAuthTable.userId, userId));
  }

  async getBackupCodes(userId: string) {
    const codes = await drizzle
      .select()
      .from(backupCodesTable)
      .where(eq(backupCodesTable.userId, userId));

    if (codes.length === 0) return null;

    return codes.map((code) => ({ id: code.id, code: code.code }));
  }

  async createBackupCodes(userId: string, codes: string[]) {
    const values = codes.map((code) => ({
      userId,
      code: Bun.password.hashSync(code),
    }));

    await drizzle.insert(backupCodesTable).values(values);
  }

  async deleteOneBackupCode(codeId: number) {
    await drizzle
      .delete(backupCodesTable)
      .where(eq(backupCodesTable.id, codeId));
  }

  async deleteAllBackupCodes(userId: string) {
    await drizzle
      .delete(backupCodesTable)
      .where(eq(backupCodesTable.userId, userId));
  }
}
