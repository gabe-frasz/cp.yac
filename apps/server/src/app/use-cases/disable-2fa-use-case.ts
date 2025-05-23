import type { UserRepository } from "@/app/repositories";
import type { TOTPAdapter } from "@/app/adapters";
import type { Result } from "@/utils";
import { errors } from "./errors";

interface Request {
  email: string;
  code: string;
}

type Response = true;

type Error =
  | typeof errors.USER_NOT_FOUND
  | typeof errors.USER_2FA_DISABLED
  | typeof errors.INVALID_TOTP;

export class Disable2FAUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];

    if (!user.twoFactorAuthSecret) return [null, errors.USER_2FA_DISABLED];

    const isValid = this.totpAdapter.verify(code, user.twoFactorAuthSecret);
    if (!isValid) return [null, errors.INVALID_TOTP];

    await this.userRepository.disable2FA(email);

    return [true, null];
  }
}
