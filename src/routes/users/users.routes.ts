import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  UpdateProfileJsonSchema,
  UserSchema,
} from "@/routes/users/users.schema";
import { ErrorResponseSchema } from "@/shared/schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "users";

export const profile = createRoute({
  summary: "사용자 정보 조회",
  method: "get",
  path: "/users/me",
  description: "로그인한 사용자 정보 조회",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  responses: {
    [status.OK]: {
      description: "사용자 정보",
      content: resourceContent(UserSchema),
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

export const updateProfile = createRoute({
  summary: "사용자 정보 수정",
  method: "patch",
  path: "/users/me",
  description: "로그인한 사용자 정보 수정",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    body: {
      description: "수정할 사용자 정보",
      content: {
        "application/json": {
          schema: UpdateProfileJsonSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "사용자 정보 수정 성공",
      content: resourceContent(UserSchema),
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "서버 오류",
      content: errorContent(),
    },
  },
});
