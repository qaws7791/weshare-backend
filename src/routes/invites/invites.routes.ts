import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  InviteDetailSchema,
  InviteJoinResponseSchema,
  InviteParamsSchema,
} from "@/routes/invites/invites.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "invites";

export const detail = createRoute({
  summary: "초대장 상세 조회",
  method: "get",
  path: "/invites/{code}",
  tags: [TAG],
  request: {
    params: InviteParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "초대장 상세 정보",
      content: resourceContent(InviteDetailSchema),
    },
    [status.BAD_REQUEST]: {
      description: "초대 링크가 만료되었거나 비활성 상태입니다",
      content: errorContent(),
    },
  },
});

export const acceptInvite = createRoute({
  summary: "초대장으로 그룹 가입",
  method: "post",
  path: "/invites/{code}/join",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  request: {
    params: InviteParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "그룹 가입 성공",
      content: resourceContent(InviteJoinResponseSchema),
    },
    [status.BAD_REQUEST]: {
      description: "초대 링크가 만료되었거나 비활성 상태입니다",
      content: errorContent(),
    },
    [status.CONFLICT]: {
      description: "이미 가입된 그룹입니다",
      content: errorContent(),
    },
  },
});
