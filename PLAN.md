# Migration Plan: Astro → SolidStart

**Goal**: Migrate `edgarcnp.dev` from Astro 6 + SolidJS islands to SolidStart, enabling full nonce-based CSP and true SPA navigation.

**Source**: `edgarcnp.dev-astro/`  
**Target**: Root directory (existing SolidStart scaffold)

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Markdown content | `gray-matter` + `marked` (runtime parsing, 5 files) |
| API routes | Hono (same worker, same command) |
| Nonce CSP | After migration working |
| Shimmer emphasis | On every SPA route change via `useLocation()` |
| Shimmer intro | Once per hard reload (module-level `introPlayed` persists across SPA nav) |
| Deployment | Cloudflare Workers via Nitro v2 |

---

## Phase 1: Dependencies & Config

### 1.1 Install dependencies
```bash
pnpm add hono zod gray-matter marked
pnpm add -D @types/marked
```

### 1.2 Update vite.config.ts
- No changes needed (SolidStart + Nitro v2 + Tailwind already configured)

### 1.3 Create wrangler.jsonc
- Port from Astro's `wrangler.jsonc`, update entry point for Nitro

---

## Phase 2: Shared Code (copy as-is)

### 2.1 Data files → `src/data/`
Copy from `edgarcnp.dev-astro/src/data/`:
- `profile.json`
- `contact.json`
- `capabilities.json`
- `schemas.ts` (Zod schemas + `validate()` helper)

### 2.2 Types → `src/lib/types.ts`
Copy from `edgarcnp.dev-astro/src/lib/types.ts`:
- `ProjectStatus`, `ProjectLink`, `ContactKind`, `ActionVariant`, `NavLink`
- `ACTION_CLASSES`, `STATUS_CLASSES`
- Remove Astro-specific imports (none expected)

### 2.3 Content files → `src/content/`
Copy from `edgarcnp.dev-astro/src/content/`:
- `projects/*.md` (4 files)
- `writing/*.md` (1 file)
- YAML frontmatter stays as-is

### 2.4 Styles → `src/styles/`
Copy all CSS files as-is (framework-agnostic):
- `global.css`, `theme.css`, `base.css`, `ui.css`
- `shimmer.css`, `animations.css`, `components.css`

Update `global.css`:
- Remove Tailwind `@import` (already in `app.css`)
- Keep all other imports

Update `app.css`:
- Import `global.css` instead of bare Tailwind import

---

## Phase 3: Content Layer

### 3.1 Create `src/lib/content.ts`
Server-side content loading utility:
```ts
import matter from 'gray-matter';
import { marked } from 'marked';
import { validate } from '~/data/schemas';

// Read .md file, parse frontmatter, render body to HTML
// Cache results in memory for dev (invalidate on change)
```

### 3.2 Content functions
- `getProjects()` — reads all `src/content/projects/*.md`, returns sorted array
- `getProject(slug)` — reads single project by slug
- `getWriting()` — reads all `src/content/writing/*.md`, returns sorted array
- `getWritingPost(slug)` — reads single writing post by slug
- All functions: parse frontmatter → validate with Zod → render body with `marked` → return typed objects

---

## Phase 4: Components (Astro → Solid TSX)

### 4.1 Background (already Solid)
- Copy `src/components/background/` as-is (9 files)
- Update `GradientShimmer.tsx`:
  - Remove `astro:after-swap` listener
  - Add `useLocation()` from `@solidjs/router` to detect route changes
  - Trigger emphasis on `location.pathname` change

### 4.2 Shared components → `src/components/shared/`
Rewrite each `.astro` as `.tsx`:

| Component | Approach |
|-----------|----------|
| `BlueprintFrame` | `<div class="blueprint-frame">` + `classList` + `children` prop |
| `SectionHeading` | Static markup with props |
| `Card-2` (ProjectCard) | Full card with props for title, href, summary, year, status, technologies, pinned |
| `Grid-4` | Maps over `items` array |
| `TechTag` | `<span class="blueprint-chip">` |
| `StatusBadge` | Status with mapped CSS class |

### 4.3 UI components → `src/components/ui/`
- **Icons**: Rewrite 16 SVG icon components as `.tsx` (inline SVG JSX)
- **LinkAction**: Styled `<a>` with variant classes
- **Button, CardLink, Text, Spinner, Skeleton, CopyIcon**: Port from `.astro` to `.tsx`
- **Solid UI components**: Copy `Link.tsx`, `Tooltip.tsx`, `Toggle.tsx`, `SearchBar.tsx`, `Input.tsx`, `Dropdown.tsx`, `Checkbox.tsx` as-is (already Solid)

---

## Phase 5: Layout & Routes

### 5.1 Root layout → `src/app.tsx`
Replace scaffold with:
- `<Router>` with `<FileRoutes />`
- Shimmer background: `<GradientShimmer />` (always mounted, SPA-persistent)
- Sticky nav bar (ported from `Layout.astro`)
- `<Suspense>` wrapper for page content
- `<Meta>` tags for viewport, description, favicon

### 5.2 Routes → `src/routes/`

