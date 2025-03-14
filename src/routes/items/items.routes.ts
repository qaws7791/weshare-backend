import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import {
  ItemDetailSchema,
  ItemListSchema,
  ItemParamsSchema,
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
