import type { MiddlewareHandler } from "hono";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, WINDOW_MS);

export const rateLimit: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else if (entry.count >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  } else {
    entry.count++;
  }

  await next();
};
