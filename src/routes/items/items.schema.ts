import { GroupSchema } from "@/routes/groups/groups.schema";
import { z } from "@hono/zod-openapi";

export const ItemWithGroupSchema = z
  .object({
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
    group: GroupSchema,
  })
  .openapi("ItemWithGroupSchema");

export const ItemListSchema = z
  .array(ItemWithGroupSchema)
  .openapi("ItemListSchema");

export const ItemUpdateJsonSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(500).optional(),
    caution: z.string().max(500).optional(),
    pickupLocation: z.string().max(100).optional(),
    returnLocation: z.string().max(100).optional(),
    images: z.array(z.string()).min(1).max(4).optional(),
    quantity: z.number().min(1).max(999).optional(),
  })
  .openapi("ItemUpdateJsonSchema");

export const ItemParamsSchema = z
  .object({
    id: z.string(),
  })
  .openapi("ItemParamsSchema");

export const ReservationSchema = z
  .object({
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
  })
  .openapi("ReservationSchema");

// 예약 가능한 시간대를 반환하는 스키마
export const AvailableTimeSlotSchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    duration: z.number(),
    slotStock: z.number(),
    slotReservedCount: z.number(),
    slotAvailableCount: z.number(),
  })
  .openapi("AvailableTimeSlotSchema");
export const availableTimeSlotListSchema = z.array(AvailableTimeSlotSchema);

export const ReservationWithUserSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      profileImage: z.string(),
    }),
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
  })
  .openapi("ReservationWithUserSchema");

export const ReservationWithUserListSchema = z.array(ReservationWithUserSchema);
