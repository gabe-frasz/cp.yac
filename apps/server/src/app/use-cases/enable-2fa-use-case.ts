import type { UserRepository } from "@/app/repositories";
import type { AuthCache } from "@/app/caches";
import type { TOTPAdapter } from "../adapters";

const errors = [
  {
    name: "user-not-found",
    message: "User not found",
    status: 401,
  },
  {
    name: "secret-not-found",
    message: "Secret not found",
    status: 401,
  },
  {
    name: "invalid-code",
    message: "Invalid code",
    status: 401,
  },
] as const;

type Enable2FAUseCaseError = (typeof errors)[number];

function getError(name: Enable2FAUseCaseError["name"]) {
  return errors.find((error) => error.name === name)!;
}

interface Enable2FARequest {
  email: string;
  code: string;
}

type Enable2FAResponse =
  | {
      success: true;
      error: null;
    }
  | {
      success: false;
      error: Enable2FAUseCaseError;
    };

export class Enable2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private authCache: AuthCache,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Enable2FARequest): Promise<Enable2FAResponse> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) {
      return {
        success: false,
        error: getError("user-not-found"),
      };
    }

    const secret = await this.authCache.get2FASecret(user.id);
    if (!secret) {
      return {
        success: false,
        error: getError("secret-not-found"),
      };
    }

    const ok = this.totpAdapter.verify(code, secret);
    if (!ok) {
      return {
        success: false,
        error: getError("invalid-code"),
      };
    }

    await this.authCache.removeFrom2FAAllowlist(user.id);
    await this.authCache.remove2FASecret(user.id);
    await this.userRepository.enableTwoFactorAuth(user.id, secret);

    return { success: true, error: null };
  }
}
