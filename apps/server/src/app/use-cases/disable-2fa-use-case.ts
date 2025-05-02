import type { UserRepository } from "@/app/repositories";
import type { TOTPAdapter } from "@/app/adapters";

interface Disable2FARequest {
  email: string;
  code: string;
}

export class Disable2FAUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totpAdapter: TOTPAdapter,
  ) {}

  async execute({ email, code }: Disable2FARequest) {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) return { success: false };

    const isValid = this.totpAdapter.verify(code, user.twoFactorAuthSecret);
    if (!isValid) return { success: false };

    await this.userRepository.disableTwoFactorAuth(email);

    return { success: true };
  }
}
