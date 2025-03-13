import db from "@/database";
import { groupInvites, groupMembers } from "@/database/schema";
import { GROUP_ROLE } from "@/lib/group-role";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import * as routes from "./invites.routes";
const app = new OpenAPIHono();

app.openapi(routes.detail, async (c) => {
  const { code } = c.req.valid("param");

  const inviteData = await db.query.groupInvites.findFirst({
    where: and(eq(groupInvites.code, code), eq(groupInvites.isExpired, false)),
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
        code: 400,
        message: "Invite link is expired or inactive",
      },
      400,
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

app.openapi(routes.acceptInvite, async (c) => {
  const user = c.get("user")!;
  const { code } = c.req.valid("param");

  const inviteData = await db.query.groupInvites.findFirst({
    where: and(eq(groupInvites.code, code), eq(groupInvites.isExpired, false)),
  });

  if (!inviteData) {
    return c.json(
      {
        status: "error",
        code: 400,
        message: "Invite link is expired or inactive",
      },
      400,
    );
  }

  const groupId = inviteData.groupId.toString();

  const existingMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.userId, user.id),
      eq(groupMembers.groupId, groupId),
    ),
  });

  if (existingMembership) {
    return c.json(
      {
        status: "error",
        code: 409,
        message: "Already a member of the group",
      },
      409,
    );
  }

  const [groupMemeber] = await db
    .insert(groupMembers)
    .values({
      groupId: inviteData.groupId,
      userId: user.id,
      role: GROUP_ROLE.MEMBER,
    })
    .returning();

  return c.json({
    status: "success",
    code: 200,
    message: "Joined group successfully",
    data: {
      groupId: groupMemeber.groupId.toString(),
      userId: groupMemeber.userId.toString(),
      role: groupMemeber.role,
      joinedAt: groupMemeber.createdAt.toISOString(),
      createdAt: groupMemeber.createdAt.toISOString(),
      updatedAt: groupMemeber.updatedAt.toISOString(),
    },
  });
});

export default app;
