import { TOTP, Secret } from "otpauth";

import { TOTP_ISSUER } from "@/constants";
import type { TOTPAdapter } from "./adapter";

export class TOTPAuthAdapter implements TOTPAdapter {
  generate(username: string) {
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: `${TOTP_ISSUER.toUpperCase()}: ${username}`,
    });

    return {
      uri: totp.toString(),
      secret: totp.secret.hex,
    };
  }

  verify(token: string, secret: string) {
    const totp = new TOTP({
      secret: Secret.fromHex(secret),
    });

    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
