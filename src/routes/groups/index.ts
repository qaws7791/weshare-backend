import { GROUP_ROLE } from "@/lib/group-role";
import { slugId } from "@/lib/nanoid";
import { RESERVATION_STATUS } from "@/routes/reservations/reservations.constants";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
  groupImages,
  groupInvites,
  groupMembers,
  groups,
  itemImages,
  items,
  reservations,
} from "../../database/schema";
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
      updatedAt: group.updatedAt.toISOString(),
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
    code: 201,
    message: "Group created successfully",
    data: {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy.toString(),
      createdAt: groupData.createdAt.toISOString(),
      updatedAt: groupData.updatedAt.toISOString(),
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

  if (!result || result.groupMembers.length === 0) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Group not found",
      },
      404,
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
      updatedAt: result.updatedAt.toISOString(),
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
        message: "You are not a admin of this group",
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
      updatedAt: groupData.updatedAt.toISOString(),
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
          message: "You are not a  a admin of this group",
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
        code: 404,
        message: "Group not found",
      },
      404,
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

app.openapi(routes.createInviteLink, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

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
        message: "You are not authorized to create invite link",
      },
      403,
    );
  }

  const existingInvite = await db.query.groupInvites.findFirst({
    where: eq(groupInvites.groupId, id),
  });

  if (existingInvite) {
    return c.json(
      {
        status: "fail",
        code: 409,
        message: "Invite link already exists",
      },
      409,
    );
  }

  const [inviteCode] = await db
    .insert(groupInvites)
    .values({
      groupId: id,
      code: slugId(),
    })
    .returning();

  return c.json({
    status: "success",
    code: 200,
    message: "Invite link created successfully",
    data: {
      id: inviteCode.id.toString(),
      code: inviteCode.code,
      groupId: inviteCode.groupId.toString(),
      isExpired: inviteCode.isExpired,
      createdAt: inviteCode.createdAt.toISOString(),
      updatedAt: inviteCode.updatedAt.toISOString(),
    },
  });
});

app.openapi(routes.listInvites, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

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
        message: "You are not authorized to list invite links",
      },
      403,
    );
  }

  const result = await db.query.groupInvites.findMany({
    where: eq(groupInvites.groupId, id),
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Invite links fetched successfully",
    data: result.map((invite) => ({
      id: invite.id.toString(),
      code: invite.code,
      groupId: invite.groupId.toString(),
      isExpired: invite.isExpired,
      createdAt: invite.createdAt.toISOString(),
      updatedAt: invite.updatedAt.toISOString(),
    })),
  });
});

app.openapi(routes.createItem, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const json = c.req.valid("json");

  const {
    name,
    description,
    images,
    pickupLocation,
    returnLocation,
    quantity,
    caution,
  } = json;

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
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
        message: "You are not authorized to create group item",
      },
      403,
    );
  }

  const groupItem = await db.transaction(async (tx) => {
    const [item] = await tx
      .insert(items)
      .values({
        name,
        description,
        caution: caution || "",
        pickupLocation,
        returnLocation,
        quantity,
        groupId: id,
      })
      .returning();

    const groupItemImages = images.map((image) => ({
      itemId: item.id,
      imageUrl: image,
      groupId: id,
    }));

    await tx.insert(groupImages).values(groupItemImages);

    return item;
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Group item created successfully",
    data: {
      id: groupItem.id.toString(),
      name: groupItem.name,
      description: groupItem.description,
      caution: groupItem.caution,
      pickupLocation: groupItem.pickupLocation,
      returnLocation: groupItem.returnLocation,
      quantity: groupItem.quantity,
      images,
      createdAt: groupItem.createdAt.toISOString(),
      updatedAt: groupItem.updatedAt.toISOString(),
      groupId: groupItem.groupId.toString(),
      group: {
        id: groupMember.group.id.toString(),
        name: groupMember.group.name,
        description: groupMember.group.description,
        image: groupMember.group.groupImages[0]?.imageUrl,
        createdBy: groupMember.userId.toString(),
        createdAt: groupMember.group.createdAt.toISOString(),
        updatedAt: groupMember.group.updatedAt.toISOString(),
      },
    },
  });
});

