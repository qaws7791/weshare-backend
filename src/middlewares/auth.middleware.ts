import { createMiddleware } from "hono/factory";
import { Context } from "../types/hono";

/**
 * 인증된 사용자만 핸들러에 접근할 수 있도록 하는 미들웨어
 * @description c.get("user")가 존재하지 않으면 401 에러를 반환합니다.
 */
export const isAuthenticated = createMiddleware<Context>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      {
        status: "error",
        code: 401,
        message: "Unauthorized",
      },
      401,
    );
  }
  return next();
});
