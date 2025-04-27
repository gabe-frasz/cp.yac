export interface AuthCache {
  getStatus(jti: string): Promise<boolean | null>;
  addToAllowlist(jti: string): Promise<void>;
  removeFromAllowlist(jti: string): Promise<void>;
}
