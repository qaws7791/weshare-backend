import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    provider: z.string().nullable(),
    email: z.string().nullable(),
    providerId: z.string().nullable(),
    profileImage: z.string(),
  })
  .openapi("UserSchema");

export const ProfileUpdateJsonSchema = z
  .object({
    username: z.string().optional(),
    profileImage: z.string().optional(),
  })
  .openapi("ProfileUpdateJsonSchema");
