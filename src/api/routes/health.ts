import { Hono } from "hono";

/**
 * Health check API route — mounted at `/api/health`.
 *
 * @returns JSON response with `{ status: "ok", timestamp: number }`.
 *
 * @remarks Simple liveness probe for monitoring and load balancers.
 */
const health = new Hono();

health.get("/", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

export { health };
