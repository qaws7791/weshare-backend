import type { z } from "@hono/zod-openapi";

export type ZodSchema = z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
