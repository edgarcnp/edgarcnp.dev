import type { MiddlewareHandler } from "hono";

/**
 * Extract the origin from the request, checking Origin header first, then Referer.
 *
 * @param c - Hono request context.
 * @returns The origin string, or null if unavailable.
 *
 * @remarks Parses the Referer URL if Origin is missing — handles partial referer strings.
 */
function getOrigin(c: any): string | null {
  const origin = c.req.header("origin");
  if (origin) return origin;

  const referer = c.req.header("referer");
  if (referer) {
    try { return new URL(referer).origin; } catch { return null; }
  }

  return null;
}

/**
 * CSRF guard middleware — validates Origin/Referer for non-safe methods.
 *
 * @remarks
 * - GET, HEAD, and OPTIONS requests are always allowed through.
 * - Non-safe methods (POST, PUT, DELETE, etc.) require a valid Origin/Referer.
 * - Rejects when origin is missing entirely (fails closed, not open).
 * - Rejects when origin doesn't match the request's own host.
 * - Currently disabled in development via `import.meta.env.PROD` check in `src/api/index.ts`.
 */
export const csrfGuard: MiddlewareHandler = async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    await next();
    return;
  }

  const requestOrigin = new URL(c.req.url).origin;
  const origin = getOrigin(c);
  if (origin !== requestOrigin) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
};
