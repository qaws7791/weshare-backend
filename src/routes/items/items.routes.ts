import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  availableTimeSlotSchema,
  ItemDetailSchema,
  ItemJsonSchema,
  ItemListSchema,
  ItemParamsSchema,
  ReservationsWithUserSchema,
} from "@/routes/items/items.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "items";

export const list = createRoute({
  summary: "물품 목록",
  method: "get",
  path: "/items",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  responses: {
    [status.OK]: {
      description: "물품 목록",
      content: resourceContent(ItemListSchema),
    },
  },
});

export const availableTimes = createRoute({
  summary: "예약 가능한 시간대",
  method: "get",
  path: "/items/{id}/available-times",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ItemParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "예약 가능한 시간대",
      content: resourceContent(availableTimeSlotSchema),
    },
    [status.NOT_FOUND]: {
      description: "물품을 찾을 수 없습니다.",
    },
  },
});

export const itemReservations = createRoute({
  summary: "물품 예약 내역",
  method: "get",
  path: "/items/{id}/reservations",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ItemParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "물품 예약 내역",
      content: resourceContent(ReservationsWithUserSchema),
    },
    [status.NOT_FOUND]: {
      description: "물품을 찾을 수 없습니다.",
    },
  },
});

export const itemDetail = createRoute({
  summary: "물품 상세",
  method: "get",
  path: "/items/{id}",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ItemParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "물품 상세",
      content: resourceContent(ItemDetailSchema),
    },
    [status.NOT_FOUND]: {
      description: "물품을 찾을 수 없습니다.",
    },
  },
});

export const update = createRoute({
  summary: "그룹 아이템 수정(관리자만 가능)",
  method: "patch",
  path: "/items/{id}",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ItemParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: ItemJsonSchema,
        },
      },
      description: "Group item to update",
    },
  },
  responses: {
    [status.OK]: {
      description: "Update group item",
      content: resourceContent(ItemDetailSchema),
    },
    [status.BAD_REQUEST]: {
      description: "Invalid group item data",
      content: errorContent(),
    },
    [status.FORBIDDEN]: {
      description: "You are not a member or admin of this group",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "Group or group item not found",
      content: errorContent(),
    },
  },
});
