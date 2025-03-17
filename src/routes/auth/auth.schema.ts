import { z } from "@hono/zod-openapi";

export const KakaoLoginUrlSchema = z
  .object({
    url: z.string().url(),
  })
  .openapi("KakaoLoginUrlSchema");

export const KakaoLoginCallbackJsonSchema = z
  .object({
    code: z.string(),
  })
  .openapi("KakaoLoginCallbackJsonSchema");

export const EmailRegisterJsonSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(2).max(50),
  })
  .openapi("EmailRegisterJsonSchema");

export const EmailLoginJsonSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .openapi("EmailLoginJsonSchema");
