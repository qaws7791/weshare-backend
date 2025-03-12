import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { v2 as cloudinary } from "cloudinary";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import sessionMiddleware from "./middlewares/session.middleware";
import auth from "./routes/auth";
import groups from "./routes/groups";
import images from "./routes/images";
import items from "./routes/items.route";
import reservations from "./routes/reservations.route";
import users from "./routes/users";
import { Context } from "./types/hono";

const ORIGIN: string = "http://localhost:4000";

const app = new OpenAPIHono<Context>();

app.use(logger());
app.use(
  "*",
  cors({
    origin: ORIGIN,
    allowMethods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
  }),
);
app.use(
  csrf({
    origin: ORIGIN,
  }),
);
app.use("*", sessionMiddleware);

app.use(async (_c, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  await next();
});

app.basePath("/api");
app.route("/", images);
app.route("/", auth);
app.route("/", users);
app.route("/", groups);
app.route("/", items);
app.route("/", reservations);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "s_id",
  description: "Session ID",
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono API",
  },
});

export default {
  port: 4000,
  fetch: app.fetch,
};
