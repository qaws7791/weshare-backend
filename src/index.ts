import { type Env, Hono } from "hono";
import auth from "./routes/auth.route";
import users from "./routes/users.route";
import groups from "./routes/groups.route";
import items from "./routes/items.route";
import reservations from "./routes/reservations.route";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Session, SessionManager, User } from "./lib/session";
import sessionMiddleware from "./middlewares/session.middleware";

export interface Context extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
  };
}

const ORIGIN: string = "http://localhost:3000";

const app = new Hono<Context>();

app.use(logger());
app.use(
  "*",
  cors({
    origin: ORIGIN,
    allowMethods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
  })
);
app.use(
  csrf({
    origin: ORIGIN,
  })
);
// session middleware
app.use("*", sessionMiddleware);

app.use(async (_c, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  await next();
});

app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/groups", groups);
app.route("/api/items", items);
app.route("/api/reservations", reservations);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default {
  port: 4000,
  fetch: app.fetch,
};
