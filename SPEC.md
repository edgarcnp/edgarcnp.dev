# Dioxus SSR Fullstack Portfolio Specification

## Goal

Build a secure, progressive, responsive portfolio website using Dioxus Fullstack with server-side rendering as the primary delivery path. The site should present professional identity, selected work, technical writing or notes, contact options, and basic operational metadata while keeping dark mode as the only supported visual theme.

Security is the top priority. Every feature that reads data, serves assets, handles contact forms, exposes APIs, or renders user-controlled content must be designed defensively first, then optimized for presentation and convenience.

## Core Principles

- Default to SSR for fast first paint, crawlability, and graceful behavior when JavaScript fails.
- Enhance progressively without assuming hydration is available on Cloudflare Workers.
- Keep all sensitive configuration and server-only logic outside client bundles.
- Treat all external input, content files, headers, query params, form submissions, and API responses as untrusted.
- Use a single dark theme. Do not add light-mode toggles, automatic theme switching, or user theme preferences.
- Maintain responsive layouts across three primary breakpoints: mobile, tablet, and desktop.
- Prefer simple, auditable data flows over dynamic behavior that increases attack surface.

## Recommended Stack

- Rust stable toolchain.
- Dioxus Fullstack/SSR patterns compatible with the selected Dioxus release.
- Dioxus Router for route organization.
- Cloudflare Workers as the production runtime.
- Wrangler for local Worker preview and production deploys.
- Worker-compatible Rust/WASM build output.
- Cloudflare's official Worker APIs for request handling, bindings, secrets, and deployment configuration.
- Static asset serving through Cloudflare with explicit cache and content-type handling.
- Markdown or structured content files for portfolio/project data, parsed at build time or server startup.
- Cloudflare D1, KV, R2, or Queues only if persistent storage or async processing becomes necessary.
- No traditional always-on server process, local filesystem writes, or non-Worker-compatible runtime assumptions.
- Do not add a third-party Cloudflare/Dioxus bridge crate unless explicitly approved later.

## Wrangler Configuration Reference

Use `jongiddy/cf-dioxus` only as a reference for Wrangler and Cloudflare deployment configuration shape:

- Repository: `https://github.com/jongiddy/cf-dioxus`
- Target branch/reference: `dioxus-0.7`
- Review its `wrangler.toml`, package scripts, build output paths, asset configuration, compatibility settings, and local preview commands.
- Do not copy its architecture wholesale.
- Do not introduce its helper crates or any other third-party Cloudflare/Dioxus bridge solely because the reference uses them.
- The production integration must target Cloudflare's official Worker runtime, bindings, and deployment APIs through Wrangler.

Important Worker constraints to plan around:

- Keep the Dioxus application reusable as a library, with deployment-specific Worker code isolated from UI and content modules.
- Use release builds for Cloudflare deployment because debug Dioxus builds can exceed Cloudflare file-size limits.
- Do not assume Dioxus hydration, incremental generation, or static site generation are available on Cloudflare Workers.
- Validate that any server-side Dioxus behavior compiles to the Worker runtime without unsupported native, filesystem, or process APIs.

## Application Structure

Use a structure close to this unless Dioxus project generation produces a clearly better local convention:

```text
/
  Cargo.toml
  Dioxus.toml
  package.json
  package-lock.json
  wrangler.toml
  assets/
    images/
    fonts/
    icons/
  content/
    profile.toml
    projects/
    writing/
  src/
    main.rs
    lib.rs
    app.rs
    routes/
      home.rs
      projects.rs
      project_detail.rs
      writing.rs
      contact.rs
      not_found.rs
    components/
      layout.rs
      nav.rs
      footer.rs
      project_card.rs
      metadata.rs
    server/
      config.rs
      content.rs
      contact.rs
      security.rs
    styles/
      app.css
  worker/
    Cargo.toml
    src/
      lib.rs
  tests/
```

Server-only code must stay behind server feature gates or in modules that are never compiled into the client target.

The exact Worker layout should be chosen during implementation based on the official Cloudflare Worker APIs and current Dioxus build output. The main requirement is a clean boundary between reusable portfolio UI/content code and Worker-specific request handling, bindings, headers, and deployment config.

## Pages

### Home

- Introduce the portfolio owner with name, role, short positioning statement, and primary navigation.
- Show featured projects with concise summaries and links to detail pages.
- Include a compact skills or capabilities section.
- Include a direct path to contact.

### Projects Index

- List projects with title, short description, role, technologies, status, and year.
- Support responsive filtering only if it can be implemented without exposing unsafe query behavior.
- Render useful content without JavaScript.

