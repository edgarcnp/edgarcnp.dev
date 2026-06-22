import { cors } from "hono/cors"

/**
 * CORS configuration for the Hono API.
 *
 * @remarks
 * - Origin restricted to the request's own host (self-origin check).
 * - Only GET requests are allowed (read-only API).
 * - Preflight responses cached for 24 hours (86400s).
 * - Applied via `app.use("*", corsMiddleware)` in `src/api/index.ts`.
 */
export const corsMiddleware = cors({
    origin: (origin, c) => {
        try {
            const requestHost = new URL(c.req.url).hostname
            const originHost = new URL(origin).hostname
            return requestHost === originHost ? origin : ""
        } catch {
            return ""
        }
    },
    allowMethods: ["GET"],
    maxAge: 86400,
})
