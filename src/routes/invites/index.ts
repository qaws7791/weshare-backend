import db from "@/database";
import { groupInvites } from "@/database/schema";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as routes from "./invites.routes";
const app = new OpenAPIHono();

app.openapi(routes.detail, async (c) => {
  const { code } = c.req.valid("param");

  const inviteData = await db.query.groupInvites.findFirst({
    where: eq(groupInvites.code, code),
    with: {
      group: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!inviteData) {
    return c.json(
      {
        status: "error",
        code: 404,
        message: "Invite not found",
      },
      404,
    );
  }

  return c.json({
    status: "success",
    code: 200,
    message: "Invite found",
    data: {
      id: inviteData.id.toString(),
      code: inviteData.code,
      isExpired: inviteData.isExpired,
      createdAt: inviteData.createdAt.toISOString(),
      updatedAt: inviteData.updatedAt.toISOString(),
      groupId: inviteData.groupId.toString(),
      group: {
        id: inviteData.group.id.toString(),
        name: inviteData.group.name,
        description: inviteData.group.description,
        createdAt: inviteData.group.createdAt.toISOString(),
        updatedAt: inviteData.group.updatedAt.toISOString(),
      },
    },
  });
});

export default app;
