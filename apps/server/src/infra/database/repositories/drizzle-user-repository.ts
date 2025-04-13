import { eq } from "drizzle-orm";

import type { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";
import { DrizzleUserMapper } from "@/infra/database/mappers";
import { drizzle } from "@/lib";
import { usersTable } from "~/schema";

export class DrizzleUserRepository implements UserRepository {
  async getUserById(id: string) {
    const [user] = await drizzle
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return DrizzleUserMapper.toDomain(user);
  }

  async createUser(user: User) {
    await drizzle.insert(usersTable).values({
      id: user.id,
      email: user.email,
    });
    return true;
  }
}
