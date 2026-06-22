/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/only-throw-error -- nitropack types are unresolvable */
import { defineNitroPlugin } from "nitropack/runtime"
import { redirect } from "h3"
import { randomBytes } from "node:crypto"

function generateNonce(): string {
    return randomBytes(16).toString("base64")
}

function getCsp(nonce: string): string {
    return [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self'",
        "font-src 'self'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "img-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "worker-src 'none'",
        "upgrade-insecure-requests",
        "trusted-types app",
        "require-trusted-types-for 'script'",
    ].join("; ")
}

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

export default defineNitroPlugin((nitroApp: any) => {
    nitroApp.hooks.hook("request", (event: any) => {
        const reqPath: string = event.path
        if (reqPath in REDIRECTS) {
            throw redirect(REDIRECTS[reqPath], 301)
        }
        event.context ??= {}
        event.context.nonce = generateNonce()
    })

    nitroApp.hooks.hook("response", (event: any) => {
        const reqPath: string = event.path
        const nonce: string | undefined = event.context?.nonce
        if (nonce) {
            event.res.headers.set("Content-Security-Policy", getCsp(nonce))
        }
        if (reqPath.startsWith("/_build/assets/")) {
            event.res.headers.set("Cache-Control", "public, max-age=31536000, immutable")
        } else if (!reqPath.startsWith("/api")) {
            event.res.headers.set("Cache-Control", "public, s-maxage=3600, max-age=0, must-revalidate")
        }
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
            event.res.headers.set(key, value)
        }
    })
})
