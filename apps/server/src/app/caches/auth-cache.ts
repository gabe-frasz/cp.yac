export interface AuthCache {
  getAllowlistStatus(jti: string): Promise<boolean | null>;
  addToAllowlist(jti: string): Promise<void>;
  removeFromAllowlist(jti: string): Promise<void>;
  addTo2FAAllowlist(userId: string): Promise<void>;
  increase2FAAllowlistTries(userId: string): Promise<void>;
  removeFrom2FAAllowlist(userId: string): Promise<void>;
  add2FASecret(userId: string, secret: string): Promise<void>;
  get2FASecret(userId: string): Promise<string | null>;
  remove2FASecret(userId: string): Promise<void>;
}
