import { validateReservationTime } from "@/routes/items/items.helpers";
import { z } from "@hono/zod-openapi";

export const ItemDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  caution: z.string(),
  pickupLocation: z.string(),
  returnLocation: z.string(),
  images: z.array(z.string()),
  quantity: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  groupId: z.string(),
  group: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const ItemListSchema = z.array(ItemDetailSchema);

export const ItemParamsSchema = z.object({
  id: z.string(),
});

export const ItemReserveJsonSchema = z
  .object({
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
  );

export const ReservationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemId: z.string(),
  status: z.string(),
  quantity: z.number(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reservationTime: z.string().datetime(),
  pickupTime: z.string().datetime(),
  returnTime: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 예약 가능한 시간대를 반환하는 스키마
export const availableTimeSlotSchema = z.array(
  z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    duration: z.number(),
    slotStock: z.number(),
    slotReservedCount: z.number(),
    slotAvailableCount: z.number(),
  }),
);
