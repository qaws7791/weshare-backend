import { z } from "@hono/zod-openapi";

export const ImageSchema = z
  .object({
    url: z.string(),
  })
  .openapi("ImageSchema");
