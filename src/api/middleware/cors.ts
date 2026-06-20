import { cors } from "hono/cors";

/**
 * CORS configuration for the Hono API.
 *
 * @remarks
 * - Origin restricted to `https://edgarcnp.dev` in production.
 * - Only GET requests are allowed (read-only API).
 * - Preflight responses cached for 24 hours (86400s).
 * - Applied via `app.use("*", corsMiddleware)` in `src/api/index.ts`.
 */
export const corsMiddleware = cors({
  origin: "https://edgarcnp.dev",
  allowMethods: ["GET"],
  maxAge: 86400,
});
