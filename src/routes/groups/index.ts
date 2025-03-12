import { GROUP_ROLE } from "@/lib/group-role";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import db from "../../database";
import { groupImages, groupMembers, groups } from "../../database/schema";
import * as routes from "./groups.routes";
const app = new OpenAPIHono();

app.openapi(routes.list, async (c) => {
  const user = c.get("user")!;
  const result = await db.query.groupMembers.findMany({
    with: {
      group: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          groupImages: {
            columns: {
              imageUrl: true,
            },
          },
        },
      },
    },
    where: eq(groupMembers.userId, user.id),
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Groups fetched successfully",
    data: result.map(({ group, ...groupMember }) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.groupImages[0]?.imageUrl,
      createdBy: groupMember.userId.toString(),
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toDateString(),
    })),
  });
});

app.openapi(routes.create, async (c) => {
  const user = c.get("user")!;
  const json = c.req.valid("json");

  const { name, description, image } = json;

  const groupData = await db.transaction(async (tx) => {
    const [group] = await tx
      .insert(groups)
      .values({
        name,
        description,
        createdBy: user.id,
      })
      .returning();

    await tx.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: GROUP_ROLE.ADMIN,
    });

    const [groupImage] = await tx
      .insert(groupImages)
      .values({
        groupId: group.id,
        imageUrl: image,
      })
      .returning();

    return { ...group, groupImage };
  });

  const groupImage = groupData.groupImage;

  return c.json({
    status: "success",
    code: 200,
    message: "Group created successfully",
    data: {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy.toString(),
      createdAt: groupData.createdAt.toISOString(),
      updatedAt: groupData.updatedAt.toDateString(),
      image: groupImage.imageUrl,
    },
  });
});

app.openapi(routes.detail, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const result = await db.query.groups.findFirst({
    where: eq(groups.id, id),
    with: {
      groupImages: {
        columns: {
          imageUrl: true,
        },
      },
      groupMembers: {
        where: eq(groupMembers.userId, user.id),
      },
    },
  });

  if (!result) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Group not found",
      },
      404,
    );
  }

  if (result.groupMembers.length === 0) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "You are not a member of this group",
      },
      403,
    );
  }

  return c.json({
    status: "success",
    code: 200,
    message: "Group fetched successfully",
    data: {
      id: result.id,
      name: result.name,
      description: result.description,
      image: result.groupImages[0]?.imageUrl,
      createdBy: result.createdBy.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toDateString(),
    },
  });
});

app.openapi(routes.update, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const json = c.req.valid("json");

  const { name, description, image } = json;

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
  });

  if (!groupMember) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Group not found",
      },
      404,
    );
  }

  const isGroupAdmin = groupMember?.role === GROUP_ROLE.ADMIN;

  if (!isGroupAdmin) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "You are not authorized to update this group",
      },
      403,
    );
  }

  const [groupData] = await db
    .update(groups)
    .set({
      name,
      description,
    })
    .where(eq(groups.id, id))
    .returning();

  await db
    .update(groupImages)
    .set({
      imageUrl: image,
    })
    .where(eq(groupImages.groupId, groupData.id))
    .returning();

  return c.json({
    status: "success",
    code: 200,
    message: "Group updated successfully",
    data: {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy.toString(),
      createdAt: groupData.createdAt.toISOString(),
      updatedAt: groupData.updatedAt.toDateString(),
      image,
    },
  });
});

app.openapi(routes.remove, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  try {
    const groupMember = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.userId, user.id),
        eq(groupMembers.groupId, id),
      ),
    });

    if (!groupMember) {
      return c.json(
        {
          status: "fail",
          code: 404,
          message: "Group not found",
        },
        404,
      );
    }

    const isGroupAdmin = groupMember?.role === GROUP_ROLE.ADMIN;
    if (!isGroupAdmin) {
      return c.json(
        {
          status: "fail",
          code: 403,
          message: "You are not authorized to delete this group",
        },
        403,
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(groupMembers).where(eq(groupMembers.groupId, id));
      await tx.delete(groupImages).where(eq(groupImages.groupId, id));
      await tx.delete(groups).where(eq(groups.id, id));
    });

    return c.newResponse(null, 204);
  } catch {
    return c.json(
      {
        status: "fail",
        code: 500,
        message: "Internal server error",
      },
      500,
    );
  }
});

app.openapi(routes.listMembers, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
  });

  if (!groupMember) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "Group not found",
      },
      403,
    );
  }

  const result = await db.query.groupMembers.findMany({
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
    where: eq(groupMembers.groupId, id),
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Group members fetched successfully",
    data: result.map(({ user, ...groupMember }) => ({
      id: user.id.toString(),
      username: user.username,
      profileImage: user.profileImage,
      role: groupMember.role,
      joinedAt: groupMember.createdAt.toISOString(),
    })),
  });
});

app.openapi(routes.deleteMembers, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const { ids } = c.req.valid("json");
  const deleteIds = ids.map((id) => Number(id));

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
  });

  if (!groupMember) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "Group not found",
      },
      403,
    );
  }

  const isGroupAdmin = groupMember?.role === GROUP_ROLE.ADMIN;
  if (!isGroupAdmin) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "You are not authorized to delete this group",
      },
      403,
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, id),
            inArray(groupMembers.userId, deleteIds),
          ),
        );
    });

    return c.json({
      status: "success",
      code: 200,
      message: "Group members deleted successfully",
    });
  } catch {
    return c.json(
      {
        status: "fail",
        code: 500,
        message: "Internal server error",
      },
      500,
    );
  }
});

export default app;
