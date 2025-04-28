import { eq } from "drizzle-orm";

import type { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";
import { DrizzleUserMapper } from "@/infra/database";
import { drizzle } from "@/lib";
import { usersTable } from "~/schema";

export class DrizzleUserRepository implements UserRepository {
  async findById(id: string) {
    const users = await drizzle
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return users.length > 0 ? DrizzleUserMapper.toDomain(users[0]) : null;
  }

  async findByEmail(email: string) {
    const users = await drizzle
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return users.length > 0 ? DrizzleUserMapper.toDomain(users[0]) : null;
  }

  async create(user: User) {
    await drizzle.insert(usersTable).values({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    return true;
  }
}
