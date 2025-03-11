import { Env } from "hono";
import { Session, User } from "../lib/session";

export interface Context extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
  };
}
