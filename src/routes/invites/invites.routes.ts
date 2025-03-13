import { errorContent, resourceContent } from "@/lib/create-schema";
import {
  InviteDetailSchema,
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
    [status.NOT_FOUND]: {
      description: "초대장을 찾을 수 없습니다.",
      content: errorContent(),
    },
  },
});
