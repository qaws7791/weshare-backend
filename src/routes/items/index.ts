import db from "@/database";
import { groupMembers, items, reservations } from "@/database/schema";
import {
  generateTimeSlots,
  getMaxReserveQuantity,
} from "@/routes/items/items.service";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, lte, or } from "drizzle-orm";
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

app.openapi(routes.reserveItem, async (c) => {
  // 물품 예약하기
  // 1. 사용자가 속한 그룹의 물품인지 확인
  // 2. 해당 개수, 해당 시간에 예약 가능한지 기존의 예약과 물품 정보들을 통해 확인
  // 3. 예약하기
  // 4. 예약 완료 후 예약 정보를 반환
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const { startTime, endTime, quantity } = c.req.valid("json");
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

  const group = itemData.group;

  const groupId = group.id;
  const itemId = itemData.id;
  const itemQuantity = itemData.quantity;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (quantity > itemQuantity) {
    return c.json({
      status: "fail",
      code: 400,
      message: "Not enough quantity",
    });
  }

  if (startDate.getSeconds() !== 0 || endDate.getSeconds() !== 0) {
    return c.json({
      status: "fail",
      code: 400,
      message: "Invalid time",
    });
  }
  // 시간대별로 예약된 최대 수량을 계산

  const reservationsData = await db.query.reservations.findMany({
    where: and(
      eq(reservations.itemId, itemId),
      or(
        lte(reservations.startTime, endDate),
        gte(reservations.endTime, startDate),
      ),
    ),
  });

  const maxReserveQuantity = getMaxReserveQuantity(reservationsData);
  const availableQuantity = itemQuantity - maxReserveQuantity;
  if (quantity > availableQuantity) {
    return c.json({
      status: "fail",
      code: 400,
      message: "Not enough quantity",
    });
  }

  const [reservation] = await db
    .insert(reservations)
    .values({
      userId: user.id,
      itemId: itemId,
      startTime: startDate,
      endTime: endDate,
      quantity: quantity,
    })
    .returning();

  return c.json({
    status: "success",
    code: 200,
    message: "Item reserved successfully",
    data: {
      id: reservation.id.toString(),
      userId: reservation.userId.toString(),
      itemId: reservation.itemId.toString(),
      status: reservation.status,
      quantity: reservation.quantity,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      reservationTime: reservation.reservationTime,
      pickupTime: reservation.pickupTime,
      returnTime: reservation.returnTime,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      groupId: groupId,
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

export default app;
