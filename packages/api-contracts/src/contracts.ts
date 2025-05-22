// auth
export type Setup2FAResponse = {
  uri: string;
};

export type GenerateBackupCodesResponse = {
  backupCodes: string[];
};

export type ResetBackupCodesResponse = {
  backupCodes: string[];
};

// chats
export type GetChatHistoryResponse = {
  id: string;
  senderId: string;
  text: string;
}[];
