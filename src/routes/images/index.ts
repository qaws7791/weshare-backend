import { OpenAPIHono } from "@hono/zod-openapi";
import { v2 as cloudinary } from "cloudinary";
import { encodeBase64 } from "hono/utils/encode";
import * as routes from "./images.routes";
const app = new OpenAPIHono();

app.openapi(routes.uploadOne, async (c) => {
  const body = await c.req.parseBody();
  const image = body.file;
  if (typeof image === "string") {
    return c.json(
      {
        status: "error",
        code: 400,
        message: "Invalid file type",
      },
      400,
    );
  }

  if (image.size > 5 * 1024 * 1024) {
    return c.json(
      {
        status: "error",
        code: 400,
        message: "File size exceeds 5MB",
      },
      400,
    );
  }
  try {
    const byteArrayBuffer = await image.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);
    const results = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`,
      {
        asset_folder: "uploads",
      },
    );

    return c.json({
      status: "success",
      code: 200,
      message: "File uploaded successfully",
      data: {
        url: results.secure_url,
      },
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
