import { z } from "@hono/zod-openapi";

export const ItemListSchema = z.array(
  z.object({
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
  }),
);
