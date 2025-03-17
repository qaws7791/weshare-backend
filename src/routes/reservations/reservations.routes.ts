import { errorContent, resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  ReservationCreateJsonSchema,
  ReservationParamsSchema,
  ReservationWithItemListSchema,
  ReservationWithItemSchema,
} from "@/routes/reservations/reservations.schema";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "reservations";

export const list = createRoute({
  summary: "예약 목록",
  method: "get",
  path: "/reservations",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  responses: {
    [status.OK]: {
      description: "예약 목록",
      content: resourceContent(ReservationWithItemListSchema),
    },
  },
});

export const detail = createRoute({
  summary: "예약 상세",
  method: "get",
  path: "/reservations/{id}",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ReservationParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "예약 상세",
      content: resourceContent(ReservationWithItemSchema),
    },
    [status.NOT_FOUND]: {
      description: "예약을 찾을 수 없습니다.",
      content: errorContent(),
    },
  },
});

export const cancel = createRoute({
  summary: "예약 취소",
  method: "post",
  path: "/reservations/{id}/cancel",
  tags: [TAG],
  middleware: [isAuthenticated] as const,
  security: [
    {
      cookieAuth: [],
    },
  ],
  request: {
    params: ReservationParamsSchema,
  },
  responses: {
    [status.OK]: {
      description: "예약 상세",
      content: resourceContent(ReservationWithItemSchema),
    },
    [status.BAD_REQUEST]: {
      description: "예약 취소를 위한 잘못된 요청입니다.",
      content: errorContent(),
    },
    [status.NOT_FOUND]: {
      description: "예약을 찾을 수 없습니다.",
      content: errorContent(),
    },
  },
});

export const reserveItem = createRoute({
  summary: "물품 예약",
  method: "post",
  path: "/reservations",
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
          schema: ReservationCreateJsonSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "예약 생성",
      content: resourceContent(ReservationWithItemSchema),
    },
    [status.NOT_FOUND]: {
      description: "물품을 찾을 수 없습니다.",
    },
    [status.BAD_REQUEST]: {
      description: "예약할 수 없는 물품입니다.",
    },
  },
});
