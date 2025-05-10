import type { UserRepository } from "@/app/repositories";
import type { Result } from "@/utils";
import { errors } from "./errors";

interface Request {
  email: string;
  code: string;
}

type Response = boolean;

type Error = typeof errors.USER_NOT_FOUND | typeof errors.USER_2FA_DISABLED;

export class VerifyBackupCodeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email, code }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];
    if (!user.twoFactorAuthSecret) return [null, errors.USER_2FA_DISABLED];

    const codes = await this.userRepository.getBackupCodes(user.id);
    if (!codes) return [null, errors.USER_2FA_DISABLED];

    const isValid = codes.some((c) => Bun.password.verifySync(code, c));
    if (!isValid) return [false, null];

    await this.userRepository.deleteOneBackupCode(user.id, code);

    return [true, null];
  }
}
