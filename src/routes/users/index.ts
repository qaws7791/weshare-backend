import db from "@/database";
import { users } from "@/database/schema";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as routes from "./users.routes";
const app = new OpenAPIHono();

app.openapi(routes.profile, async (c) => {
  const user = c.get("user")!;

  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userData) {
    return c.json(
      {
        status: "error",
        code: 500,
        message: "User not found",
      },
      500,
    );
  }

  return c.json({
    status: "success",
    code: 200,
    message: "User found",
    data: {
      id: userData.id.toString(),
      username: userData.username,
      email: userData.email,
      provider: userData.provider,
      providerId: userData.providerId,
      profileImage: userData.profileImage,
    },
  });
});

app.openapi(routes.updateProfile, async (c) => {
  const user = c.get("user")!;
  const { username, profileImage } = c.req.valid("json");

  try {
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!userData) {
      return c.json(
        {
          status: "error",
          code: 500,
          message: "User not found",
        },
        500,
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        username: username ?? userData.username,
        profileImage: profileImage ?? userData.profileImage,
      })
      .where(eq(users.id, user.id))
      .returning();

    return c.json({
      status: "success",
      code: 200,
      message: "User updated",
      data: {
        id: updatedUser.id.toString(),
        username: updatedUser.username,
        email: updatedUser.email,
        provider: updatedUser.provider,
        providerId: updatedUser.providerId,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch {
    return c.json(
      {
        status: "error",
        code: 500,
        message: "Internal server error",
      },
      500,
    );
  }
});

export default app;
