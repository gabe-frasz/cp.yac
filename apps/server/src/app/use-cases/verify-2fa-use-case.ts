import type { UserRepository } from "@/app/repositories";
import type { TOTPAdapter } from "@/app/adapters";
import type { Result } from "@/utils";
import { errors } from "./errors";

interface Request {
  email: string;
  code: string;
}

type Error =
  | typeof errors.USER_NOT_FOUND
  | typeof errors.USER_2FA_DISABLED
  | typeof errors.INVALID_TOTP;

type Response = true;

export class Verify2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];
    if (!user.twoFactorAuthSecret) return [null, errors.USER_2FA_DISABLED];

    const ok = this.totpAdapter.verify(code, user.twoFactorAuthSecret);
    if (!ok) return [null, errors.INVALID_TOTP];

    return [true, null];
  }
}
