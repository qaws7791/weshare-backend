import db from "@/database";
import { groupMembers, items, reservations } from "@/database/schema";
import { getMaxReserveQuantity } from "@/routes/items/items.service";
import { RESERVATION_STATUS } from "@/routes/reservations/reservations.constants";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, lte, or } from "drizzle-orm";
import * as routes from "./reservations.routes";
const app = new OpenAPIHono();

app.openapi(routes.list, async (c) => {
  const user = c.get("user")!;
  const result = await db.query.reservations.findMany({
    where: eq(reservations.userId, user.id),
    with: {
      item: {
        with: {
          itemImages: true,
        },
      },
    },
  });

  return c.json({
    status: "success",
    code: 200,
    message: "Reservations retrieved successfully",
    data: result.map((reservation) => ({
      id: reservation.id.toString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      userId: reservation.userId.toString(),
      quantity: reservation.quantity,
      itemId: reservation.itemId.toString(),
      item: {
        id: reservation.item.id.toString(),
        groupId: reservation.item.groupId,
        name: reservation.item.name,
        quantity: reservation.item.quantity,
        description: reservation.item.description,
        caution: reservation.item.caution,
        pickupLocation: reservation.item.pickupLocation,
        returnLocation: reservation.item.returnLocation,
        createdAt: reservation.item.createdAt.toISOString(),
        updatedAt: reservation.item.updatedAt.toISOString(),
        itemImages: reservation.item.itemImages.map((image) => image.imageUrl),
      },
      status: reservation.status,
      reservationTime: reservation.reservationTime.toISOString(),
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
    })),
  });
});

app.openapi(routes.detail, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const result = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.userId, user.id),
      eq(reservations.id, parseInt(id)),
    ),
    with: {
      item: {
        with: {
          itemImages: true,
        },
      },
    },
  });

  if (!result) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Reservation not found",
      },
      404,
    );
  }

  return c.json({
    status: "success",
    code: 200,
    message: "Reservation retrieved successfully",
    data: {
      id: result.id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      userId: result.userId.toString(),
      quantity: result.quantity,
      itemId: result.itemId.toString(),
      item: {
        id: result.item.id.toString(),
        groupId: result.item.groupId,
        name: result.item.name,
        quantity: result.item.quantity,
        description: result.item.description,
        caution: result.item.caution,
        pickupLocation: result.item.pickupLocation,
        returnLocation: result.item.returnLocation,
        createdAt: result.item.createdAt.toISOString(),
        updatedAt: result.item.updatedAt.toISOString(),
        itemImages: result.item.itemImages.map((image) => image.imageUrl),
      },
      status: result.status,
      reservationTime: result.reservationTime.toISOString(),
      startTime: result.startTime.toISOString(),
      endTime: result.endTime.toISOString(),
    },
  });
});

app.openapi(routes.cancel, async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const result = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.userId, user.id),
      eq(reservations.id, parseInt(id)),
    ),
    with: {
      item: {
        with: {
          itemImages: true,
        },
      },
    },
  });

  if (!result) {
    return c.json(
      {
        status: "fail",
        code: 404,
        message: "Reservation not found",
      },
      404,
    );
  }

  // 취소 가능한 상태인지 확인 -> 예약 상태가 "pending"이고 예약 시간이 현재 시간전인 경우에만 취소 가능

  const now = new Date();
  const reservationTime = new Date(result.reservationTime);

  if (result.status !== RESERVATION_STATUS.PENDING || reservationTime < now) {
    return c.json(
      {
        status: "fail",
        code: 400,
        message: "Reservation cannot be cancelled",
      },
      400,
    );
  }

  await db
    .update(reservations)
    .set({ status: RESERVATION_STATUS.CANCELLED })
    .where(eq(reservations.id, result.id))
    .execute();

  return c.json({
    status: "success",
    code: 200,
    message: "Reservation cancelled successfully",
    data: {
      id: result.id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      userId: result.userId.toString(),
      quantity: result.quantity,
      itemId: result.itemId.toString(),
      item: {
        id: result.item.id.toString(),
        groupId: result.item.groupId,
        name: result.item.name,
        quantity: result.item.quantity,
        description: result.item.description,
        caution: result.item.caution,
        pickupLocation: result.item.pickupLocation,
        returnLocation: result.item.returnLocation,
        createdAt: result.item.createdAt.toISOString(),
        updatedAt: result.item.updatedAt.toISOString(),
        itemImages: result.item.itemImages.map((image) => image.imageUrl),
      },
      status: result.status,
      reservationTime: result.reservationTime.toISOString(),
      startTime: result.startTime.toISOString(),
      endTime: result.endTime.toISOString(),
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

  const { startTime, endTime, quantity } = c.req.valid("json");
  const itemId = parseInt(c.req.valid("json").itemId);
  const itemData = await db.query.items.findFirst({
    where: eq(items.id, itemId),
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
      groupId: groupId,
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
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      groupId: groupId,
    },
  });
});

export default app;
