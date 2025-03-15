import db from "@/database";
import { users } from "@/database/schema";
import { KakaoOAuth } from "@/lib/kakao-oauth";
import { PasswordManager } from "@/lib/password";
import { SessionManager } from "@/lib/session";
import { Context } from "@/types/hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { v2 as cloudinary } from "cloudinary";
import { and, eq, isNull } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import * as routes from "./auth.routes";
const app = new OpenAPIHono<Context>();

app.openapi(routes.kakaoLogin, (c) => {
  const redirectUri = KakaoOAuth.getSignInUrl();
  return c.json({
    status: "success",
    code: 200,
    message: "Login URL fetched successfully",
    data: { url: redirectUri },
  });
});

app.openapi(routes.kakaoLoginRedirect, async (c) => {
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
      eq(users.providerId, id.toString()),
    ),
  });
  if (!user) {
    const results = await cloudinary.uploader.upload(profile_image);
    [user] = await db
      .insert(users)
      .values({
        username: nickname,
        provider: "kakao",
        providerId: id.toString(),
        profileImage: results.secure_url,
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
});

app.openapi(routes.kakaoLoginCallback, async (c) => {
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
      eq(users.providerId, id.toString()),
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
});

app.openapi(routes.emailRegister, async (c) => {
  const { email, password, username } = await c.req.valid("json");
  const hashedPassword = await PasswordManager.hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      email,
      username,
      passwordHash: hashedPassword,
      provider: null,
      providerId: null,
    })
    .returning();
  if (!user) {
    return c.json({ error: "Failed to create user" }, 500);
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
  return c.json({ message: "User registered successfully" });
});

app.openapi(routes.emailLogin, async (c) => {
  const { email, password } = await c.req.valid("json");
  const user = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.provider)),
  });
  if (!user || !user.passwordHash) {
    return c.json({ error: "User not found" }, 404);
  }

  const isPasswordValid = await PasswordManager.verifyPassword(
    password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    return c.json({ error: "Invalid password" }, 401);
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
});

export default app;