### Project Detail

- Show project case study content from trusted local content files.
- Include problem, approach, technical details, outcomes, links, and screenshots if available.
- External links must use safe attributes and clear labels.

### Writing or Notes

- Optional but planned. Use local content files only.
- Render sanitized or compile-time trusted Markdown.
- Avoid arbitrary embedded HTML unless the sanitizer and content policy are explicit.

### Contact

- Prefer static contact methods such as email links and verified social links.
- If a contact form is added, it must be Worker-handled with CSRF protection, rate limiting, validation, spam controls, and no client-side-only trust.

### Not Found

- SSR-rendered 404 page with navigation back to main sections.
- Do not leak internal routing, filesystem, or server details.

## Responsive Design Requirements

Use three major breakpoints:

- Mobile: `0px - 639px`
- Tablet: `640px - 1023px`
- Desktop: `1024px+`

### Mobile

- Single-column layout.
- Navigation collapses into an accessible menu.
- Touch targets at least `44px` high or wide.
- Project cards stack vertically.
- Avoid hover-only interactions.

### Tablet

- Two-column opportunities for project cards and content summaries.
- Navigation may remain expanded if space allows.
- Maintain readable line lengths and comfortable spacing.

### Desktop

- Constrained content width for text-heavy pages.
- Multi-column project grids where useful.
- Persistent top navigation.
- Avoid oversized marketing-style sections; portfolio content should remain direct and scannable.

## Visual System

Dark mode is the default and only theme.

### Color Direction

- Background: near-black neutral, not pure black.
- Surface: slightly elevated neutral panels.
- Text: high-contrast off-white for primary copy.
- Muted text: accessible gray with sufficient contrast.
- Accent: one restrained accent color for links, focus rings, and selected states.
- Error and success colors must meet contrast requirements against dark backgrounds.

### Typography

- Use system fonts by default unless a local self-hosted font is chosen.
- Avoid remote font providers.
- Keep body text readable at mobile widths.
- Do not scale font sizes directly from viewport width.

### Accessibility

- All interactive elements must be keyboard reachable.
- Visible focus styles are required.
- Use semantic landmarks: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Respect reduced-motion preferences.
- Images need meaningful `alt` text or empty alt text when decorative.
- Color cannot be the only signal for state.

## Responsive Loading Skeletons

Plan first-class loading skeleton UI for data that may be delayed during Worker round trips, form submission, image loading, or future API-backed sections. Skeletons should match the final layout closely enough that loading does not cause visible layout jumps.

Skeletons are progressive enhancement only. Initial SSR responses should prefer real content whenever available. Do not replace server-rendered content with skeletons during any optional client startup.

### Skeleton Principles

- Keep skeleton dimensions stable across loading and loaded states.
- Use neutral dark surfaces with subtle contrast against the page background.
- Avoid bright shimmer effects that dominate the dark UI.
- Respect `prefers-reduced-motion`; disable shimmer or pulse animation when reduced motion is requested.
- Mark skeleton regions with appropriate loading semantics when useful, such as `aria-busy="true"`.
- Do not expose skeleton-only text to screen readers.
- Never use loading skeletons to hide authorization or validation errors.

### Responsive Skeleton Layouts

Skeletons must follow the same three breakpoints as the real UI.

Mobile:

- Stack skeleton blocks in one column.
- Use full-width project-card placeholders.
- Keep avatar, heading, paragraph, and action placeholders compact.

Tablet:

- Use two-column project-card skeletons where the final layout uses two columns.
- Preserve the same content width and gutters as the loaded layout.

Desktop:

- Use multi-column grid skeletons for project indexes.
- Preserve final card aspect ratios and media placeholder sizes.
- Keep text skeleton widths varied to suggest hierarchy without changing container dimensions.

### Skeleton Components

Create reusable skeleton components:

- `SkeletonBlock` for generic rectangular placeholders.
- `SkeletonText` for one or more text-line placeholders.
- `ProjectCardSkeleton` matching loaded project cards.
- `ProjectGridSkeleton` matching the project index grid at each breakpoint.
- `ArticleSkeleton` for writing or project-detail pages.
- `ContactFormSkeleton` only if the secured contact form is implemented.

Skeleton components should live near shared UI components, likely under `src/components/skeleton.rs` or a `src/components/skeleton/` module.

### Loading Scenarios

Use skeletons for:

- Client-side route transitions when data is not immediately available.
- Deferred project or writing lists if future data loading becomes async.
- Images while local responsive images decode, if dimensions are known.
- Contact form submission state only when it communicates temporary pending work without hiding validation results.

Avoid skeletons for:

