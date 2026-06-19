import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { rateLimit } from "./middleware/ratelimit";
import { csrfGuard } from "./middleware/csrf";
import health from "./routes/health";
import news from "./routes/news";
import rss from "./routes/rss";

const app = new Hono().basePath("/api");

if (import.meta.env.PROD) app.use("*", corsMiddleware);
app.use("*", rateLimit);
if (import.meta.env.PROD) app.use("*", csrfGuard);

app.route("/health", health);
app.route("/news", news);
app.route("/rss", rss);

export default app;
