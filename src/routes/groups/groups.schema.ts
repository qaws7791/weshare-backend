import { z } from "@hono/zod-openapi";
export const GroupListSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);

export const GroupCreateJsonSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200),
  image: z.string(),
});

export const GroupDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GroupUpdateJsonSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  image: z.string().optional(),
});

export const GroupParamsSchema = z.object({
  id: z.string(),
});

export const GroupMemberListSchema = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
    profileImage: z.string(),
    role: z.string(),
    joinedAt: z.string(),
  }),
);

export const GroupMembersDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const GroupInviteSchema = z.object({
  id: z.string(),
  code: z.string(),
  isExpired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  groupId: z.string(),
});

export const GroupInviteListSchema = z.array(
  z.object({
    id: z.string(),
    code: z.string(),
    isExpired: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    groupId: z.string(),
  }),
);

export const GroupJoinJsonSchema = z.object({
  code: z.string(),
});

export const GroupInviteLinkSchema = z.object({
  groupId: z.string(),
});

export const GroupItemJsonSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500),
  caution: z.string().max(500).optional(),
  pickupLocation: z.string().max(100),
  returnLocation: z.string().max(100),
  images: z.array(z.string()).min(1).max(4),
  quantity: z.number().min(1).max(999),
});

export const GroupItemSchema = z.object({
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
  group: GroupDetailSchema,
});

export const GroupItemParamsSchema = z.object({
  id: z.string(),
  itemId: z.string(),
});
