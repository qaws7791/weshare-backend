import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    status: z.string(),
    code: z.number(),
    message: z.string(),
    errors: z.array(z.string()).optional(),
  })
  .openapi("ErrorResponseSchema");

export const PaginationSchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  })
  .openapi("PaginationSchema");
