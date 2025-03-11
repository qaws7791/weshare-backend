import z from "zod";

export const UploadImageBodySchema = z.object({
  file: z.instanceof(File).refine((file) => {
    return file.size < 5 * 1024 * 1024; // 5MB
  }),
});

export const UploadImageSchema = z.object({
  url: z.string(),
});
