import { Hono } from "hono";

const news = new Hono();

news.get("/", (c) => {
  return c.json({ items: [] });
});

export default news;
