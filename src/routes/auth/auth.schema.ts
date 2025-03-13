import z from "zod";

export const KakaoLoginUrlSchema = z.object({
  url: z.string().url(),
});

export const KakaoLoginCallbackJsonSchema = z.object({
  code: z.string(),
});

export const EmailRegisterJsonSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(50),
});

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  provider: z.string().nullable(),
  email: z.string().nullable(),
  providerId: z.string().nullable(),
  profileImage: z.string().nullable(),
});

export const EmailLoginJsonSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
