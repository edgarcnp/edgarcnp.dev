import { Hono } from "hono";

const health = new Hono();

health.get("/", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

export default health;
