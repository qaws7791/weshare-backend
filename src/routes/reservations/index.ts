import db from "@/database";
import { reservations } from "@/database/schema";
import { RESERVATION_STATUS } from "@/routes/reservations/reservations.constants";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
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

export default app;
