import { z } from "@hono/zod-openapi";

export const ReservationSchema = z.object({
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
});

export const ReservationListSchema = z.array(ReservationSchema);

export const ReservationParamsSchema = z.object({
  id: z.string(),
});
