import db from "@/database";
import { groupMembers } from "@/database/schema";
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

export default app;
