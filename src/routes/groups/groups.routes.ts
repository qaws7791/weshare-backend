import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  GroupCreateJsonSchema,
  GroupDetailSchema,
  GroupListSchema,
} from "@/routes/groups/groups.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

export const create = createRoute({
  summary: "새로운 그룹 생성",
  method: "post",
  path: "/groups",
  middleware: [isAuthenticated] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: GroupCreateJsonSchema,
        },
      },
      description: "Group to create",
    },
  },
  responses: {
    [status.OK]: {
      description: "Create group",
      content: {
        "application/json": {
          schema: resourceContent(GroupDetailSchema),
        },
      },
    },
  },
});

export const list = createRoute({
  summary: "사용자가 속한 그룹 목록 조회",
  method: "get",
  path: "/groups",
  middleware: [isAuthenticated] as const,
  responses: {
    [status.OK]: {
      description: "List groups",
      content: {
        "application/json": {
          schema: resourceContent(GroupListSchema),
        },
      },
    },
  },
});
