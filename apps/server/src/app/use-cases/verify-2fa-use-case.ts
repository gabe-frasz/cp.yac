import type { UserRepository } from "@/app/repositories";
import { TOTPAdapter } from "@/app/adapters";

interface Verify2FARequest {
  email: string;
  code: string;
}

type Verify2FAResponse =
  | {
      success: true;
      error: null;
    }
  | {
      success: false;
      error: {
        name: "invalid-code";
        message: "Invalid code";
        status: 401;
      };
    };

export class Verify2FAUseCase {
  constructor(
    private userRepository: UserRepository,
    private totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Verify2FARequest): Promise<Verify2FAResponse> {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user)
      return {
        success: false,
        error: { name: "invalid-code", message: "Invalid code", status: 401 },
      };
    if (!user.twoFactorAuthSecret)
      return {
        success: false,
        error: { name: "invalid-code", message: "Invalid code", status: 401 },
      };

    const ok = this.totpAdapter.verify(code, user.twoFactorAuthSecret);
    if (!ok)
      return {
        success: false,
        error: { name: "invalid-code", message: "Invalid code", status: 401 },
      };

    return { success: true, error: null };
  }
}
