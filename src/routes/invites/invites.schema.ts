import { z } from "@hono/zod-openapi";
export const InviteParamsSchema = z.object({
  code: z.string(),
});

export const InviteDetailSchema = z.object({
  id: z.string(),
  code: z.string(),
  isExpired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  groupId: z.string(),
  group: z.object({
    description: z.string(),
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    name: z.string(),
  }),
});

export const InviteJoinResponseSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.string(),
  joinedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
