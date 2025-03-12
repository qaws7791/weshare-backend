import z from "zod";

export const KakaoLoginUrlSchema = z.object({
  url: z.string().url(),
});

export const KakaoLoginCallbackJsonSchema = z.object({
  code: z.string(),
});
