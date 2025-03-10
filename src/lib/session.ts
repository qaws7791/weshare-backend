import db from "../database";
import { sessions, users } from "../database/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export class SessionManager {
  private static readonly SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
  private static readonly SESSION_REFRESH_TIME =
    this.SESSION_EXPIRATION_TIME / 2; // 15 days

  private static async _generateSessionId(entropyBytes = 8, encoding = "hex") {
    // crypto.randomBytes()를 사용하여 암호학적으로 안전한 난수 생성
    const randomBytes = crypto.randomBytes(entropyBytes);

    // 지정된 인코딩 방식으로 변환
    let sessionId;
    switch (encoding) {
      case "base64":
        sessionId = randomBytes.toString("base64");
        break;
      case "base64url":
        sessionId = randomBytes.toString("base64url");
        break;
      case "hex":
      default:
        sessionId = randomBytes.toString("hex");
    }

    return sessionId;
  }

  private static _isSessionExpired(session: Session): boolean {
    const now = Date.now();
    return now > session.expiresAt.getTime();
  }

  private static _shouldRefreshSession(session: Session): boolean {
    const now = Date.now();
    return now >= session.expiresAt.getTime() - this.SESSION_REFRESH_TIME;
  }

  private static _newExpirationTime(): Date {
    return new Date(Date.now() + this.SESSION_EXPIRATION_TIME);
  }

  static async createSession(userId: number): Promise<Session> {
    const sessionId = await this._generateSessionId();
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    };

    await db.insert(sessions).values({
      id: sessionId,
      userId: userId,
      expiresAt: session.expiresAt,
    });

    return session;
  }

  static async validateSessionToken(
    token: string
  ): Promise<SessionValidationResult> {
    const existingSession = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, token));
    if (existingSession.length === 0) {
      return { session: null, user: null, isNewSession: false };
    }
    const { user, session } = existingSession[0];

    if (this._shouldRefreshSession(session)) {
      session.expiresAt = this._newExpirationTime();
      await db
        .update(sessions)
        .set({
          expiresAt: session.expiresAt,
        })
        .where(eq(sessions.id, token));

      return { session, user, isNewSession: true };
    }

    return { session, user, isNewSession: false };
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  static async invalidateAllSessions(userId: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

export type SessionValidationResult =
  | { session: Session; user: User; isNewSession: boolean }
  | { session: null; user: null; isNewSession: false };

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}

export interface User {
  id: number;
}