- Static SSR content that is already available at render time.
- Security failures, 404 pages, validation errors, or empty states.
- Navigation chrome unless the entire shell is genuinely unavailable.

## Progressive Enhancement

The site must work as useful HTML without hydration.

Because Cloudflare Worker deployment through the selected Dioxus reference may not support hydration, the first release must treat hydration as optional and unavailable by default. Interactive behavior should be implemented with plain links, CSS, SSR round trips, or small Worker-safe client scripts only when the security review allows them.

Required baseline behavior without JavaScript:

- Main navigation works.
- Home, project list, project detail, writing, and contact pages render.
- External links work.
- Contact fallback is available.

Enhanced behavior may include:

- Animated navigation states.
- Client-side route transitions.
- Project filtering.
- Copy-to-clipboard actions.
- Form submission status updates.
- Responsive loading skeletons for delayed client-side states.

Any enhanced behavior must have an SSR-safe fallback.

If hydration is not available, skeletons should be limited to CSS-based image placeholders, pending form states, or future client scripts that do not require exposing sensitive data.

## Security Requirements

### Data Handling

- Treat all content files as data, not executable code.
- Validate content schema at startup or build time.
- Fail closed if required content fields are missing or malformed.
- Escape rendered text by default.
- Sanitize Markdown output if Markdown supports inline HTML.
- Do not render untrusted raw HTML.

### API and Server Functions

- Expose only the minimal server functions needed.
- Validate and constrain all server function inputs.
- Never trust client-side validation.
- Use explicit error types and return generic user-facing errors.
- Do not expose stack traces, internal paths, environment variables, tokens, or database errors.
- Apply rate limiting to mutating endpoints, especially contact form submission.
- Require CSRF protection for form posts or server functions that mutate state or send messages.
- Use Cloudflare bindings for secrets and services rather than embedding credentials in the bundle.
- Treat Worker environment bindings as privileged server-side inputs and validate their presence during startup or first request.
- Avoid APIs that require unsupported Node.js, native filesystem, or long-running process behavior.

### Secrets

- Store secrets only in environment variables or deployment secret storage.
- Never include secrets in `Dioxus.toml`, static assets, client config, content files, logs, or generated HTML.
- Keep server-only config behind server compilation boundaries.
- Validate required secrets at startup.

### Headers

Configure secure HTTP headers:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Strict-Transport-Security` in production behind HTTPS

The CSP should be restrictive by default:

- No inline scripts unless the selected Dioxus/Worker rendering path requires a nonce or hash.
- No remote script sources.
- Images limited to self and explicitly approved sources.
- Styles limited to self, with nonce or hash if inline styles are unavoidable.

### Links and Assets

- External links that open new tabs must use `rel="noopener noreferrer"`.
- Do not use third-party scripts for analytics by default.
- Serve local assets with correct content types.
- Disallow path traversal in any dynamic asset or content lookup.
- Set reasonable cache headers for immutable hashed assets.

### Contact Form Security

If implemented, the contact form must include:

- Server-side validation for name, email, message length, and allowed characters where appropriate.
- CSRF token validation.
- Rate limiting by IP and optionally by email hash.
- Honeypot field or equivalent spam friction.
- No reflected user input in error messages unless safely escaped.
- Message delivery through a server-side provider using secrets that never reach the client.
- Audit-conscious logging that avoids storing full message contents unless explicitly required.

## Content Model

Use structured content for predictable rendering.

### Profile

```toml
name = "Portfolio Owner"
role = "Software Engineer"
location = "Optional"
summary = "Short professional summary."
email = "hello@example.com"

