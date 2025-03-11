import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  UploadImageBodySchema,
  UploadImageSchema,
} from "@/routes/images/images.schema";
import { ErrorResponseSchema } from "@/shared/schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

export const uploadOne = createRoute({
  summary: "단일 이미지 업로드",
  method: "post",
  path: "/images",
  middleware: [isAuthenticated] as const,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UploadImageBodySchema,
        },
      },
      description: "Image to upload",
    },
  },
  responses: {
    [status.OK]: {
      description: "Upload image",
      content: {
        "application/json": {
          schema: resourceContent(UploadImageSchema),
        },
      },
    },
    [status.BAD_REQUEST]: {
      description: "Invalid file type",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "Error uploading file",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
