import { User } from "@/app/entities";

export interface UserRepository {
  getUserById(id: string): Promise<User | null>;
  createUser(user: User): Promise<boolean>;
}
