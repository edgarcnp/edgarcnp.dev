import { Hono } from "hono";

/**
 * RSS feed API route — mounted at `/api/rss`.
 *
 * @returns Empty RSS XML with `application/rss+xml` content type.
 *
 * @remarks Placeholder endpoint — will be populated with writing posts in the future.
 */
const rss = new Hono();

rss.get("/", (c) => {
  return c.text("", 200, {
    "Content-Type": "application/rss+xml",
    "Cache-Control": "public, max-age=900",
  });
});

export { rss };
