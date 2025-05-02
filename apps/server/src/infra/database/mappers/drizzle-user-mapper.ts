import { User } from "@/app/entities";
import { decrypt } from "@/utils";
import type { TwoFactorAuthTableSelect, UsersTableSelect } from "~/schema";

export class DrizzleUserMapper {
  static toDomain(
    user: UsersTableSelect,
    twoFactorAuth?: TwoFactorAuthTableSelect,
  ) {
    let secret: string | undefined;

    if (twoFactorAuth) secret = decrypt(twoFactorAuth.secret);

    return new User({
      id: user.id,
      email: user.email,
      username: user.username,
      twoFactorAuthSecret: secret,
    });
  }
}
