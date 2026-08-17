# Migration Plan: SolidStart → Astro 7 (Path A — revised after Phase 0 spike)

**Goal**: Migrate `edgarcnp.dev` from SolidStart 2.0.0-alpha.3 to Astro 7 + SolidJS islands, using **standards-based cross-document View Transitions** (no `<ClientRouter />`) and Astro's **built-in hash-based `security.csp`** — no `'unsafe-inline'`, no nonces, no HTML rewriting.

**Why Path A**: The Phase 0 spike (recorded below) proved the original plan's core assumptions wrong: Astro SSR emits inline scripts/styles in production HTML, Astro 7.2.2 has **no** first-party nonce support, `require-trusted-types-for 'script'` breaks both ClientRouter's `DOMParser` swap and DOMPurify, and `transition:persist`/`astro:after-swap` are ClientRouter-only (inert in MPA). Path A keeps a strict CSP with zero hacks.

**Source**: `./solidstart/` (read-only reference, untracked; **deleted 2026-08-18**)
**Target**: repo root (Astro 7 scaffold)

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Framework | Astro 7.2.2 (`output: 'server'`) |
| Islands | SolidJS via `@astrojs/solid-js` 7.0.2 |
| Client routing | **None** — MPA. Cross-document View Transitions (`@view-transition { navigation: auto; }`), zero JS for transitions |
| Route-change emphasis | `pagereveal` event listener (replaces `astro:after-swap`, ClientRouter-only) |
| State persistence | No DOM/state carry-over between navigations (client-router feature). Back/forward via bfcache (native); `introPlayed` via `sessionStorage` (≈ once per tab session) |
| CSP | Astro built-in `security.csp` (hash-based, stable since Astro 6). Emits a **header** for on-demand routes, meta element for prerendered |
| Trusted Types | **Dropped** (gate decision): `require-trusted-types-for` + `trusted-types` removed; DOMPurify sanitization kept as defense-in-depth |
| Markdown content | Astro Content Layer (`src/content.config.ts`, glob loader, Zod 4, build-time validation) |
| Markdown highlighting | **Shiki off** (`theme: 'none'`) — Shiki emits inline `style=""` attrs, incompatible with hash CSP; matches old `marked` output |
| API routes | Hono (same worker, `src/pages/api/[...path].ts` catch-all) |
| Sitemap | `@astrojs/sitemap` (prerendered endpoint) |
| Dead code (`ui/widgets/*`, unused `ui/static/*`, `ui/icons/*`, `lib/crypto.ts`) | Port everything, no deletions |
| Page rendering | SSR on Worker (behavior parity); prerendering is a Phase 10 follow-up |
| Adapter output | `dist/server/entry.mjs` + `dist/server/wrangler.json` (`main: entry.mjs`, assets `../client`, `no_bundle`) — **not** `dist/_worker.js/index.js` |
| Deployment | Cloudflare Workers via `@astrojs/cloudflare` 14.2.1 |

---

## Phase 0: Spike — RECORD (gate executed, decisions taken)

Throwaway app in `/tmp/opencode/astro-spike` (astro 7.2.2, @astrojs/solid-js 7.0.2, @astrojs/cloudflare 14.2.1, solid-js 1.9.14, dompurify 3.4.13, wrangler 4.123.0), verified with headless Chromium against the production build served via wrangler. Findings:

