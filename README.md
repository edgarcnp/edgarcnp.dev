# edgarcnp.dev

Personal portfolio site — fully static Astro 7, zero client-side framework, deployed to Cloudflare Workers as a static-assets Worker (no adapter, no bindings, no Worker code).

## Stack

- **Astro 7** (`output: "static"`, output to `dist/client`) with the **Content Layer** (`src/content.config.ts`, Zod schemas, build-time validation) for projects, writing, and site data (one collection per JSON file)
- **No client framework**: UI widgets are plain `.astro` components; client behavior is small TypeScript modules in `src/scripts/`; scroll reveals and transitions via **motion.dev**
- **SPA-style navigation** via Astro's `<ClientRouter />` with a **single shared ambient background** (`transition:persist`) and a blinds-style page transition
- **Strict CSP** (`script-src 'self'; style-src 'self'` — zero inline scripts/styles) plus full security header set, all in `public/_headers`
- **Geist Sans / Geist Mono** via `@fontsource` (CSP-safe: the Astro Fonts API emits inline styles, so it is not used)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Bun** for package management, scripts, tests (`bun test`), and all other tooling — Node is not required
- Deployed to **Cloudflare Workers** via plain `wrangler` static assets (`wrangler.jsonc` → `assets.directory: "./dist/client"`)

## Project structure

```
astro.config.mjs          # static output (outDir: ./dist/client), sitemap, tailwind
wrangler.jsonc            # deploy config (static assets, custom domain)
scripts/
└── sync-contributions.ts # GitHub contributions snapshot (bun run contributions:sync)
public/
├── _headers              # CSP + security headers + cache rules + noindex
├── _redirects            # /writings/* -> /writing/* (route renamed, old links keep working)
├── robots.txt
├── favicon.*
└── js/theme-init.js      # blocking pre-paint theme script (must stay a plain file: CSP forbids inline)
src/
├── content.config.ts     # glob loaders (projects, writing) + one collection per JSON file in data/
├── config/site.ts        # site name, default description, nav, footer ticker
├── lib/                  # server-side and pure helpers: content, data, format, navigation, search, commands
├── layouts/Layout.astro  # document shell: BaseHead + SiteHeader + slot + SiteFooter + page scripts
├── pages/                # index, contact, 404, projects/{index,[slug]}, writing/{index,[slug]}
├── components/
│   ├── site/             # page chrome: BaseHead, SiteHeader, SiteFooter, SkipLink, ThemeToggle, MenuButton, CommandPalette
│   ├── content/          # content-bound: ArticleView, ArticleHeader, ProjectCard, CapabilityGrid, ContributionHeatmap
│   └── ui/               # generic primitives: ButtonLink, SectionHeading, Tag, StatusBadge, ErrorPage
├── content/              # projects/*.md, writing/*.md (filename is the URL slug)
├── data/                 # profile.json, contact.json, capabilities.json, contributions.json
├── scripts/              # client behavior: one module per feature + shared helpers (lifecycle, command-search) + scripts/motion/ (effect engine)
└── styles/               # tokens, base, primitives + one stylesheet per JS-driven feature
```

Conventions: components group by domain (`site/`, `content/`, `ui/`); a client script is named after the feature it powers (`theme.ts`, `mobile-menu.ts`, `page-curtains.ts`); component-authored DOM is styled in that component's scoped `<style>`, JS-created DOM in `styles/<feature>.css`.

## Commands

| Command | Action |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start the dev server at `localhost:4321` (background: `astro dev --background`) |
| `bun run build` | Build production output to `./dist/client` |
| `bun run preview` | `bun run build` + `wrangler dev` (local worker serving `dist/client`) |
| `bun run deploy` | `bun run build` + `wrangler deploy` |
| `bun run contributions:sync` | Refresh the homepage heatmap snapshot in `src/data/contributions.json` from GitHub |
| `bun run typecheck` | `astro check` |
| `bun run lint` | `eslint .` |
| `bun run test` | `bun test` (unit tests for `src/lib`) |
| `bunx agent-browser install` | One-off Chrome download for headless UI checks (`bunx agent-browser open <url>`, `screenshot`, `eval`) |

## Notes

- Production output must stay free of inline `<script>`/`<style>` — the CSP in `public/_headers` allows `'self'` only. Keep `vite.build.assetsInlineLimit: 0`, `build.inlineStylesheets: "never"`, and `markdown.syntaxHighlight: false` in `astro.config.mjs`. Notably, Astro's `transition:name` emits a scoped inline `<style>` — don't use it (the ambient background persists via `transition:persist` alone).
- Navigation uses `<ClientRouter />`; bundled scripts run once, so anything per-navigation goes through `src/scripts/lifecycle.ts` (`onPageLoad`, `onBeforeSwap`), while one-time setup lives at module scope. If the router is ever removed, those listeners silently stop firing — remove them together.
- Deployment is adapter-free: `astro build` emits `dist/client` and `wrangler deploy` uploads it as static assets. Do not re-add `@astrojs/cloudflare` — it injects SESSION/IMAGES bindings and a prerender worker config that are pointless (and noisy) for a fully static site.
- The homepage contribution heatmap renders `src/data/contributions.json`, a committed snapshot parsed from GitHub's public contributions page (`src/lib/github-contributions.ts`). There is no runtime fetch and no Worker endpoint: `.github/workflows/deploy.yml` runs `bun run contributions:sync` at build time on its daily schedule, so `astro build` itself stays hermetic. The workflow needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
- `ContributionHeatmap` ports bklit's heatmap API: `weekStartDay`, `fadeWeekends`, `levelStyles` (solid or patterned fills), `separators` (quarter or fixed-interval grouping, with Q1–Q4 labels), `legendVariant` (swatches or gradient), `axisLabelFormat`, `tickFilter`, `animate`, and `tooltip` timings. Because the CSP forbids inline `style` attributes, continuous measurements (gap, radius, opacities, durations, separator colour) are documented CSS custom properties on the component rather than props — discrete choices are props.
- Fonts come from `@fontsource/geist-sans` / `@fontsource/geist-mono` imports in `src/styles/app.css`. Do not switch to the Astro Fonts API — it emits inline `<style>` (CSP violation).
- Content entries are addressed by filename (`entry.id`); there is no `slug` frontmatter field. JSON files in `src/data/` each have their own collection so every query is exactly typed — never reintroduce a union schema over the whole directory.

## License

This repository contains materials covered by different terms:

- All software source code is licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) for details.
- All non-code content, including documentation, written materials, images, graphics, logos, branding, artwork, and design assets, is **All Rights Reserved**. See [COPYRIGHT](COPYRIGHT) for details.

You may use, copy, modify, and distribute the source code under the terms of the Apache License, Version 2.0. No permission is granted to use, reproduce, modify, or distribute non-code content without explicit written consent from the copyright holder.

*Unless otherwise stated, these terms apply to all content within this repository.*
