import type { MiddlewareHandler } from "hono"

interface RatelimitBinding {
    limit(opts: { key: string }): Promise<{ success: boolean }>
}

interface CloudflareEnv {
    RATE_LIMITER?: RatelimitBinding
}

/**
 * Rate limiting middleware using Cloudflare's native Rate Limiting binding.
 *
 * @remarks
 * - Configured in wrangler.jsonc: 30 requests per 60-second window.
 * - Enforced at the Cloudflare edge — not per-isolate like in-memory Maps.
 * - Uses `cf-connecting-ip` header for real client IP behind Cloudflare.
 * - Falls back to `x-forwarded-for` for non-Cloudflare setups.
 * - Returns 429 with JSON error when limit exceeded.
 * - The binding is accessed via `c.env.RATE_LIMITER` (Cloudflare Workers runtime).
 *
 * @throws Will return 429 response if rate limit is exceeded.
 */
export const rateLimit: MiddlewareHandler = async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown"

    const env = c.env as CloudflareEnv
    const rateLimiter = env.RATE_LIMITER
    if (!rateLimiter) {
        await next()
        return
    }

    const { success } = await rateLimiter.limit({ key: ip })

    if (!success) {
        return c.json({ error: "Too many requests" }, 429)
    }

    await next()
}
