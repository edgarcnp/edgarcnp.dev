import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    site: "https://edgarcnp.dev",
    output: "static",
    outDir: "./dist/client",
    integrations: [sitemap()],
    vite: {
        plugins: [tailwindcss()],
        build: { assetsInlineLimit: 0 },
    },
    build: { inlineStylesheets: "never" },
    markdown: { syntaxHighlight: false },
})
