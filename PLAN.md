# edgarcnp.dev Migration Plan

## Goal
Full rewrite from Dioxus/Rust/WASM CSR app to **Astro + SolidJS + Hono** monolith deployed to Cloudflare Workers.

## Architecture

```
edgarcnp.dev/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home: shimmer bg, hero, featured projects, writing, capabilities, contact
│   │   ├── 404.astro                # Not found
│   │   ├── contact.astro            # Contact endpoints
│   │   ├── projects/
│   │   │   ├── index.astro          # Project grid with stats
│   │   │   └── [slug].astro         # Project detail (SSR, render())
│   │   ├── writing/
│   │   │   ├── index.astro          # Writing list
│   │   │   └── [slug].astro         # Writing post (SSR, render())
│   │   └── api/
│   │       └── [...path].ts         # Hono catch-all (RSS, news stubs)
│   ├── content/
│   │   ├── projects/                # Markdown + YAML frontmatter
│   │   └── writing/
│   ├── content.config.ts            # Astro 6 content layer + Zod schemas
│   ├── data/
│   │   ├── profile.json
│   │   ├── contact.json
│   │   ├── capabilities.json
│   │   └── schemas.ts              # Zod validation for data files
│   ├── components/
│   │   ├── SectionHeading.astro
│   │   ├── StatusBadge.astro
│   │   ├── TechTag.astro
│   │   ├── BlueprintFrame.astro
│   │   ├── LinkAction.astro
│   │   ├── ProjectCard.astro
│   │   ├── CapabilityGrid.astro
│   │   ├── ContactEndpoint.astro
│   │   ├── Shimmer.tsx              # SolidJS canvas shimmer (ported from Svelte)
│   │   └── shimmer.ts               # Pure TS shimmer math (from helium-prism)
│   ├── lib/
│   │   └── types.ts                 # Shared TypeScript types + class maps
│   ├── layouts/
│   │   └── Layout.astro             # Layout with inline nav + shimmer background
│   ├── styles/
│   │   └── global.css               # Tailwind + blueprint CSS + shimmer canvas CSS
│   └── env.d.ts
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   └── header.svg
├── astro.config.mjs
├── tsconfig.json
├── wrangler.toml
└── package.json
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `hono` | API routes (RSS, news) |
| `zod` | Content + data validation |
| `@astrojs/cloudflare` | Cloudflare Workers adapter |

Already installed: `astro`, `@astrojs/solid-js`, `solid-js`, `tailwindcss`, `@tailwindcss/vite`

## Execution Steps

### Phase 1: Configuration
- [x] Install `hono`, `zod`, `@astrojs/check`, `typescript`
- [x] Update `astro.config.mjs` with `@astrojs/cloudflare` adapter + `output: 'server'`
- [x] Create `wrangler.toml`
- [x] Update `src/styles/global.css` with blueprint CSS variables from `tailwind.css`

### Phase 2: Content Collections
- [x] Create `src/content.config.ts` with Zod schemas (projectSchema, writingSchema) — Astro 6 content layer with glob loaders
- [x] Create `src/data/schemas.ts` for data file validation
- [x] Convert TOML data files → JSON (`profile.toml` → `profile.json`, etc.)
- [x] Convert Markdown frontmatter from TOML to YAML

### Phase 3: Components
- [x] `SectionHeading.astro` — label + title + description
- [x] `StatusBadge.astro` — colored status indicator (uses shared types)
- [x] `TechTag.astro` — technology pill
- [x] `BlueprintFrame.astro` — card wrapper
- [x] `LinkAction.astro` — styled link/button (uses shared ACTION_CLASSES)
- [x] `ProjectCard.astro` — project card with status badge, tech tags (uses shared types)
- [x] `CapabilityGrid.astro` — capability cards
- [x] `ContactEndpoint.astro` — contact link card
- [x] `Shimmer.tsx` — SolidJS canvas shimmer (ported from Svelte)
- [x] `shimmer.ts` — Pure TS shimmer math (copied from helium-prism)

### Phase 4: Pages
- [x] `index.astro` — home (shimmer background, hero, featured projects, capabilities, writing, contact)
- [x] `projects/index.astro` — project grid with stats
- [x] `projects/[slug].astro` — project detail (SSR with `render()`)
- [x] `writing/index.astro` — writing list
- [x] `writing/[slug].astro` — writing post (SSR with `render()`)
- [x] `contact.astro` — contact endpoints
- [x] `404.astro` — not found

### Phase 5: API + Deploy
- [x] `src/pages/api/[...path].ts` — Hono catch-all with RSS/news stubs
- [x] Build passes (`pnpm build`)

## Status: ✅ Migration Complete

## Migration Mapping

| Dioxus | Astro | Notes |
|--------|-------|-------|
| `src/views/home.rs` | `src/pages/index.astro` | Port RSX → Astro template |
| `src/views/projects.rs` | `src/pages/projects/index.astro` | Port |
| `src/views/project_detail.rs` | `src/pages/projects/[slug].astro` | Port + `getStaticPaths()` |
| `src/views/writing.rs` | `src/pages/writing/index.astro` | Port |
| `src/views/writing.rs` (WritingPost) | `src/pages/writing/[slug].astro` | Port + `getStaticPaths()` |
| `src/views/contact.rs` | `src/pages/contact.astro` | Port |
| `src/views/not_found.rs` | `src/pages/404.astro` | Port |
| `src/components/navbar/` | `src/components/Navbar.astro` | Port RSX → Astro template |
| `src/components/footer/` | `src/components/Footer.astro` | Port |
| `src/components/shared/project_card.rs` | `src/components/ProjectCard.astro` | Port |
| `src/components/shared/section_heading.rs` | `src/components/SectionHeading.astro` | Port |
| `src/components/shared/status_badge.rs` | `src/components/StatusBadge.astro` | Port |
| `src/components/shared/tech_tag.rs` | `src/components/TechTag.astro` | Port |
| `src/components/shared/capability_grid.rs` | `src/components/CapabilityGrid.astro` | Port |
| `src/components/shared/contact_endpoint.rs` | `src/components/ContactEndpoint.astro` | Port |
| `src/components/shared/blueprint_frame.rs` | `src/components/BlueprintFrame.astro` | Port |
| `src/components/shared/action_link.rs` | `src/components/LinkAction.astro` | Port |
| `src/components/ui/gradient_shimmer/` | `src/components/Shimmer.tsx` + `shimmer.ts` | Port Svelte → Solid |
| `src/data/types.rs` | `src/content/config.ts` + `src/data/schemas.ts` | Zod schemas |
| `content/*.toml` | `src/data/*.json` | TOML → JSON |
| `content/projects/*.md` | `src/content/projects/*.md` | TOML frontmatter → YAML |
| `content/writing/*.md` | `src/content/writing/*.md` | TOML frontmatter → YAML |
| `tailwind.css` | `src/styles/global.css` | Port CSS variables |

## Key Decisions
- **Pure TS shimmer math**: `gradient-shimmer.ts` copied as-is (no Svelte deps)
- **SolidJS for canvas island**: `Shimmer.tsx` uses `onMount`/`onCleanup` for lifecycle
- **Hono catch-all**: Single `api/[...path].ts` handles all API routes
- **Zod everywhere**: Content collections, data file validation, API responses
- **CSS variables preserved**: Blueprint theme stays identical to Dioxus version
