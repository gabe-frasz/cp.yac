import { redis } from "@/lib";

import type { AuthCache } from "@/app/caches";
import {
  MAGIC_LINK_TTL,
  ALLOWLIST_KEY,
  TWO_FA_ALLOWLIST_KEY,
  TWO_FA_TTL,
  TWO_FA_SECRET_KEY,
} from "@/constants";
import { encrypt, decrypt } from "@/utils";

export class RedisAuthCache implements AuthCache {
  async getAllowlistStatus(jti: string) {
    return await redis.get<boolean>(`${ALLOWLIST_KEY}:${jti}`);
  }

  async addToAllowlist(jti: string) {
    await redis.set(`${ALLOWLIST_KEY}:${jti}`, true, { ex: MAGIC_LINK_TTL });
  }

  async removeFromAllowlist(jti: string) {
    await redis.del(`${ALLOWLIST_KEY}:${jti}`);
  }

  async addTo2FAAllowlist(userId: string) {
    await redis.set(`${TWO_FA_ALLOWLIST_KEY}:${userId}`, 0, {
      ex: TWO_FA_TTL,
    });
  }

  async increase2FAAllowlistTries(userId: string) {
    await redis.incr(`${TWO_FA_ALLOWLIST_KEY}:${userId}`);
  }

  async removeFrom2FAAllowlist(userId: string) {
    await redis.del(`${TWO_FA_ALLOWLIST_KEY}:${userId}`);
  }

  async add2FASecret(userId: string, secret: string) {
    const secretHash = encrypt(secret);

    await redis.set(`${TWO_FA_SECRET_KEY}:${userId}`, secretHash, {
      ex: TWO_FA_TTL,
    });
  }

  async get2FASecret(userId: string) {
    const secretHash = await redis.get<string>(
      `${TWO_FA_SECRET_KEY}:${userId}`,
    );
    if (!secretHash) return null;

    return decrypt(secretHash);
  }

  async remove2FASecret(userId: string) {
    await redis.del(`${TWO_FA_SECRET_KEY}:${userId}`);
  }
}
