import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

export const kakaoLogin = createRoute({
  summary: "Kakao Login URL 가져오기",
  method: "get",
  path: "auth/login/kakao",
  responses: {
    [status.OK]: {
      description: "Response Login URL",
      content: {
        "application/json": {
          schema: z.object({
            url: z.string(),
          }),
        },
      },
    },
  },
});

export const kakaoLoginRedirect = createRoute({
  summary: "Kakao Login 리디렉션 버전",
  method: "get",
  path: "auth/login/kakao/callback",
  request: {
    query: z.object({
      code: z.string(),
    }),
  },
  responses: {
    [status.OK]: {
      description: "Login success",
      headers: {
        "Set-Cookie": {
          description: "session cookie",
          schema: {
            type: "string",
            example:
              "s_id=757075c8e9e3d226; Path=/; Expires=Thu, 10 Apr 2025 14:20:19 GMT; HttpOnly; Secure; SameSite=Lax",
          },
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "Login failed",
    },
  },
});

export const kakaoLoginCallback = createRoute({
  summary: "Kakao Login Callback 호출 버전",
  method: "post",
  path: "auth/login/kakao/callback",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.string(),
          }),
        },
      },
      description: "Kakao login callback",
    },
  },
  responses: {
    [status.OK]: {
      description: "Login success",
      headers: {
        "Set-Cookie": {
          description: "session cookie",
          schema: {
            type: "string",
            example:
              "s_id=757075c8e9e3d226; Path=/; Expires=Thu, 10 Apr 2025 14:20:19 GMT; HttpOnly; Secure; SameSite=Lax",
          },
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "Login failed",
    },
  },
});
