import { OpenAPIHono } from "@hono/zod-openapi";
import { v2 as cloudinary } from "cloudinary";
import { encodeBase64 } from "hono/utils/encode";
import * as routes from "./images.routes";
const app = new OpenAPIHono();

app.openapi(routes.uploadOne, async (c) => {
  const body = await c.req.parseBody({ all: true });
  const files = body.files;
  // File 또는 File[]가 아닌 경우
  if (
    !files ||
    (Array.isArray(files) && files.length === 0) ||
    (files instanceof File && files.size === 0)
  ) {
    return c.json(
      {
        status: "error",
        code: 400,
        message: "Invalid file type",
      },
      400,
    );
  }

  const images = (Array.isArray(files) ? files : [files]) as File[];

  for (const file of images) {
    // file이 File이 아닌 경우
    if (!(file instanceof File)) {
      return c.json(
        {
          status: "error",
          code: 400,
          message: "Invalid file type",
        },
        400,
      );
    }
    // file 사이즈가 5MB 초과인 경우
    if (file.size > 5 * 1024 * 1024) {
      return c.json(
        {
          status: "error",
          code: 400,
          message: "File size exceeds 5MB",
        },
        400,
      );
    }
  }

  const imagesToUpload = images.map(async (_file) => {
    const file = _file as File;
    const byteArrayBuffer = await file.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);
    const results = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`,
      {
        asset_folder: "uploads",
      },
    );
    return {
      url: results.secure_url,
    };
  });

  try {
    const results = await Promise.all(imagesToUpload);

    return c.json({
      status: "success",
      code: 200,
      message: "File uploaded successfully",
      data: results,
    });
  } catch {
    return c.json(
      {
        status: "error",
        code: 500,
        message: "Error uploading file",
      },
      500,
    );
  }
});

export default app;
