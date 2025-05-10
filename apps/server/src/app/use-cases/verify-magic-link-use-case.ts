import type { AuthCache } from "@/app/caches";

interface Request {
  jti: string;
}

export class VerifyMagicLinkUseCase {
  constructor(private authCache: AuthCache) {}

  async execute({ jti }: Request) {
    const isAllowed = await this.authCache.getAllowlistStatus(jti);
    if (!isAllowed) return false;

    await this.authCache.removeFromAllowlist(jti);
    return true;
  }
}
