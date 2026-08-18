# edgarcnp.dev

Personal portfolio site — fully static Astro 7, zero client-side framework, deployed to Cloudflare Workers as a static-assets Worker (no adapter, no bindings, no Worker code).

## Stack

- **Astro 7** (`output: "static"`, output to `dist/client`) with the **Content Layer** (`src/content.config.ts`, Zod schemas, build-time validation) for projects, writing, and JSON data (`data` collection)
- **No client framework**: SolidJS removed; UI widgets are plain `.astro` components; the shimmer background is a native **Web Component**; scroll reveals via **motion.dev**
- **SPA-style navigation** via Astro's `<ClientRouter />` with a **single shared shimmer instance** (`transition:persist` — one live canvas across all pages; wave drift handed off on the element instance)
- **Strict CSP** (`script-src 'self'; style-src 'self'` — zero inline scripts/styles) plus full security header set, all in `public/_headers`
- **Geist Sans / Geist Mono** via `@fontsource` (CSP-safe: the Astro Fonts API emits inline styles)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- Deployed to **Cloudflare Workers** via plain `wrangler` static assets (`wrangler.jsonc` → `assets.directory: "./dist/client"`)

See [PLAN.md](PLAN.md) for the full overhaul record and decision rationale.

## Project structure

```
astro.config.mjs          # static output (outDir: ./dist/client), sitemap, tailwind
wrangler.jsonc            # deploy config (static assets, custom domain)
public/
├── _headers              # CSP + security headers + cache rules + noindex
├── robots.txt
└── favicon.*
src/
├── content.config.ts     # glob loaders (projects, writing) + data collection (JSON)
├── lib/content.ts        # typed collection queries, date formatting, sorting
├── layouts/Layout.astro
├── pages/                # index, contact, 404, 500, projects/{index,[slug]}, writings/{index,[slug]}
├── components/
│   ├── background/       # shimmer Web Component + canvas engine
│   ├── shared/           # .astro components
│   └── ui/               # icons/, static/, widgets/ (.astro)
├── content/              # projects/*.md, writing/*.md
├── data/                 # profile.json, contact.json, capabilities.json
├── scripts/motion.ts     # reveal-on-scroll (motion.dev)
└── styles/               # app.css (entry) + theme, base, components, shimmer, animations
```

## Commands

| Command | Action |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start the dev server at `localhost:4321` (background: `astro dev --background`) |
| `bun run build` | Build production output to `./dist/` |
| `bun run preview` | `bun run build` + `wrangler dev` (local worker serving `dist/client`) |
| `bun run deploy` | `bun run build` + `wrangler deploy` |
| `bun run typecheck` | `astro check` |
| `bun run lint` | `eslint .` |

## Notes

- Production output must stay free of inline `<script>`/`<style>` — the CSP in `public/_headers` allows `'self'` only. Keep `vite.build.assetsInlineLimit: 0`, `build.inlineStylesheets: "never"`, and `markdown.syntaxHighlight: false` in `astro.config.mjs`. Notably, Astro's `transition:name` emits a scoped inline `<style>` — don't use it (the shimmer persists via `transition:persist` alone).
- Navigation uses `<ClientRouter />`; bundled scripts run once, so anything per-navigation hooks `astro:page-load` (`src/scripts/motion.ts` reveal re-scan, shimmer emphasis). If the router is ever removed, those listeners silently stop firing — remove them together.
- Deployment is adapter-free: `astro build` emits `dist/client` and `wrangler deploy` uploads it as static assets. Do not re-add `@astrojs/cloudflare` — it injects SESSION/IMAGES bindings and a prerender worker config that are pointless (and noisy) for a fully static site (details in PLAN.md).
- Fonts come from `@fontsource/geist-sans` / `@fontsource/geist-mono` imports in `src/styles/app.css`. Do not switch to the Astro Fonts API — it emits inline `<style>` (CSP violation).

## License

This repository contains materials covered by different terms:

- All software source code is licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) for details.
- All non-code content, including documentation, written materials, images, graphics, logos, branding, artwork, and design assets, is **All Rights Reserved**. See [COPYRIGHT](COPYRIGHT) for details.

You may use, copy, modify, and distribute the source code under the terms of the Apache License, Version 2.0. No permission is granted to use, reproduce, modify, or distribute non-code content without explicit written consent from the copyright holder.

*Unless otherwise stated, these terms apply to all content within this repository.*