app.openapi(routes.updateItem, async (c) => {
  const user = c.get("user")!;
  const { id, itemId } = c.req.valid("param");
  const json = c.req.valid("json");

  const {
    name,
    description,
    images,
    pickupLocation,
    returnLocation,
    quantity,
    caution,
  } = json;

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
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
        message: "You are not authorized to update group item",
      },
      403,
    );
  }

  const groupItem = await db.query.items.findFirst({
    where: and(eq(items.id, parseInt(itemId)), eq(items.groupId, id)),
  });

  if (!groupItem) {
    return c.json(
      {
        status: "fail",
        code: 400,
        message: "Group item not found",
      },
      400,
    );
  }
  // 아이템 정보를 업데이트하고, 아이템 이미지들에 대해서 삭제된 이미지 제거 및 추가된 이미지 추가
  const updatedItem = await db.transaction(async (tx) => {
    const [item] = await tx
      .update(items)
      .set({
        name,
        description,
        caution: caution || "",
        pickupLocation,
        returnLocation,
        quantity,
      })
      .where(eq(items.id, groupItem.id))
      .returning();

    const existingImages = await tx.query.itemImages.findMany({
      where: eq(itemImages.itemId, item.id),
    });

    const existingImageUrls = existingImages.map((image) => image.imageUrl);
    const newImageUrls = images.filter(
      (image) => !existingImageUrls.includes(image),
    );

    const deletedImageUrls = existingImageUrls.filter(
      (image) => !images.includes(image),
    );

    // 삭제된 이미지를 삭제
    await tx
      .delete(itemImages)
      .where(
        and(
          eq(itemImages.itemId, item.id),
          inArray(itemImages.imageUrl, deletedImageUrls),
        ),
      );

    // 추가된 이미지를 추가
    const newItemImages = newImageUrls.map((image) => ({
      itemId: item.id,
      imageUrl: image,
      groupId: id,
    }));
    await tx.insert(itemImages).values(newItemImages);

    return item;
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Group item updated successfully",
    data: {
      id: updatedItem.id.toString(),
      name: updatedItem.name,
      description: updatedItem.description,
      caution: updatedItem.caution,
      pickupLocation: updatedItem.pickupLocation,
      returnLocation: updatedItem.returnLocation,
      quantity: updatedItem.quantity,
      images,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
      groupId: updatedItem.groupId.toString(),
      group: {
        id: groupMember.group.id.toString(),
        name: groupMember.group.name,
        description: groupMember.group.description,
        image: groupMember.group.groupImages[0]?.imageUrl,
        createdBy: groupMember.userId.toString(),
        createdAt: groupMember.group.createdAt.toISOString(),
        updatedAt: groupMember.group.updatedAt.toISOString(),
      },
    },
  });
});

app.openapi(routes.listItems, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const groupMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)),
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

  const result = await db.query.items.findMany({
    where: eq(items.groupId, id),
    with: {
      itemImages: {
        columns: {
          imageUrl: true,
        },
      },
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
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Group items fetched successfully",
    data: result.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      caution: item.caution,
      pickupLocation: item.pickupLocation,
      returnLocation: item.returnLocation,
      quantity: item.quantity,
      images: item.itemImages.map((image) => image.imageUrl),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      groupId: item.groupId.toString(),
      group: {
        id: groupMember.group.id.toString(),
        name: groupMember.group.name,
        description: groupMember.group.description,
        image: groupMember.group.groupImages[0]?.imageUrl,
        createdBy: groupMember.userId.toString(),
        createdAt: groupMember.group.createdAt.toISOString(),
        updatedAt: groupMember.group.updatedAt.toISOString(),
      },
    })),
  });
});

app.openapi(routes.leftGroup, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

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

  // 남아있는 예약이 있는지 확인

  const hasReservations = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.userId, user.id),
      inArray(reservations.status, [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.IN_USE,
      ]),
      eq(reservations.groupId, id),
    ),
  });

  if (hasReservations) {
    return c.json(
      {
        status: "fail",
        code: 403,
        message: "You have active reservations in this group",
      },
      403,
    );
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.groupId, id)));

  return c.newResponse(null, 204);
});

export default app;
