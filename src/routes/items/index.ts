import db from "@/database";
import { groupMembers, items } from "@/database/schema";
import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as routes from "./items.routes";

const app = new OpenAPIHono();

app.openapi(routes.list, async (c) => {
  const user = c.get("user")!;
  // 1. 유저가 속한 모든 그룹의 물품을 가져오기
  const result = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, user.id),
    with: {
      group: {
        with: {
          items: {
            with: {
              itemImages: true,
            },
          },
          groupImages: true,
        },
      },
    },
  });

  const itemsWithGroup = result.flatMap((groupMember) => {
    const group = groupMember.group;
    return group.items.map(({ itemImages, id, ...item }) => {
      return {
        ...item,
        id: id.toString(),
        images: itemImages.map((image) => image.imageUrl),
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          image: group.groupImages[0]?.imageUrl,
          createdBy: group.createdBy.toString(),
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        },
      };
    });
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Items fetched successfully",
    data: itemsWithGroup,
  });
});

app.openapi(routes.detail, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const itemData = await db.query.items.findFirst({
    where: eq(items.id, parseInt(id)),
    with: {
      itemImages: true,
      group: {
        with: {
          groupImages: true,
          groupMembers: {
            where: eq(groupMembers.userId, user.id),
          },
        },
      },
    },
  });

  if (!itemData || itemData.group.groupMembers.length === 0) {
    return c.json({
      status: "fail",
      code: 404,
      message: "Item not found",
    });
  }

  return c.json({
    status: "success",
    code: 200,
    message: "Item fetched successfully",
    data: {
      ...itemData,
      id: itemData.id.toString(),
      images: itemData.itemImages.map((image) => image.imageUrl),
      group: {
        id: itemData.group.id,
        name: itemData.group.name,
        description: itemData.group.description,
        image: itemData.group.groupImages[0]?.imageUrl,
        createdBy: itemData.group.createdBy.toString(),
        createdAt: itemData.group.createdAt,
        updatedAt: itemData.group.updatedAt,
      },
    },
  });
});

export default app;
