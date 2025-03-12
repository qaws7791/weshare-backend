import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
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

  const [groupData] = await db
    .insert(groups)
    .values({
      name,
      description,
      createdBy: user.id,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: groupData.id,
    userId: user.id,
    role: "admin",
  });

  const [groupImage] = await db
    .insert(groupImages)
    .values({
      groupId: groupData.id,
      imageUrl: image,
    })
    .returning();

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

  const isGroupAdmin = groupMember?.role === "admin";

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

export default app;
