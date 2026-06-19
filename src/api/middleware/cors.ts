import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: "https://edgarcnp.dev",
  allowMethods: ["GET"],
  maxAge: 86400,
});