| Route file | Source | Notes |
|------------|--------|-------|
| `index.tsx` | `pages/index.astro` | Hero, featured projects, capabilities, writing + contact |
| `projects/index.tsx` | `pages/projects/index.astro` | Project grid with stats |
| `projects/[slug].tsx` | `pages/projects/[slug].astro` | SSR project detail, Markdown body |
| `writing/index.tsx` | `pages/writing/index.astro` | Writing list |
| `writing/[slug].tsx` | `pages/writing/[slug].astro` | SSR writing post, Markdown body |
| `contact.tsx` | `pages/contact.astro` | Contact links |
| `[...404].tsx` | `pages/error.astro` | Error page (accept status from query) |

### 5.3 Data loading
- Use `createServerEffect` or `routeData` for SSR content loading
- Validate data with Zod on load
- Redirect to 404 on missing content

---

## Phase 6: API Routes (Hono)

### 6.1 Create `src/api/index.ts`
```ts
import { Hono } from 'hono';

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));
app.get('/news', (c) => c.json({ items: [] }));
app.get('/rss', (c) => c.text('', 200, { 'Content-Type': 'application/rss+xml' }));

export default app;
```

### 6.2 Create `src/routes/api/[...].ts`
SolidStart catch-all API route that delegates to Hono:
```ts
import app from '~/api';

export const GET = ({ request }) => app.fetch(request);
export const POST = ({ request }) => app.fetch(request);
```

---

## Phase 7: Middleware

### 7.1 Create `src/middleware.ts`
Port from Astro middleware:
- Security headers (COOP, CORP, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, X-Frame-Options)
- CSP header (with `'unsafe-inline'` for now — nonces added in Phase 9)
- Redirect map (`/old-path` → `/new-path`)
- Error handling (4xx/5xx → `/error?status=X&path=Y`)

---

## Phase 8: Entry Points

### 8.1 Update `src/entry-server.tsx`
- Full HTML document shell
- Import `app.css`
- Render `<App />` inside `#app`

### 8.2 Update `src/entry-client.tsx`
- Mount `<App />` to `#app`

### 8.3 Delete scaffold files
- `src/components/Counter.tsx`
- `src/components/Nav.tsx`
- `src/routes/about.tsx`

---

## Phase 9: Nonce CSP (after migration works)

### 9.1 Middleware nonce generation
- Generate random nonce per request
- Store in context
- Add to CSP header: `script-src 'self' 'nonce-xxx'`

### 9.2 Layout nonce propagation
- Read nonce from middleware context
- Apply to inline `<script>` tags via `nonce` attribute
- Keep `style-src 'unsafe-inline'` (styles aren't XSS vectors)

### 9.3 Type safety
- Declare `App.Locals` with `nonce: string`
- Type-safe access in middleware and layout

---

## Phase 10: Polish & Deploy

### 10.1 Update CI workflows
- `.github/workflows/checks.yml` — change to `pnpm build`
- `.forgejo/workflows/check.yml` — change to `pnpm build`

### 10.2 Update `cloudflare/_headers`
- Keep cache-control for assets
- Remove any Astro-specific headers

### 10.3 Build verification
- `pnpm build` succeeds
- `pnpm astro check` → `pnpm tsc --noEmit` (SolidStart type checking)
- Manual test: all routes load, shimmer animates, SPA nav works

### 10.4 Clean up
- Remove `edgarcnp.dev-astro/` reference from README
- Update README for SolidStart

---

## File Structure (target)

```
src/
├── app.tsx                    # Root layout (Router + Nav + Shimmer)
├── app.css                    # Tailwind + global CSS imports
├── entry-client.tsx           # Client hydration
├── entry-server.tsx           # SSR HTML shell
├── global.d.ts                # SolidStart types
├── middleware.ts               # Security headers + redirects + errors
├── api/
│   └── index.ts               # Hono app (health, news, rss)
├── lib/
│   ├── types.ts               # Shared TS types
│   └── content.ts             # Markdown loading (gray-matter + marked)
├── data/
│   ├── profile.json
│   ├── contact.json
│   ├── capabilities.json
│   └── schemas.ts             # Zod schemas
├── content/
│   ├── projects/*.md          # 4 project posts
│   └── writing/*.md           # 1 writing post
├── styles/
│   ├── global.css
│   ├── theme.css
│   ├── base.css
│   ├── ui.css
│   ├── shimmer.css
│   ├── animations.css
│   └── components.css
├── components/
│   ├── background/            # Shimmer canvas (9 files, already Solid)
│   ├── shared/                # BlueprintFrame, SectionHeading, Card-2, etc.
│   └── ui/                    # Icons, LinkAction, Button, solid/ components
└── routes/
    ├── index.tsx              # Home
    ├── contact.tsx            # Contact
    ├── [...404].tsx           # Error page
    ├── api/[...].ts           # Hono catch-all
    ├── projects/
    │   ├── index.tsx          # Project list
    │   └── [slug].tsx         # Project detail
    └── writing/
        ├── index.tsx          # Writing list
        └── [slug].tsx         # Writing post
```

---

## Migration Order

1. **Phase 1** — Dependencies & config
2. **Phase 2** — Shared code (data, types, content, styles)
3. **Phase 3** — Content layer (gray-matter + marked)
4. **Phase 4** — Components (background, shared, UI)
5. **Phase 5** — Layout & routes
6. **Phase 6** — API routes (Hono)
7. **Phase 7** — Middleware
8. **Phase 8** — Entry points & cleanup
9. **Verify** — `pnpm build` + manual test
10. **Phase 9** — Nonce CSP
11. **Phase 10** — Polish & deploy

Each phase builds on the previous. Verify build after each phase.
