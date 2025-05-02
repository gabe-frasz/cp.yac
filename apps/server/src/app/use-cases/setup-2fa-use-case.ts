import type { UserRepository } from "@/app/repositories";
import type { TOTPAdapter } from "@/app/adapters";
import type { AuthCache } from "@/app/caches";

type Setup2FAUseCaseError =
  | {
      name: "user-not-found";
      message: "User not found";
      status: 401;
    }
  | {
      name: "user-already-setup";
      message: "User already setup";
      status: 401;
    };

interface Setup2FARequest {
  email: string;
}

type Setup2FAResponse =
  | {
      uri: string;
      error: null;
    }
  | {
      uri: null;
      error: Setup2FAUseCaseError;
    };

export class Setup2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private authCache: AuthCache,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email }: Setup2FARequest): Promise<Setup2FAResponse> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) {
      return {
        uri: null,
        error: {
          name: "user-not-found",
          message: "User not found",
          status: 401,
        },
      };
    }

    if (user.twoFactorAuthSecret) {
      return {
        uri: null,
        error: {
          name: "user-already-setup",
          message: "User already setup",
          status: 401,
        },
      };
    }

    const { uri, secret } = this.totpAdapter.generate(user.username);

    await this.authCache.addTo2FAAllowlist(user.id);
    await this.authCache.add2FASecret(user.id, secret);

    return { uri, error: null };
  }
}
