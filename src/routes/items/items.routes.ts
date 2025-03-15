import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  availableTimeSlotSchema,
  ItemDetailSchema,
  ItemListSchema,
  ItemParamsSchema,
  ItemReserveJsonSchema,
  ReservationSchema,
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

export const detail = createRoute({
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

export const reserveItem = createRoute({
  summary: "물품 예약",
  method: "post",
  path: "/items/{id}/reserve",
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
          schema: ItemReserveJsonSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "물품 예약",
      content: resourceContent(ReservationSchema),
    },
    [status.NOT_FOUND]: {
      description: "물품을 찾을 수 없습니다.",
    },
    [status.BAD_REQUEST]: {
      description: "예약할 수 없는 물품입니다.",
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
