export const errors = {
  USER_NOT_FOUND: {
    name: "USER_NOT_FOUND",
    message: "User not found",
  },
  USER_2FA_DISABLED: {
    name: "USER_2FA_DISABLED",
    message: "User does not have 2FA enabled",
  },
  USER_2FA_ALREADY_ENABLED: {
    name: "USER_2FA_ALREADY_ENABLED",
    message: "User already has 2FA enabled",
  },
  USER_NOT_IN_CHAT: {
    name: "USER_NOT_IN_CHAT",
    message: "User is not in chat",
  },
  INVALID_TOTP: {
    name: "INVALID_TOTP",
    message: "Invalid TOTP code",
  },
  EXPIRED_TOTP: {
    name: "EXPIRED_TOTP",
    message: "TOTP code expired",
  },
} as const;