1. **Inline scripts are inherent**: production HTML contains inline scripts (island hydration bootstraps, `_$HY` delegation, `astro:load`) and inline `<style>` — the "0 inline scripts" assumption was wrong. Dev mode aside, even bundled small scripts can be inlined.
2. **No first-party nonce support in Astro 7.2.2** (verified in installed package source — zero nonce handling in `dist/core/`). The `data-astro-nonce`/`locals.nonce` story circulating in one blog is not in the package.
3. **Trusted Types enforcement is incompatible**: `require-trusted-types-for 'script'` blocks ClientRouter's `DOMParser.parseFromString` swap **and** DOMPurify's internal parsing. → **Decision: drop Trusted Types enforcement** (the plan's pre-documented fallback). Keep `lib/trusted-types.ts` ported as-is (policy creation is harmless without enforcement; `sanitize()` still DOMPurify-sanitizes) — no deletions per plan policy.
4. **`security.csp` works for MPA**: stable since Astro 6; hash-based; auto-hashes Astro's own inline scripts/styles; emits header on on-demand routes. **Gap**: integration-injected inline scripts (`_$HY` from @astrojs/solid-js) are **not** auto-hashed → Solid islands don't hydrate under `security.csp` out of the box. Fixed by pinning the static `_$HY` hash in `scriptDirective.hashes` (see Phase 1). **Maintenance: recompute on every solid-js upgrade** — no CI check; manual note.
5. **`transition:persist` + `astro:after-swap` are ClientRouter-only** — verified inert in MPA (fresh document per navigation, module state resets). → Chose standards-based cross-document VT: Chrome/Edge 126+, Safari 18.2+, Firefox not shipped (behind flag) — self-gating progressive enhancement, plain navigation otherwise.
6. **Adapter output shape**: `dist/server/entry.mjs` + `dist/server/wrangler.json` (`main: entry.mjs`, assets `../client`) — Phase 7 uses this, not the planned `dist/_worker.js/index.js`.
7. **Shiki incompatibility**: Astro markdown highlighting emits inline `style=""` attributes → blocked by hash CSP (documented Astro warning). → Shiki off.

**Gate verdict: original path (nonce middleware + Trusted Types + ClientRouter) fails as specced; Path A (this plan) adopted after research + re-testing. Decision recorded here as required by the gate.**

---

## Phase 1: Dependencies & Config — EXECUTED (2026-08-17)

- Pinned versions: `@astrojs/cloudflare` 14.2.1, `@astrojs/solid-js` 7.0.2, `@astrojs/sitemap` ^3.7.3, solid-js 1.9.14, dompurify 3.4.13, zod ^4.4.3, hono ^4.12.26, tailwindcss ^4.3.1; dev: @astrojs/check, typescript ^6.0.3, wrangler 4.123.0, eslint 10 + typescript-eslint + eslint-plugin-solid + @stylistic (ported from old project), @tailwindcss/vite.
- Scripts: `dev`/`build`/`preview` (`build && wrangler dev`)/`deploy` (`build && wrangler deploy`)/`typecheck` (`astro check`)/`lint` (`eslint .`).
- `astro.config.mjs`: `output: 'server'`, cloudflare adapter, solidJs + sitemap integrations, `@tailwindcss/vite` plugin, `security.csp` (directives list + `scriptDirective.hashes: ["sha256-VmEf2BGdqVUwcvyhTyarJo/bY7DNqS2+T2sz4IO/kbw="]` — the `_$HY` pin).
- `eslint.config.js` copied from `solidstart/` (byte-identical). `tsconfig.json` keeps `astro/tsconfigs/strict` + adds `~/*` → `./src/*`.
- Scaffold deleted: `Welcome.astro`, `src/assets/`. `index.astro` placeholder restored after smoke test.
- Smoke-verified (served via `wrangler dev --config dist/server/wrangler.json`): CSP header contains **all** inline script hashes incl. `_$HY`, all inline style hashes, every directive, no `unsafe-inline`/nonce/unsafe-eval. Hash stable across builds.

---

## Phase 2: Content & Data (Content Layer)

### 2.1 `src/content.config.ts`
- `glob()` loader for `projects` (base `./src/content/projects`) and `writing` (base `./src/content/writing`)
- Port Zod schemas from `solidstart/src/data/schemas.ts` + `solidstart/src/lib/content/validate.ts` (`import { z } from 'astro/zod'`); build/dev-time validation replaces per-request runtime validation

### 2.2 Content queries
- `getCollection('projects')` / `getEntry('projects', id)` replace `query()` RPC calls
- Article bodies via `render(entry)` (Astro 7 markdown pipeline, Shiki off) — no `gray-matter`/`marked`/`linkedom`
- Keep client-side `lib/trusted-types.ts` (DOMPurify `sanitize()`) before `innerHTML` on article pages

### 2.3 Data files
- `src/data/*.json` (profile, contact, capabilities) stay; validate once at module scope

### 2.4 Delete (from git history only — `solidstart/` holds the reference)
- `src/lib/server-content.ts` (the `"use server"` RPC bridge), `src/lib/content/query.ts` — not ported

---

## Phase 3: Layout & Pages

### 3.1 `src/layouts/Layout.astro`
- `<head>`: native `<title>`/description/canonical (no `@solidjs/meta`, no `lib/meta.tsx`)
- Header/footer, nav active-state via **bundled** script on `DOMContentLoaded`/`pagereveal` (no inline scripts anywhere)
- `<GradientShimmer client:load />` mounted site-wide (no `transition:persist` — inert in MPA)
- **No `<ClientRouter />`**; **no `transition:animate`/`transition:persist` attributes** (they emit un-hashed scope styles)
- Global CSS: `@view-transition { navigation: auto; }` — cross-document transitions, self-gating
- Per-route `view-transition-name` morphing (optional, JIT via `pageswap`/`pagereveal`) — keep minimal first

### 3.2 Routes

| Astro file | SolidStart source | Notes |
|------------|-------------------|-------|
| `src/pages/index.astro` | `src/routes/index.tsx` | Hero, featured projects, capabilities, CTAs |
| `src/pages/contact.astro` | `src/routes/contact.tsx` | Contact cards |
| `src/pages/projects/index.astro` | `src/routes/projects/index.tsx` | Stats + grid |
| `src/pages/projects/[slug].astro` | `src/routes/projects/[slug].tsx` | SSR detail, markdown body |
| `src/pages/writings/index.astro` | `src/routes/writings/index.tsx` | List |
| `src/pages/writings/[slug].astro` | `src/routes/writings/[slug].tsx` | SSR post, markdown body |
| `src/pages/404.astro` + `500.astro` | `src/routes/[...error].tsx` | Port error UI; XSS-guarded path display via `Astro.url` |
| `src/pages/api/[...path].ts` | `src/routes/api/[...].ts` | Hono catch-all (`export const ALL`) |

### 3.3 Components
- `background/*` → port as-is (Solid)
- `shared/*` → `.tsx` → `.astro` (props-only, mechanical): `ProjectCard`, `StatusBadge`, `TechTag`, `SectionHeading`, `Grid4`, `BlueprintFrame`
- `ui/static/*` → `.astro` (all, incl. unused — no deletions)
- `ui/icons/*` → `.astro` SVG components (no deletions)
- `ui/widgets/*` → keep Solid `.tsx`; fix only imports referencing `@solidjs/router`/`@solidjs/meta`
- `lib/crypto.ts` → port as-is; `lib/meta.tsx` deleted; `lib/trusted-types.ts` kept
- Markdown config: `markdown.shikiConfig.theme: 'none'` in `astro.config.mjs`

---

## Phase 4: Shimmer Island (per-page island, no persistence)

### 4.1 Port `GradientShimmer.tsx` + `background/*` unchanged (Solid island, `client:load`, no persist)

### 4.2 Intro semantics (changed from plan v1)
- `introPlayed` moves from a module-level signal to a **`sessionStorage` flag** — survives navigations and reloads within a tab session; resets per tab. **Recorded deviation from v1's "once per hard reload"** (module signals reset on every MPA load; sessionStorage is the closest safe equivalent — no localStorage).
- Read flag on island init; set it when intro completes

### 4.3 Route-change emphasis
- `astro:after-swap` (ClientRouter-only) → **`pagereveal` event** listener: guard `if (!e.viewTransition) return`, then `controller.emphasize()`
- Back/forward: bfcache restores the previous page's canvas + state natively (no code needed)

---

## Phase 5: Middleware & Security

### 5.1 `src/middleware.ts` (NO CSP — `security.csp` in config owns it)
Port `solidstart/server/plugins/security-headers.ts` via `defineMiddleware`, minus the CSP block:
- `/old-path` 301 redirect map
- Security headers (COOP, CORP, Permissions-Policy, Referrer-Policy, HSTS, X-Content-Type-Options, X-DNS-Prefetch-Control, X-Frame-Options, X-Permitted-Cross-Domain-Policies)
- Cache headers: `/_astro/*` assets immutable; non-API pages `public, s-maxage=3600, max-age=0, must-revalidate`

### 5.2 `public/_headers`
- Asset cache paths `/_build/assets/*` → `/_astro/*`; keep `noindex` on `*.workers.dev`

### 5.3 `_$HY` hash maintenance
- Recompute `scriptDirective.hashes` entry on any solid-js upgrade (manual step; no CI check)

---

## Phase 6: API (Hono)

### 6.1 Keep `src/api/*` as-is: `index.ts` (basePath `/api`), `middleware/{cors,csrf,ratelimit}.ts`, `routes/{rss,news,health}.ts`

### 6.2 Mount via `src/pages/api/[...path].ts`
```ts
import app from '~/api';
export const ALL = ({ request }) => app.fetch(request);
```
- `import.meta.env.PROD` guards unchanged; `API` service binding unchanged

---

## Phase 7: Deploy & CI

### 7.1 Wrangler config
- Adapter generates `dist/server/wrangler.json` (`main: entry.mjs`, assets `../client`) at build. **Open item**: reconcile old root `wrangler.jsonc` settings (custom domain route, `API` service binding, `compatibility_flags: ["nodejs_compat"]`, observability) with the adapter-generated config — decide: keep root `wrangler.jsonc` as the deploy source with the adapter output merged, or deploy with `--config dist/server/wrangler.json` + extra settings. Verify with `wrangler deploy --dry-run`.

### 7.2 CI workflows (`.github/workflows/ci.yml` + `.forgejo/workflows/ci.yml`)
- `bun install --frozen-lockfile` → `bun run typecheck` → `bun run lint` → `bun run build`
- Same triggers (push/PR to main + manual)

### 7.3 Docs
- This PLAN.md becomes the migration record (final pass); update README licensing note if needed

---

## Phase 8: Verification

1. `astro check` / `bun run lint` / `bun run build` green
2. `wrangler dev` manual QA (headless browser + console capture):
   - Shimmer intro: once per tab session (sessionStorage); emphasis fires on every navigation (pagereveal); bfcache back/forward restores state
   - **Zero CSP violations on every route** (hash coverage incl. `_$HY`), incl. direct loads, 404/500
   - API endpoints (`/api/health`, `/api/news`, `/api/rss`)
   - 404/500 pages with sanitized path display
   - Meta/canonical/title correct per route; sitemap renders
   - Direct URL loads, asset caching headers, `/old-path` redirects, cross-document VT fires in Chromium
3. Visual diff of article pages (Astro markdown, Shiki off vs `marked`)

---

## Phase 10: Follow-up (post-migration, out of scope)

- Prerender all non-API pages (`export const prerender = true`) → Worker serves API only; prerendered routes emit the CSP as a meta element (better edge-cache story than per-request headers)

---

## File Structure (target)

```
astro.config.mjs             # output: 'server', cloudflare, solidJs, sitemap, tailwind, security.csp (+ _$HY hash)
wrangler.jsonc               # reconcile with adapter-generated dist/server/wrangler.json (Phase 7)
src/
├── middleware.ts            # redirects + security headers + cache headers (NO CSP)
├── content.config.ts        # Content Layer: glob loader + Zod 4 schemas
├── layouts/
│   └── Layout.astro         # meta, header/footer, shimmer island, @view-transition CSS, no ClientRouter
├── pages/
│   ├── index.astro
│   ├── contact.astro
│   ├── 404.astro
│   ├── 500.astro
│   ├── api/[...path].ts     # Hono catch-all
│   ├── projects/{index.astro,[slug].astro}
│   └── writings/{index.astro,[slug].astro}
├── components/
│   ├── background/          # GradientShimmer + canvas (Solid island, unchanged)
│   ├── shared/              # .astro ports
│   └── ui/                  # static/, widgets/, icons/ (all ported, no deletions)
├── api/                     # Hono app (unchanged)
├── content/
│   ├── projects/*.md
│   └── writing/*.md
├── data/                    # profile.json, contact.json, capabilities.json
├── lib/                     # types, schemas, guards, errors, math, crypto, trusted-types
└── styles/                  # global.css (Tailwind import), theme, base, ui, components, shimmer, animations
public/
└── _headers                 # /_astro/* caching, noindex workers.dev
```

---

## Migration Order

1. ~~Phase 0~~ — Spike + decision record (done: Path A)
2. ~~Phase 1~~ — Dependencies & config, `_$HY` pin, smoke build (done)
3. ~~Phase 2~~ — Content Layer & data (done: 4 projects + 1 writing, schemas 1:1 from old `query.ts`)
4. ~~Phase 3~~ — Layout & pages (done: all routes ported, Shiki off via `syntaxHighlight: false`, `tsconfig.jsxImportSource: solid-js` added, `content/sanitize.ts` dropped — it was the server-side marked+linkedom pipeline; client-side DOMPurify retained)
5. ~~Phase 4~~ — Shimmer island (done: sessionStorage key `edgarcnp:shimmer-intro-played` set at intro start; `pagereveal` listener → `controller.emphasize()`; bfcache covers back/forward)
6. ~~Phase 5~~ — Middleware & headers (done: `src/middleware.ts` — redirects, 9 security headers, `/_astro/` + page cache headers; NO CSP; `_headers` + `robots.txt` ported, sitemap URL → `/sitemap-index.xml`)
7. ~~Phase 6~~ — Hono API (done: `src/api/` byte-identical, `src/pages/api/[...path].ts` GET-only mount mirroring old route; **REMOVED by user decision 2026-08-18** — `src/api/`, the mount, `hono` dep, and `services: API` binding deleted; new overhauled API replaces it)
8. ~~Phase 7~~ — Deploy & CI (done: root `wrangler.jsonc` — adapter MERGES it into `dist/server/wrangler.json` (verified); `wrangler deploy --dry-run` exit 0; CI workflows ported byte-identical)
9. **Verify** — `astro check` + lint + build + `wrangler dev` QA (current: all three gates green — build 0 / typecheck 0 / lint 0; Phase 8 Gate 2 item e found `/api/*` 500s — `app.fetch(request)` passes no env → `c.env` undefined → ratelimit TypeError; **MOOT — API removed by user decision**, new API planned)
10. **Phase 10** — Prerender follow-up (later)

Each phase builds on the previous. Verify build after each phase.

---

## Known Risks

| Risk | Mitigation |
|------|------------|
| `_$HY` hash drift on solid-js upgrade → island dead + CSP violation | Recompute + update `scriptDirective.hashes` (manual note in README); visible symptom is the island not hydrating |
| `security.csp` misses other integration-injected inline content in future | Phase 8 full console QA per route; pin versions |
| Firefox lacks cross-document VT | Self-gating `@view-transition` — plain navigation, no breakage |
| Intro semantics changed (once per tab session vs once per hard reload) | Recorded deviation; trivially reversible (localStorage or per-reload flag) |
| Astro 7 markdown rendering differs from `marked` | Visual diff pass (Phase 8); syntaxHighlight off to minimize divergence |
| Error-page pattern differs (search-params is a SolidStart-ism) | 404/500 with `Astro.url` |
| `wrangler.jsonc` vs adapter-generated config conflict | RESOLVED: adapter merges root config (verified empirically); no `main` in root config (adapter-owned); dry-run green |
| Footer copy still says "SolidStart / SolidJS / Cloudflare-ready" | Ported verbatim from old site; needs copy decision |
| `compatibility_date` 2026-06-19 (old value wins) + `nodejs_compat` | Possible runtime differences on workerd; validated via dry-run, runtime QA is Phase 8 |