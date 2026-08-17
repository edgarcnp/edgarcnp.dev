# edgarcnp.dev

Personal portfolio site — Astro 7 with SolidJS islands, Hono API routes, and Cloudflare Workers deployment.

## Stack

- **Astro 7** (`output: 'server'`) with SolidJS islands via `@astrojs/solid-js`
- **Cross-document View Transitions** (standards-based, no client router) with `@view-transition { navigation: auto; }`
- **Hash-based CSP** via Astro's built-in `security.csp` (no `'unsafe-inline'`, no nonces) + DOMPurify sanitization before client-side `innerHTML`
- **Content Layer** (`src/content.config.ts`, Zod 4, build-time validation) for projects and writing
- **Tailwind CSS 4** via `@tailwindcss/vite`
- Deployed to **Cloudflare Workers** via `@astrojs/cloudflare`

## Project structure

```
astro.config.mjs          # server output, cloudflare, solidJs, sitemap, tailwind, security.csp
wrangler.jsonc            # deploy config (merged into dist/server/wrangler.json at build)
src/
├── middleware.ts         # security headers, redirects, cache headers (CSP lives in config)
├── content.config.ts     # glob loaders + Zod schemas for projects/writing
├── layouts/Layout.astro
├── pages/                # index, contact, 404, 500, projects/*, writings/*
├── components/
│   ├── background/       # GradientShimmer (Solid island) + canvas
│   ├── shared/           # .astro components
│   └── ui/               # static/, icons/ (.astro), widgets/ (Solid, kept)
├── content/              # projects/*.md, writing/*.md
├── data/                 # profile.json, contact.json, capabilities.json
├── lib/                  # types, schemas, guards, errors, math, crypto, trusted-types
└── styles/               # global.css + theme, base, ui, components, shimmer, animations
public/                   # _headers, robots.txt, favicons
```

## Commands

| Command | Action |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start the dev server at `localhost:4321` |
| `bun run build` | Build production output to `./dist/` |
| `bun run preview` | `astro build` + `wrangler dev` (local worker) |
| `bun run deploy` | `astro build` + `wrangler deploy` |
| `bun run typecheck` | `astro check` |
| `bun run lint` | `eslint .` |

## Notes

- The `_$HY` Solid hydration bootstrap hash is pinned in `security.csp.scriptDirective.hashes` (Astro 7.2.2 doesn't auto-hash it). **Recompute it on any `solid-js` upgrade** or the shimmer island will stop hydrating.

## License

This repository contains materials covered by different terms:

- All software source code is licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) for details.
- All non-code content, including documentation, written materials, images, graphics, logos, branding, artwork, and design assets, is **All Rights Reserved**. See [COPYRIGHT](COPYRIGHT) for details.

You may use, copy, modify, and distribute the source code under the terms of the Apache License, Version 2.0. No permission is granted to use, reproduce, modify, or distribute non-code content without explicit written consent from the copyright holder.

*Unless otherwise stated, these terms apply to all content within this repository.*
