import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  provider: z.string().nullable(),
  email: z.string().nullable(),
  providerId: z.string().nullable(),
  profileImage: z.string(),
});

export const UpdateProfileJsonSchema = z.object({
  username: z.string().optional(),
  profileImage: z.string().optional(),
});
