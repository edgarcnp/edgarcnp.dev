# edgarcnp.dev — Overhaul Record

**Scope**: full rework of `edgarcnp.dev` (was: Astro 7 + SolidJS islands, SSR on a Cloudflare Worker, Hono API routes, hash-based CSP via `security.csp`).

**Result**: fully static site (zero client-side framework, zero inline scripts/styles), deployed to Cloudflare Workers as an **assets-only Worker** (no runtime code, no bindings, no adapter), strict `'self'`-only CSP enforced via `public/_headers`. Navigation is **SPA-style via Astro's `<ClientRouter />`** with a single shared shimmer instance (`transition:persist`).

**Out of scope, by user decision**: API combination (Hono, `src/api/`, `services: API` binding — removed entirely, not ported); a future API is planned separately and is not documented here.

---

## Final architecture

- **Astro 7.2** (`output: "static"`), Content Layer for projects/writing + a `data` collection for profile/contact/capabilities JSON.
- **Zero client framework**: all `ui/widgets/*` ported from SolidJS `.tsx` to plain `.astro` (props-only components); the shimmer background became a native **Web Component** (`<shimmer-background>`); scroll reveals via **motion.dev** (`motion` ^13.1.0, `src/scripts/motion.ts`, `inView()` + `animate()`).
- **MPA → SPA navigation via Astro's `<ClientRouter />`** (from `astro:transitions`, in `Layout.astro`'s head). Chosen over native-only cross-document view transitions to get a **truly shared shimmer instance**: `<shimmer-background transition:persist>` is moved between documents on each swap (one live canvas, wave phase handed off on the element instance so the drift never snaps). `@view-transition { navigation: auto; }` remains in `global.css` (native transitions for direct loads / no-JS fallback). Route-change emphasis + reveal re-scan hook into `astro:page-load` (fires on initial load and every navigation) — bundled modules only execute once. **Not used**: `transition:name` — it emits a scoped inline `<style>`, violating the CSP.
- **Fonts**: Geist Sans + Geist Mono via `@fontsource/geist-sans` / `@fontsource/geist-mono` (400/500/600/700 and 400/500), imported in `src/styles/app.css`; Tailwind `@theme` maps `--font-sans`/`--font-mono` to the Geist faces; site CSS uses `--font-geist-sans`/`--font-geist-mono`.
- **CSP**: `default-src 'self'; script-src 'self'; style-src 'self'; ...` in `public/_headers` (HTTP header, applies to all static routes). This required: `vite.build.assetsInlineLimit: 0` (never inline assets), `build.inlineStylesheets: "never"` (all CSS external), no `security.csp` config, no nonces/hashes, **no inline `data-*`-driven JS**.
- **Markdown**: `markdown.syntaxHighlight: false` (Shiki emits inline `style=""` attributes — incompatible with `style-src 'self'`; also matches the previous `marked` output).
- **Deployment**: plain `wrangler` static-assets Worker. No adapter — `astro build` emits `dist/client` (`outDir`), `wrangler.jsonc` declares `assets.directory: "./dist/client"` plus the custom domain; `wrangler deploy` uploads assets only. The `@astrojs/cloudflare` adapter was removed after the overhaul (it generated a merge of the config, injected bindings, and emitted a prerender worker — all pointless for a fully static site).
- **Headers** (all in `public/_headers`): the CSP block above, COOP/CORP/Permissions-Policy/Referrer-Policy/HSTS/X-Content-Type-Options/X-Frame-Options/X-Permitted-Cross-Domain-Policies, `/_astro/*` → `public, max-age=31536000, immutable`, pages → `public, s-maxage=3600, max-age=0, must-revalidate`, `noindex` on `*.workers.dev` (incl. staging), staging CORS rule.
- **Sitemap**: `@astrojs/sitemap` (prerendered `sitemap-index.xml`).

---

## Decision record

