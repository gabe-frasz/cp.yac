import type { UserRepository } from "@/app/repositories";
import type { TOTPAdapter } from "@/app/adapters";
import type { AuthCache } from "@/app/caches";
import type { Result } from "@/utils";
import { errors } from "./errors";

interface Request {
  email: string;
}

type Error =
  | typeof errors.USER_NOT_FOUND
  | typeof errors.USER_2FA_ALREADY_ENABLED;

type Response = { uri: string };

export class Setup2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private authCache: AuthCache,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email }: Request): Promise<Result<Response, Error>> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return [null, errors.USER_NOT_FOUND];

    if (user.twoFactorAuthSecret)
      return [null, errors.USER_2FA_ALREADY_ENABLED];

    const { uri, secret } = this.totpAdapter.generate(user.username);

    await this.authCache.addTo2FAAllowlist(user.id);
    await this.authCache.add2FASecret(user.id, secret);

    return [{ uri }, null];
  }
}
