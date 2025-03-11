import z from "zod";

export const KakaoLoginCallbackJsonSchema = z.object({
  code: z.string(),
});
