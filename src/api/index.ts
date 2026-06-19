import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { rateLimit } from "./middleware/ratelimit";
import { csrfGuard } from "./middleware/csrf";
import health from "./routes/health";
import news from "./routes/news";
import rss from "./routes/rss";
import { AppError, ValidationError, NotFoundError } from "~/lib/errors";

const app = new Hono().basePath("/api");

if (import.meta.env.PROD) {
  app.use("*", corsMiddleware);
  app.use("*", csrfGuard);
  app.use("*", rateLimit);
}

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

export default app;
