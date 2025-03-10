import { Hono } from "hono";
import { Context } from "../index";
import db from "../database";
import { eq } from "drizzle-orm";
import { users } from "../database/schema";

const app = new Hono<Context>();

app.get("/me", async (c) => {
  const userSession = c.get("user");
  if (!userSession) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = await db.query.users.findFirst({
    where: eq(users.id, userSession.id),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
      providerId: user.providerId,
      profileImage: user.profileImage,
    },
  });
});

export default app;
