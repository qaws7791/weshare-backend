import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SessionManager } from "../lib/session";

const sessionMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, "s_id");
  if (!sessionId) {
    c.set("session", null);
    c.set("user", null);
    return next();
  }

  const { session, user, isNewSession } =
    await SessionManager.validateSessionToken(sessionId);
  if (session === null) {
    deleteCookie(c, "s_id");
    c.set("session", null);
    c.set("user", null);
    return next();
  }

  if (isNewSession) {
    setCookie(c, "s_id", session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  c.set("session", session);
  c.set("user", user);
  return next();
});

export default sessionMiddleware;
