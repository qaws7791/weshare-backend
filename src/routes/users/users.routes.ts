import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { UserSchema } from "@/routes/users/users.schema";
import { ErrorResponseSchema } from "@/shared/schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

export const me = createRoute({
  method: "get",
  path: "/me",
  description: "로그인한 사용자 정보 조회",
  middleware: [isAuthenticated] as const,
  responses: {
    [status.OK]: {
      description: "사용자 정보",
      content: {
        "application/json": {
          schema: resourceContent(UserSchema),
        },
      },
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "서버 오류",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
