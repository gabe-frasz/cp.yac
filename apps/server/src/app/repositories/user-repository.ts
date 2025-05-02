import { User } from "@/app/entities";

export interface UserRepository {
  findById(id: string, include2FA?: boolean): Promise<User | null>;
  findByEmail(email: string, include2FA?: boolean): Promise<User | null>;
  create(user: User): Promise<void>;
  enableTwoFactorAuth(userId: string, secret: string): Promise<void>;
  disableTwoFactorAuth(userId: string): Promise<void>;
}
