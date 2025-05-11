import { User } from "@/app/entities";

export interface UserRepository {
  findById(id: string, include2FA?: boolean): Promise<User | null>;
  findByEmail(email: string, include2FA?: boolean): Promise<User | null>;
  create(user: User): Promise<void>;
  enable2FA(userId: string, secret: string): Promise<void>;
  disable2FA(userId: string): Promise<void>;
  getBackupCodes(
    userId: string,
  ): Promise<{ id: number; code: string }[] | null>;
  createBackupCodes(userId: string, codes: string[]): Promise<void>;
  deleteOneBackupCode(codeId: number): Promise<void>;
  deleteAllBackupCodes(userId: string): Promise<void>;
}
