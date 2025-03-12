import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  GroupCreateJsonSchema,
  GroupDetailSchema,
  GroupListSchema,
  GroupParamsSchema,
} from "@/routes/groups/groups.schema";
import { ErrorResponseSchema } from "@/shared/schema";
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

export const update = createRoute({
  summary: "그룹 정보 수정",
  method: "patch",
  path: "/groups/{id}",
  middleware: [isAuthenticated] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: GroupCreateJsonSchema,
        },
      },
      description: "Group to update",
    },
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "Update group",
      content: {
        "application/json": {
          schema: resourceContent(GroupDetailSchema),
        },
      },
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const detail = createRoute({
  summary: "그룹 상세 조회",
  method: "get",
  path: "/groups/{id}",
  middleware: [isAuthenticated] as const,
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "Group detail",
      content: {
        "application/json": {
          schema: resourceContent(GroupDetailSchema),
        },
      },
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
