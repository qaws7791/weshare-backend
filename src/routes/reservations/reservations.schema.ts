import { validateReservationTime } from "@/routes/items/items.service";
import { z } from "@hono/zod-openapi";

export const ReservationWithItemSchema = z
  .object({
    id: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    userId: z.string(),
    quantity: z.number(),
    itemId: z.string(),
    item: z.object({
      id: z.string(),
      groupId: z.string(),
      name: z.string(),
      quantity: z.number(),
      description: z.string(),
      caution: z.string(),
      pickupLocation: z.string(),
      returnLocation: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      itemImages: z.array(z.string()),
    }),
    status: z.string(),
    reservationTime: z.string().datetime(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .openapi("ReservationWithItemSchema");

export const ReservationWithItemListSchema = z.array(ReservationWithItemSchema);

export const ReservationParamsSchema = z
  .object({
    id: z.string(),
  })
  .openapi("ReservationParamsSchema");

export const ReservationCreateJsonSchema = z
  .object({
    itemId: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    quantity: z.number(),
  })
  .refine(
    (data) =>
      validateReservationTime(new Date(data.startTime), new Date(data.endTime)),
    {
      message: "Invalid reservation time",
    },
  )
  .openapi("ReservationCreateJsonSchema");
