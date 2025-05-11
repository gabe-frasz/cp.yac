import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";

import { env } from "@/env";

const key = createHash("sha256")
  .update(env.CRYPTO_KEY_SECRET)
  .digest("base64")
  .substring(0, 32);

export function encrypt(plaintext: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    iv,
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return encrypted.toString("base64url");
}

export function decrypt(ivCiphertextB64: string) {
  const ivCiphertext = Buffer.from(ivCiphertextB64, "base64url");
  const iv = ivCiphertext.subarray(0, 16);
  const ciphertext = ivCiphertext.subarray(16);
  const cipher = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
  return decrypted.toString("utf-8");
}
