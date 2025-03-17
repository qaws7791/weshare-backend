import db from "@/database";
import {
  groupMembers,
  itemImages,
  items,
  reservations,
} from "@/database/schema";
import { GROUP_ROLE } from "@/lib/group-role";
import {
  generateTimeSlots,
  getMaxReserveQuantity,
} from "@/routes/items/items.service";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, inArray, lte, or } from "drizzle-orm";
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
app.openapi(routes.itemDetail, async (c) => {
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

app.openapi(routes.update, async (c) => {
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

  const item = await db.query.items.findFirst({
    where: eq(items.id, parseInt(id)),
    with: {
      group: {
        with: {
          groupMembers: {
            where: eq(groupMembers.userId, user.id),
          },
          groupImages: true,
        },
      },
    },
  });

  const groupMember = item?.group.groupMembers[0];

  if (!item || !groupMember) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Group not found",
      },
      404,
    );
  }

  const isGroupAdmin = groupMember.role === GROUP_ROLE.ADMIN;
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
      .where(eq(items.id, parseInt(id)))
      .returning();

    if (images && images.length > 0) {
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
    }

    return {
      ...item,
      images: images || [],
    };
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
      images: updatedItem.images,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
      groupId: updatedItem.groupId.toString(),
      group: {
        id: item.group.id.toString(),
        name: item.group.name,
        description: item.group.description,
        image: item.group.groupImages[0]?.imageUrl,
        createdBy: groupMember.userId.toString(),
        createdAt: item.group.createdAt.toISOString(),
        updatedAt: item.group.updatedAt.toISOString(),
      },
    },
  });
});

app.openapi(routes.availableTimes, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const itemData = await db.query.items.findFirst({
    where: eq(items.id, parseInt(id)),
    with: {
      group: {
        with: {
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

  const nowTime = new Date();
  const endTime = new Date(
    nowTime.getFullYear(),
    nowTime.getMonth(),
    nowTime.getDate() + 7,
    0,
    0,
    0,
  );
  const timeSlots = generateTimeSlots();

  // 현재 시간으로부터 7일 후 자정까지의 예약된 내역을 모두 가져온다.
  const reservationsData = await db.query.reservations.findMany({
    where: and(
      eq(reservations.itemId, itemData.id),
      or(
        lte(reservations.startTime, endTime),
        gte(reservations.endTime, nowTime),
      ),
    ),
  });

  // 예약된 내역을 통해 타임슬롯에 예약 가능한 수량을 계산한 타임슬롯을 생성한다.

  const timeSlotWithAvailableQuantity: {
    startTime: Date;
    endTime: Date;
    duration: number;
    slotStock: number;
    slotReservedCount: number;
    slotAvailableCount: number;
  }[] = timeSlots.map((timeSlot) => {
    const startTime = new Date(timeSlot.startTime);
    const endTime = new Date(timeSlot.endTime);
    const duration = timeSlot.duration;
    const slotStock = itemData.quantity;

    const slotReservedCount = getMaxReserveQuantity(
      reservationsData.filter((reservation) => {
        const reservationStartTime = new Date(reservation.startTime).getTime();
        const reservationEndTime = new Date(reservation.endTime).getTime();
        return (
          reservationStartTime <= endTime.getTime() &&
          reservationEndTime >= startTime.getTime()
        );
      }),
    );
    return {
      startTime,
      endTime,
      duration,
      slotStock,
      slotReservedCount,
      slotAvailableCount: slotStock - slotReservedCount,
    };
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Available time slots fetched successfully",
    data: timeSlotWithAvailableQuantity,
  });
});

app.openapi(routes.itemReservations, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const itemData = await db.query.items.findFirst({
    where: eq(items.id, parseInt(id)),
    with: {
      group: {
        with: {
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

  const reservationsData = await db.query.reservations.findMany({
    where: eq(reservations.itemId, parseInt(id)),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          profileImage: true,
        },
      },
    },
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Reservations fetched successfully",
    data: reservationsData.map((reservation) => ({
      id: reservation.id.toString(),
      userId: reservation.userId.toString(),
      itemId: reservation.itemId.toString(),
      status: reservation.status,
      quantity: reservation.quantity,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      reservationTime: reservation.reservationTime,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      user: {
        id: reservation.user.id.toString(),
        username: reservation.user.username,
        profileImage: reservation.user.profileImage,
      },
    })),
  });
});

export default app;
