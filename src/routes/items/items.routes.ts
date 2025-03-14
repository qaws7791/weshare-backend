import { resourceContent } from "@/lib/create-schema";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { ItemListSchema } from "@/routes/items/items.schema";
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
