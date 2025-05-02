import type { AuthCache } from "@/app/caches";

interface VerifyMagicLinkRequest {
  jti: string;
}

export class VerifyMagicLinkUseCase {
  constructor(private authCache: AuthCache) {}

  async execute({ jti }: VerifyMagicLinkRequest) {
    const isAllowed = await this.authCache.getAllowlistStatus(jti);
    if (!isAllowed) return false;

    await this.authCache.removeFromAllowlist(jti);
    return true;
  }
}
