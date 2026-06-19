import type { MiddlewareHandler } from "hono";

function getOrigin(c: any): string | null {
  const origin = c.req.header("origin");
  if (origin) return origin;

  const referer = c.req.header("referer");
  if (referer) {
    try { return new URL(referer).origin; } catch { return null; }
  }

  return null;
}

export const csrfGuard: MiddlewareHandler = async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    await next();
    return;
  }

  const origin = getOrigin(c);
  if (origin && origin !== "https://edgarcnp.dev") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
};
