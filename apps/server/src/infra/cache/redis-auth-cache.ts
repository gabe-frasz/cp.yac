import { redis } from "@/lib";

import type { AuthCache } from "@/app/caches";
import { MAGIC_LINK_TTL, ALLOWLIST_KEY } from "@/constants";

export class RedisAuthCache implements AuthCache {
  async getStatus(jti: string) {
    return await redis.get<boolean>(`${ALLOWLIST_KEY}:${jti}`);
  }

  async addToAllowlist(jti: string) {
    await redis.set(`${ALLOWLIST_KEY}:${jti}`, true, { ex: MAGIC_LINK_TTL });
  }

  async removeFromAllowlist(jti: string) {
    await redis.del(`${ALLOWLIST_KEY}:${jti}`);
  }
}
