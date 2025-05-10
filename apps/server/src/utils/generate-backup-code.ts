import { BACKUP_CODE_SIZE, ALPHABET_PLUS_NUMBERS_LENGTH } from "../constants";

const middle = BACKUP_CODE_SIZE / 2;

export function generateBackupCode() {
  let code = "";

  for (let i = 0; i < BACKUP_CODE_SIZE; i++) {
    if (i === middle) code += "-";

    let charCode = Math.ceil(Math.random() * ALPHABET_PLUS_NUMBERS_LENGTH) - 1;

    if (charCode <= 9) code += charCode.toString();
    else code += String.fromCharCode(charCode + 55);
  }

  return code;
}
