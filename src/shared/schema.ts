import z from "zod";

export const ErrorResponseSchema = z.object({
  status: z.string(),
  code: z.number(),
  message: z.string(),
  errors: z.array(z.string()).optional(),
});
