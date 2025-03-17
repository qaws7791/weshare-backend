import { z } from "@hono/zod-openapi";

export const GroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("GroupSchema");

export const GroupListSchema = z.array(GroupSchema);

export const GroupCreateJsonSchema = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(200),
    image: z.string(),
  })
  .openapi("GroupCreateJsonSchema");

export const GroupUpdateJsonSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(200).optional(),
    image: z.string().optional(),
  })
  .openapi("GroupUpdateJsonSchema");

export const GroupParamsSchema = z
  .object({
    id: z.string(),
  })
  .openapi("GroupParamsSchema");

export const MemberSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    profileImage: z.string(),
    role: z.string(),
    joinedAt: z.string(),
  })
  .openapi("MemberSchema");

export const MemberListSchema = z.array(MemberSchema);

export const GroupMembersDeleteJsonSchema = z
  .object({
    ids: z.array(z.string()),
  })
  .openapi("GroupMembersDeleteJsonSchema");

export const InviteSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    isExpired: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    groupId: z.string(),
  })
  .openapi("InviteSchema");

export const InviteListSchema = z.array(InviteSchema);

export const GroupJoinJsonSchema = z
  .object({
    code: z.string(),
  })
  .openapi("GroupJoinJsonSchema");

export const GroupItemCreateJsonSchema = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(500),
    caution: z.string().max(500).optional(),
    pickupLocation: z.string().max(100),
    returnLocation: z.string().max(100),
    images: z.array(z.string()).min(1).max(4),
    quantity: z.number().min(1).max(999),
  })
  .openapi("GroupItemCreateJsonSchema");

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
  group: GroupSchema,
});
export const GroupItemListSchema = z.array(GroupItemSchema);

export const GroupItemParamsSchema = z.object({
  id: z.string(),
  itemId: z.string(),
});
