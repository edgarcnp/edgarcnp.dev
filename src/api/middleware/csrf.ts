import type { MiddlewareHandler } from "hono";

const PRODUCTION_ORIGIN = "https://edgarcnp.dev";

/**
 * Extract the origin from the request, checking Origin header first, then Referer.
 *
 * @param c - Hono request context.
 * @returns The origin string (e.g. "https://edgarcnp.dev"), or null if unavailable.
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
 * - Rejects when origin doesn't match production domain.
 * - Currently disabled in development via `import.meta.env.PROD` check in `src/api/index.ts`.
 */
export const csrfGuard: MiddlewareHandler = async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    await next();
    return;
  }

  const origin = getOrigin(c);
  if (origin !== PRODUCTION_ORIGIN) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
};
