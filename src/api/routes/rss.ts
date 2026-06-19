import { Hono } from "hono";

const rss = new Hono();

rss.get("/", (c) => {
  return c.text("", 200, { "Content-Type": "application/rss+xml" });
});

export default rss;
