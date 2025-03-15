import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  GroupCreateJsonSchema,
  GroupDetailSchema,
  GroupInviteLinkSchema,
  GroupInviteListSchema,
  GroupInviteSchema,
  GroupItemJsonSchema,
  GroupItemListSchema,
  GroupItemParamsSchema,
  GroupItemSchema,
  GroupJoinJsonSchema,
  GroupListSchema,
  GroupMemberListSchema,
  GroupMembersDeleteSchema,
  GroupParamsSchema,
} from "@/routes/groups/groups.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "groups";

export const create = createRoute({
  summary: "새로운 그룹 생성",
  method: "post",
  path: "/groups",
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
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

export const listInvites = createRoute({
  summary: "그룹 초대 링크 목록 조회",
  method: "get",
  path: "/groups/{id}/invites",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "List group invites",
      content: resourceContent(GroupInviteListSchema),
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

export const joinInviteLink = createRoute({
  summary: "그룹 초대 링크로 그룹 가입",
  method: "post",
  path: "/groups/{id}/join",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: GroupParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GroupJoinJsonSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "Join group with invite link",
      content: resourceContent(GroupInviteLinkSchema),
    },
    [status.BAD_REQUEST]: {
      description: "Invalid invite code",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group not found",
      content: errorContent(),
    },
    [status.CONFLICT]: {
      description: "Already a member of this group",
      content: errorContent(),
    },
  },
});

export const createItem = createRoute({
  summary: "그룹 아이템 생성",
  method: "post",
  path: "/groups/{id}/items",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: GroupParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GroupItemJsonSchema,
        },
      },
      description: "Group item to create",
    },
  },
  responses: {
    [status.OK]: {
      description: "Create group item",
      content: resourceContent(GroupItemSchema),
    },
    [status.BAD_REQUEST]: {
      description: "Invalid group item data",
      content: errorContent(),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member or admin of this group",
      content: errorContent(),
    },
  },
});

export const updateItem = createRoute({
  summary: "그룹 아이템 수정",
  method: "patch",
  path: "/groups/{id}/items/{itemId}",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: GroupItemParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GroupItemJsonSchema,
        },
      },
      description: "Group item to update",
    },
  },
  responses: {
    [status.OK]: {
      description: "Update group item",
      content: resourceContent(GroupItemSchema),
    },
    [status.BAD_REQUEST]: {
      description: "Invalid group item data",
      content: errorContent(),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member or admin of this group",
      content: errorContent(),
    },
  },
});

export const listItems = createRoute({
  summary: "그룹 아이템 목록",
  method: "get",
  path: "/groups/{id}/items",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: GroupParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "List group items",
      content: resourceContent(GroupItemListSchema),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member or admin of this group",
      content: errorContent(),
    },
  },
});
