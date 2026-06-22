import { defineConfig } from "vite"
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2"
import { solidStart } from "@solidjs/start/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [
        solidStart(),
        tailwindcss(),
        nitro({
            preset: "cloudflare-module",
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/solid-js") || id.includes("node_modules/solid-js/web") || id.includes("node_modules/solid-js/store")) {
                        return "solid-vendor"
                    }
                    if (id.includes("node_modules/@solidjs/router")) {
                        return "router"
                    }
                },
            },
        },
    },
    esbuild: {
        drop: process.env.NODE_ENV === "production" ? ["console"] : [],
    },
})
