import type { UserRepository } from "@/app/repositories";
import { BACKUP_CODES_QUANTITY } from "@/constants";
import { generateBackupCode, type Result } from "@/utils";
import { errors } from "./errors";

interface Request {
  email: string;
}

type Response = string[];

type Error = typeof errors.USER_NOT_FOUND | typeof errors.USER_2FA_DISABLED;

export class GenerateBackupCodesUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];
    if (!user.twoFactorAuthSecret) return [null, errors.USER_2FA_DISABLED];

    await this.userRepository.deleteAllBackupCodes(user.id);

    const length = BACKUP_CODES_QUANTITY;
    const codes = Array.from({ length }, () => generateBackupCode());

    await this.userRepository.createBackupCodes(user.id, codes);

    return [codes, null];
  }
}
