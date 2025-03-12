import { ErrorResponseSchema } from "@/shared/schema";
import { ZodSchema } from "@/types/zod";
import z from "zod";

export const resourceContent = <T extends ZodSchema>(resourceSchema: T) => ({
  "application/json": {
    schema: z.object({
      status: z.string(),
      code: z.number(),
      message: z.string(),
      data: resourceSchema,
    }),
  },
});

export const errorContent = () => ({
  "application/json": {
    schema: ErrorResponseSchema,
  },
});
