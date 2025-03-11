import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
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

export default app;
