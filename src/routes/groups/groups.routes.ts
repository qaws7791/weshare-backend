import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  GroupCreateJsonSchema,
  GroupDetailSchema,
  GroupInviteSchema,
  GroupListSchema,
  GroupMemberListSchema,
  GroupMembersDeleteSchema,
  GroupParamsSchema,
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
      content: resourceContent(GroupDetailSchema),
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
      content: resourceContent(GroupListSchema),
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
      content: resourceContent(GroupDetailSchema),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
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
      content: resourceContent(GroupDetailSchema),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
    },
  },
});

export const remove = createRoute({
  summary: "그룹 삭제",
  method: "delete",
  path: "/groups/{id}",
  middleware: [isAuthenticated] as const,
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "Delete group",
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "Internal server error",
      content: errorContent(),
    },
  },
});

export const listMembers = createRoute({
  summary: "그룹 멤버 목록 조회",
  method: "get",
  path: "/groups/{id}/members",
  middleware: [isAuthenticated] as const,
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "List group members",
      content: resourceContent(GroupMemberListSchema),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
  },
});

export const deleteMembers = createRoute({
  summary: "그룹 멤버 일괄 삭제",
  method: "delete",
  path: "/groups/{id}/members",
  middleware: [isAuthenticated] as const,
  request: {
    params: GroupParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GroupMembersDeleteSchema,
        },
      },
      description: "Group members to delete",
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "Delete group members",
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
    },
    [status.INTERNAL_SERVER_ERROR]: {
      description: "Internal server error",
      content: errorContent(),
    },
  },
});

export const createInviteLink = createRoute({
  summary: "그룹 초대 링크 생성",
  method: "post",
  path: "/groups/{id}/invites",
  middleware: [isAuthenticated] as const,
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "Create invite link",
      content: resourceContent(GroupInviteSchema),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
    },
    [status.CONFLICT]: {
      description: "Invite link already exists",
      content: errorContent(),
    },
  },
});
