import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    status: z.string(),
    code: z.number(),
    message: z.string(),
    errors: z.array(z.string()).optional(),
  })
  .openapi("ErrorResponseSchema");
