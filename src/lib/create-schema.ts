import { ZodSchema } from "@/types/zod";
import z from "zod";

export const resourceContent = <T extends ZodSchema>(resourceSchema: T) => {
  return z.object({
    status: z.string(),
    code: z.number(),
    message: z.string(),
    data: resourceSchema,
  });
};
