export interface TOTPAdapter {
  generate(username: string): { uri: string; secret: string };
  verify(token: string, secret: string): boolean;
  getURI(username: string, secret: string): string;
}
