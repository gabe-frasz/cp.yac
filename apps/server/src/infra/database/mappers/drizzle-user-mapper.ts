import { User } from "@/app/entities";
import { type UsersTableSelect } from "~/schema";

export class DrizzleUserMapper {
  static toDomain(user: UsersTableSelect) {
    return new User({
      id: user.id,
      email: user.email,
    });
  }
}
