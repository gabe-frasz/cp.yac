import { eq } from "drizzle-orm";

import type { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";
import { DrizzleUserMapper } from "@/infra/database";
import { drizzle } from "@/lib";
import { tables } from "~/schema";

export class DrizzleUserRepository implements UserRepository {
  async getUserById(id: string) {
    const [user] = await drizzle
      .select()
      .from(tables.users)
      .where(eq(tables.users.id, id));
    return DrizzleUserMapper.toDomain(user);
  }

  async createUser(user: User) {
    await drizzle.insert(tables.users).values({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    return true;
  }
}
