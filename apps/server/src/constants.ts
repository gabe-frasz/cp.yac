// cache
export const ALLOWLIST_KEY = "auth:allowlist";
export const MAGIC_LINK_TTL = 60 * 5; // 5 minutes
export const TWO_FA_ALLOWLIST_KEY = "auth:2fa:allowlist";
export const TWO_FA_TTL = 60 * 5; // 5 minutes
export const TWO_FA_SECRET_KEY = "auth:2fa:secret";

// email
export const MAILING_FROM = "noreply@fr.team.com";

// token
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const TOKEN_EXPIRATION = "7d";
export const PENDING_TOKEN_MAX_AGE = 60 * 5; // 5 minutes
export const PENDING_TOKEN_EXPIRATION = "5m";

// totp
export const TOTP_ISSUER = "yac";

// backup codes
export const BACKUP_CODES_QUANTITY = 10;
export const BACKUP_CODE_SIZE = 8;
export const ALPHABET_PLUS_NUMBERS_LENGTH = 36;

// chat
export const AI_AGENT_CHAT_ID = "ai-agent";
export const MAX_MESSAGES_PER_REQUEST = 100;
