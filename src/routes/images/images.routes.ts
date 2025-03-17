import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { ImageSchema } from "@/routes/images/images.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "images";

export const uploadOne = createRoute({
  summary: "단일 이미지 업로드",
  method: "post",
  path: "/images",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
      },
      description: "Image to upload",
    },
  },
  responses: {
    [status.OK]: {
      description: "Upload image",
      content: resourceContent(ImageSchema),
    },
    [status.BAD_REQUEST]: {
      description: "Invalid file type",
      content: errorContent(),
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "Error uploading file",
      content: errorContent(),
    },
  },
});
