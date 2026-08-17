import { defineMiddleware } from "astro:middleware"

const SECURITY_HEADERS: Record<string, string> = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-DNS-Prefetch-Control": "off",
    "X-Frame-Options": "DENY",
    "X-Permitted-Cross-Domain-Policies": "none",
}

const REDIRECTS: Record<string, string> = {
    "/old-path": "/new-path",
}

export const onRequest = defineMiddleware(async (context, next) => {
    const reqPath: string = context.url.pathname
    if (reqPath in REDIRECTS) {
        return context.redirect(REDIRECTS[reqPath], 301)
    }
    const response = await next()
    if (reqPath.startsWith("/_astro/")) {
        response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
    } else if (!reqPath.startsWith("/api")) {
        response.headers.set("Cache-Control", "public, s-maxage=3600, max-age=0, must-revalidate")
    }
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value)
    }
    return response
})