[[links]]
label = "GitHub"
url = "https://github.com/example"
```

### Project

```toml
title = "Project Name"
slug = "project-name"
year = 2026
status = "Shipped"
summary = "One sentence summary."
role = "Lead developer"
technologies = ["Rust", "Dioxus"]
repository_url = "https://github.com/example/project"
live_url = "https://example.com"
featured = true
```

Rules:

- Slugs must be unique and URL-safe.
- URLs must be parsed and allowlisted by scheme, usually `https`.
- Project content must not contain executable HTML or scripts.
- Missing optional links should not render empty controls.

## Routing

Planned routes:

- `/`
- `/projects`
- `/projects/:slug`
- `/writing`
- `/writing/:slug`
- `/contact`
- fallback `404`

Route params must be validated before lookup. Invalid slugs should return 404, not a generic server error.

## Build and Deployment

### Local Development

Expected commands after project creation:

```powershell
npm ci
dx serve
npx wrangler dev
cargo test
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
```

`dx serve` is useful for Dioxus development, but `npx wrangler dev` is required before production readiness is claimed because the final runtime is Cloudflare Workers.

### Production

- Build optimized release artifacts for Cloudflare Workers.
- Deploy with Wrangler using the project's own Worker configuration.
- Serve only necessary static assets through Cloudflare.
- Run only behind HTTPS.
- Set production secrets and bindings through Cloudflare, not source-controlled files.
- Disable debug logs and detailed error pages.
- Ensure deployment logs do not contain secrets or submitted contact message bodies.
- Confirm generated Worker bundle and assets stay within Cloudflare limits.
- Confirm route handling works from the deployed Worker, not only from local `dx serve`.

### Cloudflare Configuration

Planned Cloudflare files and settings:

- `wrangler.toml` for Worker name, compatibility date, asset directory, routes, and bindings.
- Cloudflare dashboard or Wrangler secrets for private configuration.
- Optional D1 binding if persistent contact metadata or analytics are later approved.
- Optional KV binding only for low-sensitivity cacheable data.
- Optional R2 binding only for larger static media that should not live in the Worker bundle.

Avoid Cloudflare storage for secrets unless it is a dedicated secret binding. Public content should remain static and versioned where possible.

## Testing Plan

### Unit Tests

- Content schema parsing.
- Slug validation.
- URL validation.
- Contact form validation.
- Security header generation.

### Integration Tests

- SSR renders major routes.
- Unknown project slug returns 404.
- Contact form rejects invalid input.
- Protected mutating requests reject missing or invalid CSRF tokens.
- Worker preview serves major routes through `wrangler dev`.
- Worker API or server-function endpoints reject malformed requests in the Cloudflare runtime.

### Accessibility Checks

- Keyboard navigation.
- Focus visibility.
- Landmark structure.
- Color contrast in dark theme.

### Responsive Checks

Verify at:

- `375px` mobile width.
- `768px` tablet width.
- `1280px` desktop width.

Each viewport should confirm:

- No horizontal overflow.
- Navigation remains usable.
- Text is readable.
- Cards and page sections do not overlap.
- Primary actions remain visible and reachable.

## Implementation Phases

### Phase 1: Foundation

- Generate the Dioxus app and Cloudflare Worker deployment config, using `cf-dioxus` only as a Wrangler configuration reference.
- Establish route structure.
- Add dark-only global CSS.
- Add base layout, navigation, metadata, and 404 page.
- Add Worker-level security header handling.

### Phase 2: Content System

- Define profile, project, and writing content schemas.
- Load and validate local content.
- Render home, project index, and project detail pages from structured content.
- Add tests for schema and route lookups.

### Phase 3: Responsive UI

- Implement mobile, tablet, and desktop layouts.
- Add accessible navigation behavior.
- Add reusable responsive skeleton components for delayed states.
- Verify breakpoints manually and with browser checks.
- Tune typography, spacing, and focus states.

### Phase 4: Contact

- Start with static contact links.
- Add a secure Worker-handled contact form only if needed.
- Implement validation, CSRF, rate limiting, spam controls, and generic errors.
- Add integration tests for accepted and rejected submissions.

### Phase 5: Hardening

- Finalize CSP and security headers.
- Audit server/client feature boundaries.
- Audit Cloudflare bindings, Wrangler config, and Worker bundle contents.
- Run tests, formatting, and clippy.
- Check rendered HTML for leaked config or secrets.
- Review deployment configuration.

## Acceptance Criteria

- The site is implemented as a Dioxus Fullstack SSR application.
- The production target is Cloudflare Workers using Wrangler and Cloudflare's official Worker APIs.
- Dark mode is the only available theme.
- Mobile, tablet, and desktop layouts are intentionally designed and tested.
- Major pages render useful content without JavaScript.
- Loading skeletons are responsive, accessible, motion-safe, and do not replace available SSR content.
- Content is loaded through validated structured data.
- Server-only logic and secrets are not included in client bundles.
- Secure headers are configured for production.
- User input is validated server-side.
- Mutating actions are protected against CSRF and abuse.
- Error messages do not leak internal details.
- `wrangler dev` and production Worker deployment paths are verified.
- Tests cover content validation, route behavior, and security-sensitive paths.

## Open Decisions

- Whether writing/blog content is required for the first release or should remain planned only.
- Whether contact should remain static or include a secured form.
- Whether the first release needs Worker API endpoints at all, or can remain SSR/static with static contact links.
- Whether project screenshots will be local static assets or externally hosted images.
- Whether analytics are required; default is no analytics.
- Whether any Cloudflare bindings are needed for the first release; default is no persistent storage.
