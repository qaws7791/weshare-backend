import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import z from "zod";
import { KakaoOAuth } from "../lib/kakao-ouath";
import db from "../database";
import { and, eq } from "drizzle-orm";
import { users } from "../database/schema";
import { SessionManager } from "../lib/session";

const app = new Hono();

app.get("/login/kakao", (c) => {
  const redirectUri = KakaoOAuth.getSignInUrl();
  return c.redirect(redirectUri, 302);
});

app.get(
  "/login/kakao/callback",
  zValidator(
    "query",
    z.object({
      code: z.string(),
    })
  ),
  async (c) => {
    const { code } = c.req.valid("query");

    const { access_token } = await KakaoOAuth.fetchAccessToken(code);
    if (!access_token) {
      return c.json({ error: "Failed to get access token" }, 500);
    }
    const userProfile = await KakaoOAuth.fetchUserProfile(access_token);
    if (!userProfile) {
      return c.json({ error: "Failed to get user profile" }, 500);
    }
    const { id, nickname, profile_image } = userProfile;
    let user = await db.query.users.findFirst({
      where: and(
        eq(users.provider, "kakao"),
        eq(users.providerId, id.toString())
      ),
    });
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          username: nickname,
          provider: "kakao",
          providerId: id.toString(),
          profileImage: profile_image,
        })
        .returning();
    }

    const session = await SessionManager.createSession(user.id);
    if (!session) {
      return c.json({ error: "Failed to create session" }, 500);
    }
    setCookie(c, "s_id", session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: session.expiresAt,
    });
    return c.json({ message: "Login successful" });
  }
);

app.post(
  "/login/kakao/callback",
  zValidator(
    "json",
    z.object({
      code: z.string(),
    })
  ),
  async (c) => {
    const { code } = await c.req.valid("json");

    const { access_token } = await KakaoOAuth.fetchAccessToken(code);
    if (!access_token) {
      return c.json({ error: "Failed to get access token" }, 500);
    }
    const userProfile = await KakaoOAuth.fetchUserProfile(access_token);
    if (!userProfile) {
      return c.json({ error: "Failed to get user profile" }, 500);
    }
    const { id, nickname, profile_image } = userProfile;
    let user = await db.query.users.findFirst({
      where: and(
        eq(users.provider, "kakao"),
        eq(users.providerId, id.toString())
      ),
    });
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          username: nickname,
          provider: "kakao",
          providerId: id.toString(),
          profileImage: profile_image,
        })
        .returning();
    }

    const session = await SessionManager.createSession(user.id);
    if (!session) {
      return c.json({ error: "Failed to create session" }, 500);
    }
    setCookie(c, "s_id", session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: session.expiresAt,
    });
    return c.json({ message: "Login successful" });
  }
);

export default app;
