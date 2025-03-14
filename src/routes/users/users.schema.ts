import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  provider: z.string(),
  email: z.string().nullable(),
  providerId: z.string(),
  profileImage: z.string(),
});

export const UpdateProfileJsonSchema = z.object({
  username: z.string().optional(),
  profileImage: z.string().optional(),
});
