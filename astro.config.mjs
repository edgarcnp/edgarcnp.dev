import { defineConfig } from "astro/config"
import solidJs from "@astrojs/solid-js"
import cloudflare from "@astrojs/cloudflare"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    site: "https://edgarcnp.dev",
    output: "server",
    adapter: cloudflare(),
    integrations: [solidJs(), sitemap()],
    vite: { plugins: [tailwindcss()] },
    markdown: { syntaxHighlight: false },
    security: {
        csp: {
            algorithm: "SHA-256",
            directives: [
                "default-src 'self'",
                "base-uri 'self'",
                "connect-src 'self'",
                "font-src 'self'",
                "form-action 'none'",
                "frame-ancestors 'none'",
                "img-src 'self'",
                "manifest-src 'self'",
                "object-src 'none'",
                "worker-src 'none'",
                "upgrade-insecure-requests",
            ],
            scriptDirective: { resources: ["'self'"], hashes: ["sha256-VmEf2BGdqVUwcvyhTyarJo/bY7DNqS2+T2sz4IO/kbw="] },
            styleDirective: { resources: ["'self'"] },
        },
    },
})
