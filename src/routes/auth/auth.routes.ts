import { resourceContent } from "@/lib/create-schema";
import {
  EmailLoginJsonSchema,
  EmailRegisterJsonSchema,
  KakaoLoginUrlSchema,
} from "@/routes/auth/auth.schema";
import { UserSchema } from "@/routes/users/users.schema";
import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = "auth";

export const emailRegister = createRoute({
  summary: "이메일 회원가입",
  method: "post",
  path: "auth/register",
  tags: [TAG],
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailRegisterJsonSchema,
        },
      },
      description: "회원가입",
    },
  },
  responses: {
    [status.CREATED]: {
      description: "회원가입 성공",
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
      content: resourceContent(UserSchema),
    },
    [status.BAD_REQUEST]: {
      description: "잘못된 값을 전달받음",
    },
  },
});

export const emailLogin = createRoute({
  summary: "이메일 로그인",
  method: "post",
  path: "auth/login",
  tags: [TAG],
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmailLoginJsonSchema,
        },
      },
      description: "이메일 로그인",
    },
  },
  responses: {
    [status.OK]: {
      description: "로그인 성공",
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
      content: resourceContent(UserSchema),
    },
    [status.UNAUTHORIZED]: {
      description: "로그인 실패",
    },
  },
});

export const kakaoLogin = createRoute({
  summary: "Kakao Login URL 가져오기",
  method: "get",
  path: "auth/login/kakao",
  tags: [TAG],
  responses: {
    [status.OK]: {
      description: "Response Login URL",
      content: resourceContent(KakaoLoginUrlSchema),
    },
  },
});

export const kakaoLoginRedirect = createRoute({
  summary: "Kakao Login 리디렉션 버전",
  method: "get",
  path: "auth/login/kakao/callback",
  tags: [TAG],
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
  tags: [TAG],
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