| Topic | Decision | Rationale |
|---|---|---|
| Rendering model | `output: "static"`, assets-only Worker | Site is content-only (4 projects, 1 writing post, static data). Zero runtime code = nothing to protect, no bindings, no session surface. |
| Adapter | **Removed** (`@astrojs/cloudflare` dropped from deps/config) | Static output needs no adapter: `wrangler deploy` serves `dist/client` directly. Removes the adapter's generated config merging, auto-injected SESSION/IMAGES bindings, and the prerender worker. |
| Client framework | **Removed** (SolidJS, `@astrojs/solid-js`, `dompurify`, `zod` deps dropped) | No islands need hydration; a framework for zero interactive surface is pure weight. All `ui/widgets/*` are props-only. |
| Shimmer background | Native Web Component (`shimmer-background.ts`), **persisted across navigations** (`transition:persist`) | One live canvas shared by all pages — the reason ClientRouter is in the stack (a native-only site cannot share an instance). Wave phase survives reconnects via the element instance. |
| Navigation | SPA-style via `<ClientRouter />` | True continuity for the shimmer. Trade-offs accepted: JS-driven navigation (no-JS users get full page loads + native `@view-transition`), and bundled scripts run once — re-init happens on `astro:page-load` (`motion.ts` re-scan, shimmer emphasis). |
| Scroll reveals | motion.dev (`motion` ^13.1.0) | Tiny, bundled client script (`src/scripts/motion.ts`), respects `prefers-reduced-motion`; re-scans `[data-reveal]` on every `astro:page-load` (guarded by a `WeakSet` so already-revealed elements aren't re-animated). |
| Syntax highlighting | Off | Shiki inline styles violate `style-src 'self'`. |
| Fonts | Fontsource CSS imports | Astro's Fonts API (`<Font>`) emits an inline `<style>` — violates CSP. Fallback chosen after testing the API. |
| CSP delivery | `public/_headers` (static header), not `security.csp` | Static output has no on-demand routes to attach headers to; `_headers` is the Worker-assets-native mechanism. |
| Middleware | **Removed** (`src/middleware.ts` deleted) | Static output never runs middleware in production; every header it set is now an `_headers` rule. |
| TypeScript | `^6.0.3` (pinned) | TypeScript 7 is rejected by `astro check` and typescript-eslint as of this writing. |
| Image service | Default Astro image service (build-time) | With the adapter gone there is no runtime image service; `astro:assets` handles images at build time if any are ever added. |
| Sessions | Off by default | Static output has no session mechanism; the earlier `session: false` + adapter option gymnastics existed only to stop the adapter from injecting a SESSION KV binding. |
| JSON data | `data` collection in Content Layer (`src/data/*.json`, `z.union` schema) | Build-time validation + typed `getEntry` access, same as markdown collections. |
| Dates | `z.coerce.date()` on `published`/`updated` | JSON feeds use non-ISO strings ("May 18, 2026") — coerce, then format with `Intl.DateTimeFormat` in `src/lib/content.ts`. |
| Fallback behavior | Unknown slugs → 404 via `getStaticPaths` + 404.astro | Inline not-found fallbacks removed; Astro emits a canonical 404 for undefined paths. |
| Licensing | Unchanged | LICENSE (Apache-2.0) covers code; COPYRIGHT (All Rights Reserved) covers content; README statement verified accurate. |

---

## Implementation notes (ordered)

1. **Deps**: added `motion`, `@fontsource/geist-sans`, `@fontsource/geist-mono`; removed `solid-js`, `@astrojs/solid-js`, `dompurify`, `zod`, `eslint-plugin-solid`; bumped `astro` ^7.2.3, `tailwindcss`/`@tailwindcss/vite` ^4.3.3, `eslint` ^10.8.1, `typescript-eslint` ^8.67.0, `wrangler` 4.124.0; dropped stale `renovate.json` groups (SolidJS, Nitro/h3). `@astrojs/cloudflare` removed at the end — no adapter needed for static output.
2. **Config**: `output: "static"`; `outDir: "./dist/client"`; removed `fonts` config (Fonts API) and its `fontProviders` import; removed `jsxImportSource` from `tsconfig.json`; removed eslint Solid block. (The adapter-specific `session: false` / `imageService` / `imagesBindingName` settings went away with the adapter.)
3. **wrangler.jsonc**: removed SESSION/IMAGES/ASSETS bindings; dropped `nodejs_compat` (no Worker code exists); `assets.directory: "./dist/client"`.
4. **Background**: `GradientShimmer.tsx` → `shimmer-background.ts` (Web Component; Layout mounts it as `<shimmer-background background intro class="shimmer-canvas" transition:persist>`; scripts imported in Layout, bundled to `/_astro/*.js`).
5. **Components**: `ui/widgets/*.tsx` → `.astro` (Checkbox, Dropdown, Input, Link, SearchBar, Toggle, Tooltip); barrel `index.tsx` deleted; `lib/crypto.ts`, `lib/schemas.ts`, `lib/trusted-types.ts` deleted; `lib/types.ts` (NavLink), `lib/errors.ts`, `lib/guards.ts` trimmed to live code.
6. **Content**: `content.config.ts` gains the `data` collection; new `src/lib/content.ts` (getProjects, getWritingPosts, getProjectBySlug, getWritingPostBySlug, formatDate, sortByPublished); index/projects/writings pages rewritten; `[slug].astro` pages use `getStaticPaths` + `Astro.props`.
7. **Layout/pages**: Layout.astro — build-time nav active state, server-rendered hostname, new footer copy ("© 2026 Edgar Christian. Built with Astro — deployed on Cloudflare."), `<ClientRouter />` in head, shimmer + motion scripts; new `ErrorPage.astro` + `ArticleHeader.astro`; 404/500 use them; contact.astro reads `data.contact` via `getEntry`.
8. **SPA hooks**: shimmer emphasis + reveal re-scan listen for `astro:page-load` (fires on initial load and after every ClientRouter navigation). `motion.ts` re-runs its scan per navigation, stopping previous `inView` observers and skipping already-revealed elements (`WeakSet`). Shimmer wave phase is stored on the element instance and restored on reconnect, so the drift continues seamlessly across navigations.
8. **Styles**: `ui.css` deleted (dead selectors); `components.css` pruned (dropped stale `ui-*` references; fixed a dangling `.markdown-body pre {` that broke the build); `animations.css` orphaned keyframes removed; `base.css` cleaned of dead `.button` selectors. Entry is `app.css` (imported by Layout): Tailwind import + fontsource imports + `@theme` Geist variables, then `./global.css` which pulls in `theme.css`, `base.css`, `shimmer.css`, `animations.css`, `components.css`. Tailwind 4 token surface (`--ui-*`, blueprint vars) lives in `theme.css`.
9. **Verification (all green at the end of the work)**:
   - `bun run typecheck` — 0 errors / 0 warnings / 0 hints
   - `bun run lint` — 0 errors
   - `bun run build` — 11 pages, `sitemap-index.xml`, Geist woff2 files emitted to `dist/client/_astro/` (referenced relatively from the external CSS)
   - `bunx wrangler deploy --dry-run` — exit 0, "No bindings found"
   - `wrangler dev` smoke test — CSP + all security headers present on responses, `Cache-Control` correct (pages vs `/_astro/*`), `data-reveal` + `shimmer-background` + `data-astro-transition-persist` present, ClientRouter bundle external, zero inline `<style>`/`<script>`, `@font-face` for Geist Sans/Mono served from `/_astro/` CSS

### Binding mystery (historical — why the adapter is gone)

The `@astrojs/cloudflare` adapter **auto-injects** `kv_namespaces: [{ binding: "SESSION" }]` (when sessions are enabled) and `images: { binding: "IMAGES" }` (for its default `cloudflare-binding` image service) into the generated wrangler config, plus a `dist/server/.prerender/` worker config that produced an invalid `images: { binding: false }` when opted out. Workarounds (`session: false`, `imageService: "compile"`, `imagesBindingName: false`) tamed it — but the whole mechanism is pointless for a static site, so the adapter itself was removed and `wrangler deploy` now serves `dist/client` directly.

---

## File structure (current)

```
astro.config.mjs          # static output, outDir ./dist/client, sitemap, tailwind
wrangler.jsonc            # deploy config: name, compatibility_date, assets ./dist/client, custom_domain
public/
├── _headers              # CSP + security headers + cache rules + noindex (the only header source)
├── robots.txt
└── favicon.*
src/
├── content.config.ts     # projects, writing (glob) + data (JSON) collections, Zod schemas
├── lib/
│   ├── content.ts        # typed collection queries + formatDate/sort helpers
│   ├── types.ts, errors.ts, guards.ts, math.ts
├── components/
│   ├── background/       # canvas, config, draw, intro, shimmer-background (Web Component), speedup, stripe
│   ├── shared/           # ArticleHeader, BlueprintFrame, ErrorPage, Grid4, ProjectCard, SectionHeading, StatusBadge, TechTag
│   └── ui/
│       ├── icons/        # .astro SVG components
│       ├── static/       # Button, CardLink, CopyIcon, LinkAction, Skeleton, Spinner, Text
│       └── widgets/      # Checkbox, Dropdown, Input, Link, SearchBar, Toggle, Tooltip (.astro ports)
├── content/              # projects/*.md, writing/*.md
├── data/                 # profile.json, contact.json, capabilities.json
├── layouts/Layout.astro  # meta, ClientRouter (head), header/footer, shimmer (transition:persist) + motion scripts
├── pages/                # index, contact, 404, 500, projects/{index,[slug]}, writings/{index,[slug]}
├── scripts/motion.ts     # reveal-on-scroll (motion.dev)
└── styles/               # app.css (entry: tailwind + fonts + global.css) + theme, base, components, shimmer, animations
```

---

## Commands

| Command | Action |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Astro dev server (background: `astro dev --background`) |
| `bun run build` | Build to `dist/` |
| `bun run preview` | `bun run build && wrangler dev` (local Worker serving `dist/client`) |
| `bun run deploy` | `bun run build && wrangler deploy` |
| `bun run typecheck` | `astro check` |
| `bun run lint` | `eslint .` |

Deploy is a pure static asset upload ("Total Upload: 0.31 KiB" — no Worker script; all assets served from the assets directory).

---

## Known risks / follow-ups

| Item | Note |
|---|---|
| ClientRouter lifecycle events (`astro:page-load`/`astro:after-swap`) | Used by `motion.ts` + shimmer emphasis. If the router is ever removed, these silently stop firing (they don't error) — remove or rewire them alongside. |
| `transition:name` emits a scoped inline `<style>` | CSP violation — do not add named transitions without an external-CSS `view-transition-name` alternative. |
| Firefox lacks cross-document View Transitions | Moot with ClientRouter (JS polyfill); `@view-transition { navigation: auto; }` remains for direct loads / no-JS. |
| Fonts are `font-src 'self'` only | Any future third-party font CDN requires a CSP update. |
| New API (planned separately) | Will need a Worker (`output: "server"` or a separate Worker) — bindings/CSP decisions documented here apply. |
| `compatibility_date` 2026-06-19 in `wrangler.jsonc` | Bump when bumping Wrangler to keep the Worker current. |
