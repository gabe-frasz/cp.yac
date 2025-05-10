import type { UserRepository } from "@/app/repositories";
import type { AuthCache } from "@/app/caches";
import type { Result } from "@/utils";
import type { TOTPAdapter } from "../adapters";
import { errors } from "./errors";

interface Request {
  email: string;
  code: string;
}

type Error =
  | typeof errors.USER_NOT_FOUND
  | typeof errors.INVALID_TOTP
  | typeof errors.EXPIRED_TOTP;

type Response = true;

export class Enable2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private authCache: AuthCache,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];

    const secret = await this.authCache.get2FASecret(user.id);
    if (!secret) return [null, errors.EXPIRED_TOTP];

    const ok = this.totpAdapter.verify(code, secret);
    if (!ok) return [null, errors.INVALID_TOTP];

    await this.authCache.removeFrom2FAAllowlist(user.id);
    await this.authCache.remove2FASecret(user.id);
    await this.userRepository.enable2FA(user.id, secret);

    return [true, null];
  }
}
