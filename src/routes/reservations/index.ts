import db from "@/database";
import { reservations } from "@/database/schema";
import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import * as routes from "./reservations.routes";
const app = new OpenAPIHono();

app.openapi(routes.list, async (c) => {
  const user = c.get("user")!;
  const result = await db.query.reservations.findMany({
    where: eq(reservations.userId, user.id),
    with: {
      items: {
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
        id: reservation.items.id.toString(),
        groupId: reservation.items.groupId,
        name: reservation.items.name,
        quantity: reservation.items.quantity,
        description: reservation.items.description,
        caution: reservation.items.caution,
        pickupLocation: reservation.items.pickupLocation,
        returnLocation: reservation.items.returnLocation,
        createdAt: reservation.items.createdAt.toISOString(),
        updatedAt: reservation.items.updatedAt.toISOString(),
        itemImages: reservation.items.itemImages.map((image) => image.imageUrl),
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
      items: {
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
        id: result.items.id.toString(),
        groupId: result.items.groupId,
        name: result.items.name,
        quantity: result.items.quantity,
        description: result.items.description,
        caution: result.items.caution,
        pickupLocation: result.items.pickupLocation,
        returnLocation: result.items.returnLocation,
        createdAt: result.items.createdAt.toISOString(),
        updatedAt: result.items.updatedAt.toISOString(),
        itemImages: result.items.itemImages.map((image) => image.imageUrl),
      },
      status: result.status,
      reservationTime: result.reservationTime.toISOString(),
      startTime: result.startTime.toISOString(),
      endTime: result.endTime.toISOString(),
    },
  });
});

export default app;
