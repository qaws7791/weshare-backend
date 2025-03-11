import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  UpdateProfileJsonSchema,
  UserSchema,
} from "@/routes/users/users.schema";
import { ErrorResponseSchema } from "@/shared/schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

export const profile = createRoute({
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

export const updateProfile = createRoute({
  method: "patch",
  path: "/me",
  description: "로그인한 사용자 프로필 수정",
  middleware: [isAuthenticated] as const,
  request: {
    body: {
      description: "수정할 사용자 프로필 정보",
      content: {
        "application/json": {
          schema: UpdateProfileJsonSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "사용자 정보",
      content: {
        "application/json": {
          schema: resourceContent(UserSchema),
        },
      },
    },
    [status.BAD_REQUEST]: {
      description: "잘못된 요청",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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
