export class PasswordManager {
  static async hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return Bun.password.verify(password, hashedPassword);
  }
}
