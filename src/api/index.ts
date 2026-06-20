import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { rateLimit } from "./middleware/ratelimit";
import { csrfGuard } from "./middleware/csrf";
import { health } from "./routes/health";
import { news } from "./routes/news";
import { rss } from "./routes/rss";
import { AppError, ValidationError, NotFoundError } from "~/lib/errors";

/**
 * Hono API application — mounted at `/api` via Nitro catch-all route.
 *
 * @remarks
 * - Security middleware (CORS, CSRF, rate limiting) applied only in production.
 * - Error handler maps typed error classes to appropriate HTTP status codes.
 * - Routes: `/api/health`, `/api/news`, `/api/rss`.
 */
const app = new Hono().basePath("/api");

if (import.meta.env.PROD) {
  app.use("*", corsMiddleware);
  app.use("*", csrfGuard);
  app.use("*", rateLimit);
}

/**
 * Global error handler — maps typed error classes to HTTP responses.
 *
 * @remarks
 * - `ValidationError` → 400 with source and message details.
 * - `NotFoundError` → 404 with resource and id details.
 * - `AppError` → 500 with generic message.
 * - Unknown errors → 500 with generic message.
 * - All errors are logged to console for debugging.
 */
app.onError((err, c) => {
  if (err instanceof ValidationError) {
    console.error(`[API] Validation: ${err.message}`);
    return c.json({ error: "Validation failed", source: err.source, message: err.message }, 400);
  }
  if (err instanceof NotFoundError) {
    return c.json({ error: "Not found", resource: err.resource, id: err.id }, 404);
  }
  if (err instanceof AppError) {
    console.error(`[API] ${err.name}: ${err.message}`);
    return c.json({ error: "Internal error" }, 500);
  }
  console.error("[API] Unknown error:", err);
  return c.json({ error: "Internal error" }, 500);
});

app.route("/health", health);
app.route("/news", news);
app.route("/rss", rss);

export { app };
