# Living Responsive Blueprint Redesign Plan

## 0. Project Decision

- [x] Direction name: Living Responsive Blueprint.
- [x] Primary goal: redesign the portfolio so responsiveness, layout stability, and frontend judgment are visible in the interface itself.
- [x] Design thesis: the site behaves like a living blueprint of a well-built web system. Layout frames, breakpoint-aware modules, measured spacing, SVG drafting lines, and restrained motion make the portfolio feel distinctive without becoming a forced interactive experience.
- [x] Experience goal: visitors should immediately understand who Edgar is, what kind of systems he builds, and where to inspect projects, writing, or contact links.
- [x] Engineering goal: keep the implementation fast, auditable, Dioxus 0.7-compatible, SSR-friendly, responsive, accessible, and Cloudflare Worker-safe.
- [x] Motion goal: use SVG and CSS motion for orientation and polish, not entertainment. Avoid custom JavaScript at all costs.
- [x] Content goal: turn existing security, validation, Cloudflare, Dioxus, skeleton, and responsive-system work into a coherent portfolio story.

## 1. Non-Goals

- [x] Do not introduce a light theme or theme toggle.
- [x] Do not add a contact form.
- [x] Do not add visitor tracking, analytics, or message collection.
- [x] Do not depend on remote font providers.
- [x] Do not implement scroll hijacking.
- [x] Do not write custom JavaScript for animation, layout, routing, resize handling, breakpoint detection, or interaction behavior.
- [x] Do not introduce browser-side JavaScript dependencies for the redesign unless the user explicitly approves a specific exception.
- [x] Large animation frameworks are allowed in principle if they are explicitly approved, work cleanly with Dioxus, respect `prefers-reduced-motion`, keep content usable without motion, and do not require custom JavaScript glue code.
- [x] Do not add JavaScript files, inline scripts, or `Dioxus.toml` script entries for the redesign.
- [x] Do not require WebGPU, canvas, or 3D rendering for the main experience.
- [x] Do not make the homepage a generic marketing landing page.
- [x] Do not hide content behind a puzzle, command palette, game, or forced exploration flow.
- [x] Do not hand-edit `assets/tailwind.css`; edit `tailwind.css` and let Dioxus/Tailwind generate the browser stylesheet.
- [x] Do not use removed Dioxus APIs such as `cx`, `Scope`, or `use_state`.

## 2. Current Baseline

### 2.1 Framework

- [x] Confirm app remains Dioxus `0.7`.
- [x] Keep `dioxus::launch(App)` in `src/main.rs`.
- [x] Keep Dioxus Router with the existing `Route` enum.
- [x] Keep Dioxus Fullstack-compatible dependency setup.
- [x] Keep component props owned and `Clone + PartialEq` where needed.

### 2.2 Styling

- [x] Keep Tailwind v4 source in root `tailwind.css`.
- [x] Keep generated CSS linked through `asset!("/assets/tailwind.css")`.
- [x] Use utility classes for most layout and styling.
- [x] Add custom CSS only for reusable blueprint primitives, SVG animation, markdown styling, and reduced-motion handling.
- [x] Maintain dark-only visual system.

### 2.3 Routing

- [x] Preserve current route list:
  - [x] `/`
  - [x] `/projects`
  - [x] `/projects/:slug`
  - [x] `/writing`
  - [x] `/writing/:slug`
  - [x] `/contact`
  - [x] catch-all 404
- [x] Preserve `PortfolioLayout` as the shared route layout.
- [x] Add active-route visual treatment if possible with Dioxus Router APIs.
- [x] Ensure route changes still work without custom client-side animation requirements.

### 2.4 Data And Content

- [x] Preserve the `src/data` module as the typed content boundary.
- [x] Keep local TOML project content.
- [x] Keep local Markdown writing content.
- [x] Keep raw HTML escaping behavior for Markdown rendering.
- [x] Keep static contact links only.
- [x] Consider extending content structs only if the blueprint design needs richer project detail.
- [x] Avoid introducing runtime filesystem assumptions that would not hold on Cloudflare Workers.

### 2.5 Existing UI Pattern

- [x] Current app baseline audited: simple dark cards, emerald accent, sticky nav, route-level pages, project cards, writing cards, contact cards, and skeleton previews.
- [x] Reuse useful pieces where possible:
  - [x] `ProjectCard`
  - [x] `Footer`
  - [x] skeleton components retained for future delayed states
  - [x] markdown body styles
- [x] Replace placeholder language and visible skeleton preview details during redesign.

## 3. Brand And Product Positioning

### 3.1 Core Message

- [x] Homepage message should communicate:
  - [x] Edgar Christian
  - [x] Software Engineer
  - [x] Secure, pragmatic web systems
  - [x] Rust, Dioxus, Cloudflare
  - [x] Frontend engineering with attention to responsive UX and system safety
- [x] Avoid vague claims such as "crafting digital experiences."
- [x] Prefer concrete statements:
  - [x] "Building secure, responsive web systems with Rust, Dioxus, and Cloudflare."
  - [x] "Interfaces that stay fast, inspectable, and stable across breakpoints."
  - [x] "Security-first content, static contact, and edge-ready deployment."

### 3.2 Visitor Priorities

- [x] First-time visitor should be able to answer within 10 seconds:
  - [x] Who is this?
  - [x] What does he build?
  - [x] Where are the projects?
  - [x] Is there writing?
  - [x] How do I contact him?
- [x] Technical visitor should quickly see:
  - [x] Dioxus 0.7
  - [x] Rust
  - [x] Cloudflare Workers
  - [x] static content validation
  - [x] reduced-motion and responsive care
- [x] Non-technical visitor should still understand:
  - [x] secure websites
  - [x] fast interfaces
  - [x] reliable systems
  - [x] clear communication

## 4. Visual System

### 4.1 Theme

- [x] Keep dark-only.
- [x] Avoid pure black for the main background.
- [x] Use a graphite/ink base rather than current plain zinc-only look.
- [x] Keep high-contrast text.
- [x] Keep muted text accessible on dark backgrounds.
- [x] Use accent colors sparingly and intentionally.

### 4.2 Color Direction

- [x] Define semantic CSS variables in `tailwind.css` for:
  - [x] `--blueprint-bg`
  - [x] `--blueprint-panel`
  - [x] `--blueprint-panel-strong`
  - [x] `--blueprint-line`
  - [x] `--blueprint-line-muted`
  - [x] `--blueprint-text`
  - [x] `--blueprint-muted`
  - [x] `--blueprint-accent`
  - [x] `--blueprint-accent-2`
  - [x] `--blueprint-warning`
  - [x] `--blueprint-success`
- [x] Candidate palette:
  - [x] Background: deep graphite, near `#080a0d` or `#090b10`.
  - [x] Panel: `#0f1319`.
  - [x] Strong panel: `#151b23`.
  - [x] Primary text: soft white, near `#f4f7fb`.
  - [x] Secondary text: cool gray, near `#a7b0bd`.
  - [x] Blueprint line: muted cyan, near `#4fbfd4`.
  - [x] Accent: cyan or aqua for structural lines.
  - [x] Secondary accent: amber for active breakpoint/status.
  - [x] Success: muted green, not neon.
- [x] Do not let the UI become one-note cyan.
- [x] Use amber, gray, and white to prevent a monochrome blue theme.
- [x] Run a visual scan after implementation to make sure the palette is not dominated by a single hue family.

### 4.3 Typography

- [x] Use system sans by default for performance.
- [x] Use system mono only for metadata labels, coordinates, route labels, and code snippets.
- [x] Keep heading sizes controlled:
  - [x] Mobile hero heading around `text-4xl`.
  - [x] Tablet/desktop hero heading around `text-5xl` to `text-6xl`.
  - [x] Cards and panels use compact headings.
- [x] Do not scale font sizes with viewport width.
- [x] Keep letter spacing at normal for body and headings.
- [x] Only use uppercase tracking for small metadata labels.
- [x] Ensure line lengths stay readable:
  - [x] Body copy max around `65ch`.
  - [x] Technical descriptions max around `72ch`.

### 4.4 Shape And Surface Rules

- [x] Use small radii only, preferably `4px` to `8px`.
- [x] Do not nest cards inside cards.
- [x] Use cards only for repeated items, panels, modals, and framed tool-like surfaces.
- [x] Use full-width page bands or unframed constrained layouts for sections.
- [x] Blueprint frames can border sections, but avoid making every section a floating card.
- [x] Use thin borders and low-contrast structural lines.
- [x] Use stable dimensions for repeated modules.

### 4.5 Blueprint Language

- [x] Create visual motifs:
  - [x] coordinate labels
  - [x] breakpoint markers
  - [x] thin frame corners
  - [x] measurement ticks
  - [x] connecting SVG paths
  - [x] module labels
  - [x] status stamps
- [x] Keep motifs functional:
  - [x] Show responsive breakpoints.
  - [x] Show project status.
  - [x] Show route location.
  - [x] Show content type.
- [x] Avoid decorative clutter.
- [x] Avoid fake complexity.

## 5. Motion System

### 5.1 Motion Principles

- [x] Prefer CSS and SVG animation.
- [x] Treat no custom JavaScript as a hard constraint for the design layer.
- [x] Use CSS media queries, CSS variables, SVG, Dioxus-rendered markup, and Tailwind utilities before considering any runtime animation tool.
- [x] A large animation framework is acceptable only after an explicit decision and only if:
  - [x] it respects the browser `prefers-reduced-motion` flag.
  - [x] it can disable nonessential animation globally.
  - [x] it does not hide content before hydration or runtime startup.
  - [x] it does not require custom JavaScript authoring.
  - [x] it does not create scroll hijacking or forced experience flows.
  - [x] it does not materially hurt first paint or mobile responsiveness.
- [x] Animate cheap properties:
  - [x] opacity
  - [x] transform
  - [x] stroke-dashoffset
  - [x] color
  - [x] background-color
  - [x] border-color
- [x] Avoid layout-triggering animation:
  - [x] width
  - [x] height
  - [x] top
  - [x] left
  - [x] margin
  - [x] expensive filters
- [x] Default duration range:
  - [x] micro feedback: `120ms` to `180ms`
  - [x] section entrance: `180ms` to `260ms`
  - [x] SVG path draw: `500ms` to `900ms`
- [x] Use motion to show orientation, hierarchy, or feedback.
- [x] Respect `prefers-reduced-motion`.

### 5.2 Required Motion Primitives

- [x] Page entrance:
  - [x] subtle fade and translate
  - [x] keep current `page-motion` concept or replace with blueprint-named equivalent
- [x] Section entrance:
  - [x] staggered content reveal
  - [x] no more than two or three delay levels
- [x] Card interaction:
  - [x] border/highlight shift
  - [x] subtle translate or frame-line reveal
  - [x] no large hover movement
- [x] SVG blueprint draw:
  - [x] stroke path draws once on load
  - [x] reduced motion disables drawing
  - [x] final static SVG still communicates layout
- [x] Breakpoint indicator:
  - [x] active marker changes through CSS media queries
  - [x] no JavaScript required
- [x] Route/nav indicator:
  - [x] hover/focus state feels like a drafting marker locking into place
  - [x] active route state implemented with Dioxus Router state.

### 5.3 Reduced Motion

- [x] Keep all content visible when motion is disabled.
- [x] Disable path draw animation under `prefers-reduced-motion: reduce`.
- [x] Disable card lift under reduced motion.
- [x] Keep color and border feedback under reduced motion.
- [x] Do not rely on motion as the only state signal.

## 6. Responsive System

### 6.1 Breakpoints

- [x] Preserve the three primary breakpoints from the spec:
  - [x] Mobile: `0px - 639px`
  - [x] Tablet: `640px - 1023px`
  - [x] Desktop: `1024px+`
- [x] The design should visibly acknowledge these breakpoints.
- [x] The layout should change intentionally across breakpoints.
- [x] No content should become inaccessible at any viewport.

### 6.2 Mobile Layout

- [x] Single-column layout.
- [x] Header should not consume too much vertical space.
- [x] Navigation must remain accessible and touch-friendly.
- [x] Minimum target size: `44px` for key touch interactions.
- [x] Blueprint diagram should become a vertical route/measurement rail.
- [x] Project modules stack with stable spacing.
- [x] Avoid hover-only interactions.
- [x] Ensure long project titles wrap cleanly.
- [x] Ensure metadata chips wrap without causing awkward layout jumps.

### 6.3 Tablet Layout

- [x] Use two-column opportunities where content benefits:
  - [x] hero text plus compact blueprint frame
  - [x] project cards in two columns
  - [x] capability modules in two columns
- [x] Keep reading pages constrained.
- [x] Avoid squeezed multi-column dense layouts.
- [x] Maintain comfortable spacing and clear section boundaries.

### 6.4 Desktop Layout

- [x] Use constrained max width around current `max-w-6xl` or slightly wider if blueprint frame needs space.
- [x] Hero can use asymmetric grid:
  - [x] text area
  - [x] live blueprint SVG/frame
- [x] Project modules can use two or three columns depending on card density.
- [x] Writing should remain readable, not full-width.
- [x] The blueprint layer must not compete with content.

### 6.5 Dynamic Responsive Behavior

- [x] Implement visible breakpoint changes with CSS:
  - [x] different SVG frame orientation
  - [x] active breakpoint labels
  - [x] grid changes
  - [x] content rail changes
- [x] Do not use JavaScript resize listeners.
- [x] Use CSS media queries and responsive markup for breakpoint behavior.
- [x] Ensure breakpoint transitions do not animate layout properties directly.
- [x] Use opacity and transform changes around breakpoint-specific elements.

## 7. Information Architecture

### 7.1 Global Layout

- [x] Redesign `PortfolioLayout`.
- [x] Header requirements:
  - [x] brand/home link remains visible.
  - [x] nav links: Projects, Writing, Contact.
  - [x] visible focus states.
  - [x] active route indication if feasible.
  - [x] sticky behavior should remain if it does not hurt mobile.
- [x] Main requirements:
  - [x] keep semantic `main`.
  - [x] apply page-level blueprint background or frame.
  - [x] avoid wrapping every route in excessive visual chrome.
- [x] Footer requirements:
  - [x] include copyright.
  - [x] include email.
  - [x] include concise build/runtime note if useful.
  - [x] align with blueprint visual language.

### 7.2 Homepage

- [x] Redesign the homepage as the main blueprint experience.
- [x] Proposed section order:
  - [x] Hero blueprint frame.
  - [x] Breakpoint strip / responsive proof.
  - [x] Featured project modules.
  - [x] Capability blueprint.
  - [x] Writing preview.
  - [x] Contact band.
- [x] The first viewport must show:
  - [x] Edgar Christian.
  - [x] Role / positioning.
  - [x] at least one direct action.
  - [x] a clear visual signal of the blueprint concept.
  - [x] a hint of the next section.
- [x] Avoid oversized empty hero.
- [x] Avoid marketing copy that delays access to projects.

### 7.3 Projects Index

- [x] Replace generic "Selected Work" presentation with blueprint modules.
- [x] Show project metadata clearly:
  - [x] title
  - [x] year
  - [x] status
  - [x] technologies
  - [x] short summary
- [x] Consider grouping or visual sorting by:
  - [x] Pinned projects first.
  - [x] Remaining projects sorted by upload date.
  - [x] Add a clear pinned indicator/icon on pinned cards.
  - [x] Avoid status grouping unless the project count grows enough to justify it.
- [x] Full card remains clickable.
- [x] Remove visible skeleton preview details from production UI.
- [x] Add an empty-state pattern only if future filters are added.

### 7.4 Project Detail

- [x] Redesign project detail pages as simplified project records.
- [x] Required content structure:
  - [x] title
  - [x] summary
  - [x] status/year
  - [x] one project detail panel
- [x] Avoid showing placeholder text as if it were real case study content.
- [x] Keep not-found behavior clear and route-safe.

### 7.5 Writing Index

- [x] Redesign writing cards with blueprint record styling.
- [x] Show:
  - [x] title
  - [x] published date
  - [x] summary
  - [x] tags
  - [x] read affordance
- [x] Maintain full-card links.
- [x] Remove visible skeleton preview details.
- [x] Keep line lengths readable.

### 7.6 Writing Post

- [x] Preserve safe Markdown rendering.
- [x] Improve markdown typography for blueprint theme.
- [x] Add article metadata frame:
  - [x] published date
  - [x] tags
  - [x] content type
  - [x] back link
- [x] Ensure code blocks are horizontally scrollable.
- [x] Ensure headings have adequate spacing.
- [x] Remove visible skeleton preview details.

### 7.7 Contact

- [x] Keep contact static and simple.
- [x] Present contact links as endpoints or records.
- [x] Keep `mailto:` and external links.
- [x] Preserve safe external link attributes.
- [x] Avoid contact form.
- [x] Add concise trust copy:
  - [x] no message collection
  - [x] static contact links
  - [x] verified external profile

### 7.8 Not Found

- [x] Redesign 404 as a blueprint route miss.
- [x] Show requested path safely.
- [x] Provide route back to Home and/or Projects.
- [x] Do not expose internal implementation details.

## 8. Component Architecture

### 8.1 Existing Components To Keep Or Refactor

- [x] `Footer`
  - [x] Refactor to blueprint style.
  - [x] Keep profile email from data.
- [x] `ProjectCard`
  - [x] Refactor into blueprint module card.
  - [x] Keep full-card link behavior.
  - [x] Add stable metadata layout.
- [x] Skeleton components
  - [x] Keep available for future delayed states.
  - [x] Style them to match blueprint surfaces if retained.
  - [x] Do not show skeleton previews on production pages.

### 8.2 New Components To Add

- [x] `.blueprint-frame`
  - [x] Implement reusable section frame as a CSS primitive for the first pass.
  - [x] Use local labels/content inside each route during the first implementation.
  - [x] Extract `BlueprintFrame` as a Rust component during the modularization pass.
- [x] Homepage hero
  - [x] Implement as page-level composition in `home.rs`.
  - [x] Contains identity, CTAs, and responsive blueprint SVG.
- [x] `BreakpointStrip`
  - [x] Purpose: visible mobile/tablet/desktop indicator.
  - [x] Pure CSS active states via media queries.
- [x] `BlueprintDiagram`
  - [x] Purpose: SVG responsive frame/diagram.
  - [x] Should render meaningful static SVG even without animation.
- [x] `.blueprint-module`
  - [x] Implement generic record/card shell as a CSS primitive.
  - [x] Avoid over-abstracting project, writing, and contact layouts into one Rust component.
- [x] `StatusBadge`
  - [x] Purpose: consistent status display for In Progress, Planned, Archived.
  - [x] Use label + color, not color alone.
- [x] `TechTag`
  - [x] Purpose: consistent compact technology chip.
- [x] Capability grid
  - [x] Implement as a reusable Rust component after capability content moved to data.
- [x] `SectionHeading`
  - [x] Purpose: consistent section headings with label, title, and description.
- [x] Contact endpoints
  - [x] Implement as a reusable Rust component after contact kind metadata was added.

### 8.3 Component Boundaries

- [x] Keep route-level composition in `src/views`.
- [x] Keep reusable visual primitives in `src/components`.
- [x] Do not place large page-specific sections into `components` unless reused.
- [x] Avoid a single massive `home.rs` if the homepage becomes too large.
- [x] Prefer simple components over a generic design-system abstraction if only used once.

### 8.4 Dioxus 0.7 Rules

- [x] Use `#[component]`.
- [x] Return `Element`.
- [x] Use `use_signal` only if state is necessary.
- [x] Avoid unnecessary state; most blueprint behavior should be CSS/SVG.
- [x] Props should be owned values.
- [x] Props should implement `Clone` and `PartialEq`.
- [x] Use `ReadOnlySignal` only if a prop needs reactive behavior.
- [x] Use `asset!` for local assets.
- [x] Use `document::Link` or `document::Stylesheet` for document assets.

## 9. Content Model Plan

### 9.1 Profile Content

- [x] Keep existing fields:
  - [x] name
  - [x] role
  - [x] summary
  - [x] email
- [x] Add profile field:
  - [x] `availability`
- [x] Do not add profile fields for now:
  - [x] `location`
  - [x] `focus`
  - [x] `stack`
- [x] Only add fields if they are displayed.

### 9.2 Project Content

- [x] Current fields:
  - [x] title
  - [x] slug
  - [x] summary
  - [x] detail_html
  - [x] year
  - [x] uploaded
  - [x] status
  - [x] technologies
  - [x] featured
  - [x] pinned
- [x] Add project ordering fields:
  - [x] `uploaded`
  - [x] `pinned`
- [x] Add Markdown-backed project detail content:
  - [x] Keep TOML frontmatter/metadata for title, slug, summary, year, status, technologies, featured, uploaded, and pinned.
  - [x] Move long project detail content to Markdown body.
  - [x] Render project Markdown with the same safe Markdown renderer used by writing.
  - [x] Theme project Markdown to match the blueprint visual system.
- [x] Add displayed project metadata:
  - [x] `links`
- [x] Do not add project metadata field for now:
  - [x] `artifact_label`
- [x] Decide whether project details should remain TOML-only: user chose Markdown-backed project details.
- [x] Implement Markdown-backed project details in the next pass.
- [x] No new project case-study fields were added; validation tests were updated for the project role removal.

### 9.3 Writing Content

- [x] Keep current Markdown frontmatter:
  - [x] title
  - [x] slug
  - [x] summary
  - [x] published
  - [x] tags
- [x] Add writing frontmatter:
  - [x] `updated`
- [x] Do not add writing frontmatter for now:
  - [x] `reading_time`
  - [x] `category`
- [x] Avoid adding metadata that is not displayed.

### 9.4 Contact Content

- [x] Keep current fields:
  - [x] label
  - [x] href
  - [x] detail
  - [x] external
- [x] Add contact field:
  - [x] `kind` such as email, code, profile
- [x] Do not add contact field for now:
  - [x] `verified`
- [x] Maintain URL validation:
  - [x] `mailto:`
  - [x] `https://`

### 9.5 Capability Content

- [x] Move homepage capability cards into structured content.
- [x] Add a content file, likely `content/capabilities.toml`.
- [x] Define each capability record with:
  - [x] `label`
  - [x] `title`
  - [x] `description`
- [x] Add typed capability loading through the `src/data` module.
- [x] Split the `src/data` module into focused data modules:
  - [x] `src/data/mod.rs`
  - [x] `src/data/domain.rs`
  - [x] `src/data/types.rs`
  - [x] `src/data/sources.rs`
  - [x] `src/data/parser.rs`
  - [x] `src/data/markdown.rs`
  - [x] `src/data/validation.rs`
  - [x] `src/data/loader.rs`
  - [x] `src/data/tests.rs`
- [x] Refine data domain model:
  - [x] parse project status into `ProjectStatus` instead of comparing raw strings
  - [x] parse contact kind into `ContactKind` instead of matching raw strings in components
  - [x] parse dates into `IsoDate` with calendar-aware day/month validation
  - [x] centralize project/contact link URL validation
  - [x] return static references from project and writing lookup helpers to avoid unnecessary record clones
- [x] Add validation tests:
  - [x] non-empty label
  - [x] non-empty title
  - [x] non-empty description
  - [x] stable expected count unless intentionally changed
- [x] Render the homepage capability section from structured data instead of hardcoded Rust markup.
- [x] Keep the markup/design in `home.rs`; only move the content strings into data.

## 10. Page-Level Implementation Tasks

### 10.1 Layout Shell

- [x] Update `src/views/layout.rs`.
- [x] Replace current generic dark shell with blueprint background.
- [x] Add subtle page grid or frame through CSS pseudo-elements where possible.
- [x] Keep semantic `header`, `nav`, `main`, `footer`.
- [x] Ensure nav wraps gracefully on mobile.
- [x] Add hover/focus treatments.
- [x] Add active route treatment.
- [x] Ensure sticky header background remains readable over blueprint lines.
- [x] Test header at:
  - [x] 320px width
  - [x] 390px width
  - [x] 768px width
  - [x] 1024px width
  - [x] 1440px width

### 10.2 Homepage

- [x] Update `src/views/home.rs`.
- [x] Build hero layout:
  - [x] eyebrow/coordinate label
  - [x] name
  - [x] positioning statement
  - [x] primary CTA to Projects
  - [x] secondary CTA to Contact
  - [x] blueprint SVG diagram
- [x] Build breakpoint strip:
  - [x] mobile label
  - [x] tablet label
  - [x] desktop label
  - [x] active state via CSS media queries
- [x] Build featured project section:
  - [x] title
  - [x] explanatory copy
  - [x] featured project cards
  - [x] link to all projects
- [x] Build capability section:
  - [x] secure content boundaries
  - [x] responsive interface systems
  - [x] edge-ready deployment
  - [x] progressive loading states
  - [x] render capability copy from structured content
- [x] Build writing preview:
  - [x] latest writing card
  - [x] link to writing index
- [x] Build contact band:
  - [x] brief availability/contact copy
  - [x] email link
  - [x] Codeberg link if useful
- [x] Ensure first viewport is not empty below hero.
- [x] Ensure hero does not overflow on mobile.

### 10.3 Projects Index

- [x] Update `src/views/projects.rs`.
- [x] Replace placeholder intro copy.
- [x] Use `SectionHeading`.
- [x] Add project count or status summary if useful.
- [x] Use blueprint-styled project modules.
- [x] Remove `details` skeleton preview from visible route.
- [x] Consider status grouping:
  - [x] Do not group by status in the next pass.
  - [x] Sort pinned projects first.
  - [x] Sort remaining projects by upload date.
  - [x] Add pinned indicator/icon.
- [x] If grouping is implemented, avoid complex runtime state.
- [x] Ensure cards are full-card links.
- [x] Ensure card heights remain stable in grid.

### 10.4 Project Detail

- [x] Update `src/views/project_detail.rs`.
- [x] Replace current placeholder paragraph about future content.
- [x] Add top metadata frame:
  - [x] status
  - [x] year
- [x] Use one large project details panel instead of separate stack/problem/constraint sections.
- [x] Remove `details` skeleton preview.
- [x] Keep not-found state.
- [x] Style not-found state with blueprint route-miss language.

### 10.5 Writing Index

- [x] Update `src/views/writing.rs`.
- [x] Replace placeholder copy about content model with visitor-facing copy.
- [x] Use blueprint writing records.
- [x] Remove visible skeleton preview.
- [x] Ensure writing cards have:
  - [x] date
  - [x] title
  - [x] summary
  - [x] tags
  - [x] read affordance
- [x] Ensure full-card link behavior remains.

### 10.6 Writing Post

- [x] Update `WritingPost` in `src/views/writing.rs` or split into separate file if it grows.
- [x] Add blueprint article header.
- [x] Keep safe `dangerous_inner_html` output from sanitized renderer.
- [x] Update markdown styling in `tailwind.css`.
- [x] Remove skeleton preview.
- [x] Ensure code block styles match blueprint theme.
- [x] Ensure mobile code blocks scroll horizontally.

### 10.7 Contact Page

- [x] Update `src/views/contact.rs`.
- [x] Replace generic "Static Contact Links" title with stronger copy.
- [x] Present links as contact endpoints.
- [x] Show external link behavior clearly.
- [x] Keep static link-only approach.
- [x] Ensure email link works.
- [x] Ensure external links use `target="_blank"` and `rel="noopener noreferrer"`.

### 10.8 404 Page

- [x] Update `src/views/not_found.rs`.
- [x] Use blueprint route-miss visual.
- [x] Show requested path in a code-style token.
- [x] Provide direct home link.
- [x] Optionally provide projects link.

## 11. CSS Implementation Plan

### 11.1 File Rules

- [x] Edit only `tailwind.css` for source CSS.
- [x] Do not directly edit generated `assets/tailwind.css`.
- [x] Let `dx serve` or `dx build` regenerate generated CSS.

### 11.2 CSS Layers

- [x] Keep custom classes under `@layer components`.
- [x] Add blueprint custom properties near the top.
- [x] Keep keyframes near the bottom.
- [x] Keep reduced-motion overrides near the bottom.

### 11.3 Proposed Classes

- [x] `.blueprint-page`
  - [x] page-level background and grid effect.
- [x] `.blueprint-shell`
  - [x] constrained main layout.
- [x] `.blueprint-frame`
  - [x] bordered frame with corner ticks.
- [x] `.blueprint-label`
  - [x] small uppercase/mono metadata label.
- [x] `.blueprint-line`
  - [x] shared SVG stroke behavior.
- [x] `.blueprint-draw`
  - [x] stroke-dash path drawing.
- [x] `.blueprint-module`
  - [x] card/module surface.
- [x] `.blueprint-module-link`
  - [x] full-card link interaction.
- [x] `.blueprint-chip`
  - [x] technology/status chip base.
- [x] `.blueprint-status-*`
  - [x] status-specific treatment.
- [x] `.breakpoint-strip`
  - [x] responsive indicator container.
- [x] `.breakpoint-mobile`
  - [x] active on mobile.
- [x] `.breakpoint-tablet`
  - [x] active on tablet.
- [x] `.breakpoint-desktop`
  - [x] active on desktop.

### 11.4 Background Grid

- [x] Implement a subtle blueprint grid with CSS gradients.
- [x] Keep opacity low.
- [x] Ensure text contrast remains high.
- [x] Disable or simplify grid if it causes visual noise on mobile.
- [x] Avoid animated background grid.

### 11.5 SVG Styling

- [x] SVG should use `currentColor` or CSS variables where possible.
- [x] Set stable `viewBox`.
- [x] Use `preserveAspectRatio` intentionally.
- [x] Keep SVG DOM small.
- [x] Avoid huge inline SVG if an asset file is better.
- [x] Prefer inline SVG for components that need CSS animation tied to current theme.

### 11.6 Markdown Styling

- [x] Update `.markdown-body` colors.
- [x] Add heading anchor spacing if anchors are introduced.
- [x] Style blockquotes if needed.
- [x] Style tables if writing uses tables.
- [x] Keep code blocks accessible and readable.
- [x] Keep link styles visibly distinct from body text.

## 12. Asset Plan

### 12.1 Existing Assets

- [x] Keep `assets/favicon.ico`.
- [x] Decide whether `assets/logo-cropped.png` is needed: not referenced in this pass; leave untouched.
- [x] Decide whether `assets/header.svg` fits the new blueprint direction: redesign later and leave the existing asset untouched for now.
- [ ] If `header.svg` is redesigned or reused in a future pass:
  - [ ] inspect colors
  - [ ] ensure it respects reduced motion if embedded
  - [ ] avoid clashing with new blueprint visual language
- [x] If `header.svg` is not reused:
  - [x] leave it unless cleanup is explicitly requested later
  - [x] do not delete unrelated assets in this phase

### 12.2 New SVGs

- [x] Create SVGs as Dioxus components when they need responsive CSS hooks.
- [x] Create SVG files in `assets/` only when they are static decorative assets.
- [x] Add meaningful `aria-hidden="true"` to decorative SVGs.
- [x] Provide text alternatives only if SVG conveys unique content not available nearby.

## 13. Accessibility Plan

### 13.1 Semantics

- [x] Preserve semantic landmarks:
  - [x] `header`
  - [x] `nav`
  - [x] `main`
  - [x] `section`
  - [x] `article`
  - [x] `footer`
- [x] Use headings in logical order.
- [x] Avoid heading jumps caused by purely visual labels.
- [x] Use `p`, `dl`, `ul`, and `article` appropriately.

### 13.2 Keyboard

- [x] All links must be keyboard reachable.
- [x] Full-card links must have visible focus.
- [x] Focus rings must have sufficient contrast.
- [x] Avoid focus styles hidden by overflow clipping.
- [x] Ensure sticky header does not obscure focused content after navigation.

### 13.3 Color And State

- [x] Status must use labels, not color alone.
- [x] Active breakpoint indicator must include text label.
- [x] Links must be visually distinguishable.
- [x] Check contrast for:
  - [x] body text
  - [x] muted text
  - [x] borders
  - [x] accent links
  - [x] focus rings
  - [x] status badges

### 13.4 Motion And Reduced Motion

- [x] Test with `prefers-reduced-motion: reduce`.
- [x] Confirm no essential content is hidden before animation.
- [x] Confirm SVG draw animation is disabled.
- [x] Confirm hover/focus still gives non-motion feedback.

### 13.5 Mobile Accessibility

- [x] Tap targets at least `44px`.
- [x] No text overlap.
- [x] No horizontal page scroll.
- [x] Navigation remains usable at narrow widths.
- [x] Cards have enough spacing for touch.

## 14. Performance Plan

### 14.1 Runtime

- [x] Keep interactions CSS-first.
- [x] Do not add custom JavaScript.
- [x] Do not add JavaScript animation, resize, scroll, or interaction code.
- [x] Dioxus-generated runtime/bootstrap code is acceptable as part of the framework; the redesign itself should not add handwritten JS.
- [x] No large animation framework was proposed or added in this pass.
- [x] Avoid large rendering loops.
- [x] Avoid canvas/WebGPU for the chosen direction.
- [x] Do not use `use_effect`, `web_sys`, browser event listeners, or hydration-sensitive browser APIs for visual behavior in this redesign.
- [x] If a future non-visual feature truly requires browser APIs, handle it as a separate scoped decision outside this redesign plan.

### 14.2 CSS

- [x] Keep custom CSS modest.
- [x] Avoid heavy filters/backdrop effects over large areas.
- [x] Use `backdrop-blur` sparingly because sticky headers can be expensive.
- [x] Avoid constantly running animations.
- [x] SVG path draw should run once, not indefinitely.

### 14.3 Assets

- [x] Avoid large raster hero images.
- [x] Prefer compact SVG for blueprint visuals.
- [x] Ensure unused heavy assets are not newly referenced.

### 14.4 Build

- [x] Ensure `dx build --platform web --release` still succeeds.
- [x] Ensure release output remains compatible with Cloudflare asset serving.
- [x] Confirm `Dioxus.toml` still has no added script entries.
- [x] Confirm `package.json` has no new browser-side animation/runtime dependencies unless explicitly approved.
- [x] Confirm no new handwritten `.js` or `.mjs` files were added for the redesign.

## 15. Security And Content Safety

- [x] Preserve Markdown raw HTML escaping.
- [x] Keep `dangerous_inner_html` only for rendered sanitized Markdown.
- [x] Do not add unvalidated external URLs.
- [x] Keep contact link validation.
- [x] Keep project slug validation.
- [x] Keep writing slug validation.
- [x] Keep content tests updated when schema changes.
- [x] Do not add APIs or server functions unless necessary.
- [x] If server functions are later added, gate them correctly and validate input.

## 16. Implementation Phases

### Phase 1: Design Tokens And CSS Foundation

- [x] Add blueprint CSS variables.
- [x] Add page background and grid.
- [x] Add motion primitives.
- [x] Add reduced-motion overrides.
- [x] Add base blueprint utility classes.
- [x] Update markdown theme to align with blueprint direction.
- [x] Verify `cargo fmt --check` not affected by CSS-only changes.
- [x] Run `dx check` if available after CSS integration.

### Phase 2: Component Primitives

- [x] Add `.blueprint-frame` CSS primitive instead of a Rust `BlueprintFrame` component.
- [x] Add `SectionHeading`.
- [x] Add `StatusBadge`.
- [x] Add `TechTag`.
- [x] Add `BreakpointStrip`.
- [x] Add `BlueprintDiagram`.
- [x] Refactor `ProjectCard`.
- [x] Refactor `Footer`.
- [x] Export new components through `src/components/mod.rs`.
- [x] Run `cargo fmt`.
- [x] Run `cargo check`.

### Phase 3: Layout Shell

- [x] Update `PortfolioLayout`.
- [x] Apply blueprint page class.
- [x] Update header/nav styling.
- [x] Add hover/focus nav treatments.
- [x] Add active route treatment.
- [x] Update main spacing.
- [x] Update footer placement and style.
- [x] Verify all routes still render.

### Phase 4: Homepage

- [x] Replace current hero.
- [x] Add responsive blueprint diagram.
- [x] Add breakpoint strip.
- [x] Add featured project modules.
- [x] Add capabilities.
- [x] Add writing preview.
- [x] Add contact band.
- [x] Remove placeholder copy.
- [x] Verify mobile first viewport.
- [x] Verify desktop first viewport.

### Phase 5: Project Routes

- [x] Update projects index.
- [x] Remove skeleton preview.
- [x] Update project detail layout.
- [x] Remove project detail placeholder copy.
- [x] Decide whether to extend project content schema: no project case-study schema extension for now.
- [x] Remove project `role` schema/content instead:
  - [x] update TOML files
  - [x] update structs
  - [x] update validation
  - [x] update tests
- [x] Verify project not-found route.

### Phase 6: Writing Routes

- [x] Update writing index.
- [x] Remove skeleton preview.
- [x] Update writing post header.
- [x] Remove writing post skeleton preview.
- [x] Update markdown styling.
- [x] Verify Markdown code blocks.
- [x] Verify writing not-found route.

### Phase 7: Contact And 404

- [x] Update contact page.
- [x] Update contact endpoint cards.
- [x] Update 404 page.
- [x] Verify external link attributes.
- [x] Verify mailto link.

### Phase 8: Responsive QA

- [x] Test at 320px width.
- [x] Test at 375px width.
- [x] Test at 390px width.
- [x] Test at 640px width.
- [x] Test at 768px width.
- [x] Test at 1024px width.
- [x] Test at 1280px width.
- [x] Test at 1440px width.
- [x] Confirm no horizontal scroll.
- [x] Confirm text does not overlap.
- [x] Confirm buttons fit labels.
- [x] Confirm project cards remain stable.
- [x] Confirm blueprint diagram does not crowd text.

### Phase 9: Accessibility QA

- [ ] Keyboard tab through all pages.
- [x] Verify focus visibility.
- [x] Verify headings order.
- [x] Verify landmarks.
- [x] Verify link labels.
- [x] Verify reduced motion.
- [x] Verify color contrast manually or with tooling.
- [x] Verify screen-reader-hidden decorative SVGs are marked correctly.

### Phase 10: Build And Checks

- [x] Run `cargo fmt --check`.
- [x] Run `cargo test`.
- [x] Run `cargo clippy --all-targets --no-default-features --features web -- -D warnings`.
- [x] Run `dx check`.
- [x] Run `dx build --platform web --release`.
- [x] Npm wrapper scripts are not required verification commands; direct Cargo/Dioxus commands are the source of truth.

### Phase 11: Visual QA

- [x] Start local dev server with `dx serve`.
- [x] Capture desktop screenshots:
  - [x] home
  - [x] projects
  - [x] project detail
  - [x] writing
  - [x] writing post
  - [x] contact
  - [x] 404
- [x] Capture mobile screenshots:
  - [x] home
  - [x] projects
  - [x] writing
  - [x] contact
  - [x] project detail
- [x] Capture reduced-motion screenshot.
- [x] Inspect for:
  - [x] overlap
  - [x] clipped text
  - [x] awkward wrapping
  - [x] low contrast
  - [x] excessive decoration
  - [x] broken SVG framing
  - [x] sticky header issues

## 17. File-Level Change Map

### 17.1 Likely Edited Files

- [x] `tailwind.css`
  - [x] blueprint variables
  - [x] background grid
  - [x] frame classes
  - [x] SVG animation
  - [x] responsive indicator CSS
  - [x] markdown style updates
  - [x] reduced-motion rules
- [x] `src/views/layout.rs`
  - [x] page shell
  - [x] nav
  - [x] main wrapper
- [x] `src/views/home.rs`
  - [x] full homepage redesign
- [x] `src/views/projects.rs`
  - [x] project index redesign
- [x] `src/views/project_detail.rs`
  - [x] project detail redesign
- [x] `src/views/writing.rs`
  - [x] writing index and article redesign
- [x] `src/views/contact.rs`
  - [x] contact endpoint redesign
- [x] `src/views/not_found.rs`
  - [x] 404 redesign
- [x] `src/components/mod.rs`
  - [x] export new components
- [x] `src/components/footer.rs`
  - [x] footer redesign
- [x] `src/components/project_card.rs`
  - [x] project card redesign
- [x] `src/data/mod.rs`
  - [x] hold public facade/query functions
  - [x] move parsing, validation, Markdown rendering, sources, and tests into focused submodules
  - [x] expose typed project status for UI summaries and badges

### 17.2 Possible New Files

- [x] `src/components/blueprint_frame.rs`
- [x] `src/components/blueprint_diagram.rs`
- [x] `src/components/breakpoint_strip.rs`
- [x] `src/components/section_heading.rs`
- [x] `src/components/status_badge.rs`
- [x] `src/components/tech_tag.rs`
- [x] `src/components/contact_endpoint.rs`
- [x] `src/components/capability_grid.rs`
- [x] `src/data/domain.rs`
- [x] `src/data/types.rs`
- [x] `src/data/sources.rs`
- [x] `src/data/parser.rs`
- [x] `src/data/markdown.rs`
- [x] `src/data/validation.rs`
- [x] `src/data/loader.rs`
- [x] `src/data/tests.rs`

### 17.3 Possible Content Files

- [x] Existing `content/projects/*.toml` migrated to Markdown-backed project files.
- [x] Added `content/projects/*.md` with TOML frontmatter and Markdown detail bodies.
- [x] Existing `content/profile.toml` extended with displayed availability field.
- [x] Existing `content/contact.toml` extended with displayed contact kind field.
- [x] Add `content/capabilities.toml` for homepage capability card copy.

### 17.4 Files Not To Touch Unless Needed

- [x] `assets/tailwind.css` should not be hand-edited.
- [x] `Cargo.lock` should not change unless dependencies change.
- [x] `Cargo.toml` should not need changes for this direction.
- [x] `wrangler.toml` should not need changes for design work.
- [x] Deleted renderer files should not be restored or removed unless the user requests cleanup.

## 18. Content Copy Drafts

### 18.1 Homepage Hero Draft

- [x] Eyebrow: `Responsive Blueprint / Edge-ready UI`
- [x] Heading: `Edgar Christian`
- [x] Body option A: `Software engineer building secure, responsive web systems with Rust, Dioxus, and Cloudflare.`
- [x] Body option B: `I build pragmatic interfaces with stable layouts, validated content, and edge-ready deployment paths.`
- [x] Primary CTA: `View projects`
- [x] Secondary CTA: `Read notes` or `Contact`

### 18.2 Capability Drafts

- [x] `Responsive systems`: `Layouts that keep their shape across mobile, tablet, and desktop.`
- [x] `Content boundaries`: `Typed local content, safe Markdown rendering, and validated links.`
- [x] `Edge delivery`: `Cloudflare-focused deployment with a small runtime surface.`
- [x] `Progressive states`: `Skeletons and loading patterns that preserve dimensions and respect reduced motion.`

### 18.3 Projects Intro Draft

- [x] `Selected work focused on secure content, responsive UI, and edge deployment. Each project shows status, year, and the next useful detail.`

### 18.4 Writing Intro Draft

- [x] `Technical notes from building this portfolio: Dioxus, security boundaries, responsive UI, and Cloudflare deployment.`

### 18.5 Contact Intro Draft

- [x] `Static contact endpoints only. No on-site message collection.`

## 19. Acceptance Criteria

### 19.1 Product Acceptance

- [x] The site clearly feels like a living responsive blueprint.
- [x] The design is distinctive without hiding content.
- [x] Visitors can reach projects, writing, and contact quickly.
- [x] Homepage is useful without requiring interaction.
- [x] Motion improves orientation and does not dominate.
- [x] The site feels personal enough for a portfolio and rigorous enough for a software engineer.

### 19.2 Technical Acceptance

- [x] All routes compile and render.
- [x] Dioxus 0.7 APIs are used correctly.
- [x] No removed APIs are introduced.
- [x] Content validation tests pass.
- [x] Markdown safety is preserved.
- [x] External links remain safe.
- [x] No unnecessary dependencies are added.
- [x] No handwritten JavaScript is added for the redesign.
- [x] No browser-side animation/runtime dependency is added without explicit approval.
- [x] Release build succeeds.

### 19.3 Responsive Acceptance

- [x] Mobile layout is single-column and readable.
- [x] Tablet layout uses two-column opportunities without crowding.
- [x] Desktop layout uses available space intentionally.
- [x] Breakpoint strip correctly communicates mobile/tablet/desktop behavior.
- [x] No text overlap on tested viewports.
- [x] No horizontal scroll on mobile.

### 19.4 Accessibility Acceptance

- [ ] Keyboard navigation works across all routes.
- [x] Focus styles are visible.
- [x] Reduced motion is respected.
- [x] Decorative SVGs are hidden from assistive tech.
- [x] Color is not the only state indicator.
- [x] Text contrast is sufficient.

### 19.5 Performance Acceptance

- [x] No heavy animation runtime.
- [x] No canvas/WebGPU requirement.
- [x] SVGs remain lightweight.
- [x] CSS animations are limited and cheap.
- [x] Page remains fast on mobile.

## 20. Open Decisions

- [x] Should the homepage secondary CTA point to Writing or Contact? Decision: Contact.
- [x] Should project details remain TOML-only or move to Markdown-backed case studies? Decision: Markdown-backed project details with the blueprint Markdown theme.
- [x] Should the existing `assets/header.svg` be reused, redesigned, or ignored? Decision: redesign later; leave the existing asset untouched for now.
- [x] Should nav active state be implemented in the first pass or deferred? Decision: implemented active route state with Dioxus Router state.
- [x] Should project cards be grouped by status on the Projects page? Decision: do not group by status; sort pinned projects first, then by upload date, and show a pinned indicator/icon.
- [x] Should the blueprint diagram be inline SVG component code or an asset file? Decision: inline Dioxus SVG component.
- [x] Should capability content live in Rust constants or structured content files? Decision: structured content file. Keep the visual markup in `home.rs`, but load capability labels/titles/descriptions from content data.
- [x] Should profile content gain availability/focus fields? Decision: no new profile fields until they are displayed.
- [x] If an animation framework is proposed later, which one, why CSS/SVG is insufficient, and how it respects reduced motion without custom JS? Decision: no animation framework in this pass.

### 20.1 Resolved Future Decisions

- [x] Decide whether to extract `BlueprintFrame`, `ContactEndpoint`, or `CapabilityGrid` as Rust components. Decision: yes, extract reusable components where they make adding content and maintenance easier.
- [x] Decide whether profile content should add `location`, `availability`, `focus`, or `stack` fields. Decision: add `availability` only.
- [x] Decide whether project metadata should add displayed `links` or `artifact_label` fields. Decision: add `links` only.
- [x] Decide whether writing metadata should add `reading_time`, `category`, or `updated`. Decision: add `updated` only as explicit Markdown frontmatter. Do not rely on filesystem metadata because bundled/deployed content should be deterministic and Cloudflare Worker runtime does not expose source Markdown file metadata.
- [x] Decide whether contact content should add `kind` or `verified` fields. Decision: add `kind` only.
- [x] Decide final redesign direction for `assets/header.svg`; current implementation leaves the existing asset untouched. Decision: user will provide a media kit later.
- [x] Decide whether npm wrapper scripts should be maintained as required verification commands, or whether direct Cargo/Dioxus commands are enough. Decision: direct Cargo/Dioxus commands are enough; npm is only needed for Wrangler/deploy workflow.

## 21. Suggested First Implementation Pass

- [x] Build CSS tokens and blueprint primitives.
- [x] Build `BlueprintDiagram`, `BreakpointStrip`, and `SectionHeading`.
- [x] Redesign `PortfolioLayout`.
- [x] Redesign homepage.
- [x] Run checks and visual QA.
- [x] Apply the system to secondary pages after the homepage/layout check passed.

## 22. Progress Log

- [x] Plan created.
- [x] Implemented final resolved content metadata decisions: profile availability, project links, writing updated date, and contact kind.
- [x] Extracted reusable `BlueprintFrame`, `ContactEndpoint`, and `CapabilityGrid` components.
- [x] Modularized `src/data` into focused facade, source, type, parser, Markdown, validation, loader, and test modules.
- [x] Verified data modularization with `cargo fmt --check`, `cargo check`, `cargo test`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, and `dx check`.
- [x] Refactored backend data model to typed status/contact kind/date values, centralized URL validation, and reference-returning lookup helpers.
- [x] Verified backend refactor with `cargo fmt --check`, `cargo check`, `cargo test`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, and `dx build --platform web --release`.
- [x] Moved the `data` facade from `src/data.rs` to `src/data/mod.rs` while keeping the module name unchanged.
- [x] Direction approved by user.
- [x] Initial Living Responsive Blueprint implementation completed.
- [x] `cargo test` passed.
- [x] `cargo clippy --all-targets --no-default-features --features web -- -D warnings` passed.
- [x] `dx check` passed.
- [x] `dx build --platform web --release` completed and emitted the web output.
- [x] Visual QA screenshots captured for desktop home, mobile home, projects, mobile contact, writing post, and reduced-motion home.
- [x] Refinement pass completed to reduce decorative blueprint language, replace the generic diagram with the real content pipeline, and remove project role from the rendered UI.
- [x] Project role removed from project TOML, Rust project schema, validation, and rendered project pages.
- [x] Project detail page simplified to title, status/year, and one project details panel.
- [x] Structured problem/constraints/approach/outcome/next-step project fields removed after simplifying the project detail design.
- [x] Open decisions reviewed with user: homepage secondary CTA changed to Contact, project details changed to Markdown-backed content, header SVG deferred for later redesign, nav active state approved, project ordering changed to pinned-first then upload date, blueprint diagram remains inline SVG, capability content moves to structured content, profile fields unchanged, and no animation framework added.
- [x] Implementation batch completed: homepage secondary CTA now points to Contact, capability cards load from `content/capabilities.toml`, nav links expose active route state, projects support `uploaded` and `pinned`, project lists sort pinned-first then upload date, and pinned cards show a visible indicator.
- [x] Implementation batch verified with `cargo fmt --check`, `cargo test`, `cargo check`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, and `dx build --platform web --release`.
- [x] Final implementation batch completed: project records migrated to Markdown-backed files, project detail renders safe Markdown in one details panel, homepage contact band includes Codeberg, retained skeletons use blueprint styling, and subtle text contrast was increased.
- [x] Final QA batch captured screenshots for home, projects, project detail, writing, writing post, contact, 404, reduced-motion home, and home widths 320/375/390/640/768/1024/1280/1440.
- [x] Final verification passed with `cargo fmt --check`, `cargo test`, `cargo check`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, `dx build --platform web --release`, and `git diff --check`.
- [x] Contrast audit completed: primary text, muted text, accent links, focus/accent color, status colors, and subtle text tokens meet normal text contrast against the dark backgrounds/panels used by the interface.
- [x] Remaining future decisions resolved by user: extract reusable components when useful, add profile `availability`, add project `links`, add writing `updated` frontmatter, add contact `kind`, wait for media kit before revisiting `header.svg`, and use direct Cargo/Dioxus verification commands with npm reserved for Wrangler/deploy workflow.
- [x] Whole-codebase improvement scan completed and review backlog added in Section 23.
- [x] Batch 1 release-hygiene decisions implemented: README rewritten, `src/data/mod.rs` kept as facade, generated CSS policy documented, and module/build checks passed. Git index cleanup for generated CSS and the data module move remains for the final git pass.
- [x] Batch 2 security/content decisions implemented: Markdown links now allow only safe `https`, `mailto`, and root-relative destinations; Markdown images allow only safe local `/assets/` image paths; structured links use the same internal URL policy; requested 404 path remains displayed by user decision.
- [x] Batch 3 Cloudflare header decisions implemented: Cloudflare Static Assets `_headers` support was verified, `cloudflare/_headers` now defines the deployment header policy, Wrangler scripts copy it into the generated asset directory, and CSP is included with Dioxus/WASM-compatible script rules.
- [x] Batch 3 verification completed with direct `dx build --platform web --release`, manual `_headers` copy into the generated public directory, source/output `_headers` diff check, `cargo fmt --check`, `cargo check`, `cargo test`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, and `git diff --check`. `npm run cloudflare:prepare` and `wrangler dev` could not run in this environment because Node/npm is not installed on PATH.
- [x] Batch 4 decisions implemented: `SPEC.md` rewritten around current static Dioxus/Cloudflare Static Assets guarantees plus future Worker/SSR goals, and shared `RouteAction`, `LinkAction`, and `SafeAnchor` primitives added for repeated action-link styling and safe external-link attributes.
- [x] Batch 4 verification passed with `cargo fmt --check`, `cargo check`, `cargo test`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, `dx build --platform web --release`, manual `_headers` copy/diff, and `git diff --check`. The known `wasm-opt` DWARF warning remains during release builds.
- [x] Homepage Codeberg lookup decision recorded: keep the current label-based lookup temporarily because the pages are expected to receive a larger overhaul later.
- [x] Batch 5 decisions implemented: `data::domain` is private with only `ProjectStatus` re-exported through `crate::data`, project/writing source registration is generated by `build.rs`, and the skip-to-content link is deferred until accessibility QA.
- [x] Batch 5 verification passed with `cargo fmt --check`, `cargo check`, `cargo test`, `cargo clippy --all-targets --no-default-features --features web -- -D warnings`, `dx check`, `dx build --platform web --release`, manual `_headers` copy/diff, and `git diff --check`. The known `wasm-opt` DWARF warning remains during release builds.
- [x] Batch 6 decisions implemented: release `wasm-opt` DWARF warning fixed by stripping debuginfo from the Dioxus `wasm-release` profile, Dioxus `fullstack` kept for the future Worker/SSR direction, and unused visual assets kept as intentional future source material.

## 23. Codebase Improvement Backlog

Review status: scanned after the Living Responsive Blueprint implementation. These are proposed improvements only; do not implement until reviewed and prioritized.

Priority guide:

- P0: release-blocking or high-confidence correctness/security/repository hygiene.
- P1: important maintainability, robustness, or performance improvements with clear value.
- P2: useful cleanup or quality improvements that can wait.
- P3: optional polish or future-proofing.

### 23.1 P0: Release And Repository Hygiene

- [ ] Fix tracked generated stylesheet boundary.
  - Finding: `.gitignore` says `assets/tailwind.css` is generated and should be ignored, but `git ls-files` still shows it tracked.
  - Risk: generated CSS can be accidentally hand-edited, produce noisy diffs, or diverge from root `tailwind.css`.
  - Proposed direction:
    - [x] Decide whether `assets/tailwind.css` should be committed or truly generated. Decision: generated and ignored.
    - [ ] If generated, remove it from the git index while keeping it ignored.
    - [x] Verify release build still emits and copies the browser stylesheet.
    - [x] Keep `src/main.rs` linked to `asset!("/assets/tailwind.css")`.
  - Acceptance:
    - [ ] Source CSS is edited only in `tailwind.css`.
    - [ ] `assets/tailwind.css` is either intentionally tracked or intentionally absent from git tracking.
    - [x] `dx build --platform web --release` still emits and serves the browser stylesheet.

- [ ] Normalize the `src/data` module move in git.
  - Finding: `src/data.rs` is deleted and `src/data/mod.rs` is the new facade. Until staged, git reports a deleted tracked file and an untracked `src/data/` directory.
  - Risk: a partial commit could lose the data facade or leave the module in an inconsistent state.
  - Proposed direction:
    - [ ] Stage the module move with `git add -A src/data.rs src/data`.
    - [x] Confirm `mod data;` in `src/main.rs` resolves to `src/data/mod.rs`.
  - Acceptance:
    - [ ] `git status --short` shows the move coherently once staged.
    - [x] `cargo check` and `cargo test` pass with `src/data/mod.rs` as the facade.

- [x] Resolve documentation/spec drift before release.
  - Finding: `README.md` still contains Dioxus jumpstart scaffold examples, and `SPEC.md` still describes earlier choices such as project roles, case-study sections, mobile collapsed nav, and SSR/Worker expectations that are not fully implemented yet.
  - Risk: future maintenance decisions may follow stale docs instead of the actual codebase.
  - Proposed direction:
    - [x] Rewrite `README.md` around the current portfolio architecture and commands.
    - [x] Split `SPEC.md` into current guarantees versus future Cloudflare/SSR goals, or update it to match current implementation decisions.
    - [x] Remove stale scaffold file names from `README.md`.
  - Acceptance:
    - [x] README matches current files, commands, and generated CSS policy.
    - [x] SPEC no longer contradicts implemented project details, navigation, or content schema.

### 23.2 P0: Security And Content Robustness

- [x] Harden Markdown link and image destinations.
  - Finding: raw HTML is escaped before `dangerous_inner_html`, but Markdown link/image destinations are currently rendered by `pulldown-cmark` without explicit URL scheme validation.
  - Risk: a local Markdown file could accidentally introduce `javascript:`, `data:`, or otherwise unwanted destinations in rendered anchors/images.
  - Proposed direction:
    - [x] Validate Markdown link destinations during `render_markdown`.
    - [x] Allow only explicit safe schemes: `https://`, `mailto:`, and root-relative links.
    - [x] Allow Markdown images only when they are safe local `/assets/` image paths.
    - [x] Add tests for unsafe Markdown link and image destinations.
  - Acceptance:
    - [x] Raw HTML remains escaped.
    - [x] Unsafe Markdown links/images cannot reach rendered HTML.
    - [x] Tests cover `javascript:`, `data:`, malformed links, local image paths, and allowed safe links.

- [x] Replace prefix-only URL validation with a stricter URL policy.
  - Finding: project/contact links are validated with `starts_with("https://")` or `starts_with("mailto:")`.
  - Risk: prefix checks are simple but do not validate host presence, control characters, malformed URLs, or mailto shape.
  - Proposed direction:
    - [x] Add a small validated URL/domain helper in `src/data/domain.rs`.
    - [x] Implement a narrow explicit policy for `https`, `mailto`, and root-relative links without adding a dependency.
    - [x] Reject whitespace/control characters, malformed HTTPS authorities, protocol-relative links, and parent-directory traversal.
    - [x] Keep external links restricted to HTTPS.
  - Acceptance:
    - [x] Contact/project link validation has focused tests for malformed URL shapes.
    - [x] Components receive already-validated link values.

- [x] Add Worker/static asset security headers.
  - Finding: `wrangler.toml` serves static assets, but there is no implemented response header policy for CSP, referrer policy, permissions policy, frame options, or content-type hardening.
  - Risk: deployment lacks the security-header layer already described in project content and `SPEC.md`.
  - Proposed direction:
    - [x] Decide whether headers belong in a Cloudflare `_headers` asset file or a small Worker boundary. Decision: use a `_headers` file because the current runtime is static assets without Worker request handling.
    - [x] Start with conservative headers compatible with Dioxus output.
    - [x] Include CSP only after checking Dioxus runtime needs for scripts/styles. Decision: include `script-src 'self' 'wasm-unsafe-eval'` for the generated Dioxus WebAssembly bootstrap.
    - [ ] Verify through Wrangler preview, not only `dx serve`.
  - Acceptance:
    - [ ] `wrangler dev` shows expected headers on HTML and static assets.
    - [x] Header policy does not break routing, CSS, WASM, or hydration/runtime loading in release build output.

- [x] Stop reflecting the requested route on the 404 page unless intentionally kept.
  - Finding: `src/views/not_found.rs` renders the requested path in the page.
  - Risk: Dioxus escapes text, so this is not currently an XSS issue, but it conflicts with the spec goal to avoid exposing routing details.
  - Proposed direction:
    - [x] Decision: intentionally keep the echoed path because it helps debugging.
    - [ ] Add a route test or visual check for long/encoded 404 paths.
  - Acceptance:
    - [x] 404 page remains unchanged by user decision.

### 23.3 P1: Rust/Data Maintainability

- [ ] Reduce full-record cloning in UI components.
  - Finding: `ProjectCard`, `WritingCard`, `ContactEndpoint`, and `CapabilityGrid` take owned records, causing `.clone()` / `.to_vec()` at route call sites.
  - Risk: current data is small, so this is not a runtime problem today, but it encourages wasteful patterns as content grows.
  - Proposed direction:
    - [ ] Convert cards to accept narrower owned props, such as slug/title/summary/status/year, rather than whole records.
    - [ ] Or keep route-level markup for static slices and avoid component props where cloning is worse than duplication.
    - [ ] Keep Dioxus 0.7 prop rules in mind: props must be owned and `Clone + PartialEq`.
  - Acceptance:
    - [ ] Routes no longer clone whole project/writing/contact/capability records just to render static content.
    - [ ] Rendered HTML and tests remain unchanged.

- [x] Introduce shared link/button primitives for repeated class strings and safe external links.
  - Finding: primary/secondary link classes and external link attributes are repeated across `home.rs`, `project_detail.rs`, `not_found.rs`, and `contact_endpoint.rs`.
  - Risk: inconsistent focus/hover behavior or missing `rel="noopener noreferrer"` when new links are added.
  - Proposed direction:
    - [x] Add small components or CSS classes for primary internal link, secondary internal link, and external text/action link.
    - [x] Add a single safe external link component that always applies `target`/`rel` based on validated link metadata.
    - [x] Avoid overbuilding a generic design system.
  - Acceptance:
    - [x] Repeated button/link class strings are substantially reduced.
    - [x] External link attributes stay consistent.

- [ ] Remove label-based data lookup on the homepage.
  - Finding: `src/views/home.rs` finds the Codeberg link by `link.label == "Codeberg"`.
  - Risk: changing display copy can break the homepage contact band.
  - Current decision: keep the label lookup temporarily until the planned page overhaul. Do not treat this as a completed robustness fix.
  - Proposed direction:
    - [ ] Lookup by typed `ContactKind::Code`, by a stable content `id`, or expose `code_profile_link()` from the data module.
    - [ ] If multiple code links become possible, make the selection rule explicit.
  - Acceptance:
    - [ ] Homepage contact link selection does not depend on visible label text.

- [x] Review public data module surface.
  - Finding: `pub mod domain` exposes internals while only `ProjectStatus` is currently re-exported for UI use.
  - Risk: external modules can couple to domain internals that may not be intended as stable UI API.
  - Proposed direction:
    - [x] Re-export only the domain types that the UI needs.
    - [ ] Consider private fields with accessor methods for validated domain types if the public structs become too leaky.
  - Acceptance:
    - [x] `crate::data` exposes a deliberate API surface, not every internal helper by accident.

- [x] Revisit manual content source registration.
  - Finding: every project/writing file must be manually added to `src/data/sources.rs`.
  - Risk: adding a new Markdown file but forgetting the source array silently excludes content.
  - Proposed direction:
    - [ ] Keep manual `include_str!` if simplicity wins, but add a checklist/test note for every new content file.
    - [x] Or add a small build-time generated source manifest if content volume grows. Decision: generate it now with `build.rs`.
  - Acceptance:
    - [x] New content cannot be accidentally missed without a failing test or clear checklist item.

### 23.4 P1: Performance And Bundle Discipline

- [x] Investigate the release `wasm-opt` DWARF warning.
  - Finding: `dx build --platform web --release` succeeds but prints `wasm-opt failed ... compile unit size was incorrect`.
  - Risk: the release build is usable, but optimization may be skipped or noisy; CI logs can hide real failures.
  - Proposed direction:
    - [x] Identify whether this comes from debug info, Dioxus CLI, `wasm-opt`, or Rust/LLVM output. Result: release wasm contained `.debug_*` DWARF sections before the fix.
    - [x] Try release profile/debug setting changes only if they do not harm diagnostics. Result: explicit `profile.wasm-release` with `debug = 0` and `strip = "debuginfo"` removed the warning.
    - [x] Document the final decision if the warning is harmless. Decision: fix it instead of documenting it as harmless.
  - Acceptance:
    - [x] Release build is quiet, or the known warning is documented with a verified reason.

- [x] Measure whether `dioxus/fullstack` should remain enabled in the dependency for this phase.
  - Finding: `Cargo.toml` enables Dioxus `fullstack`, but the current app has no server functions or Worker request boundary yet.
  - Risk: unnecessary features may increase compile time or bundle size.
  - Current decision: keep `fullstack` because the future Worker/SSR direction is still intentional.
  - Proposed direction:
    - [ ] Compare build size and behavior with current features versus minimal `router` + `web` needs.
    - [x] Keep `fullstack` if it is required for the planned SSR/Worker direction; otherwise gate it under a feature used only when needed.
  - Acceptance:
    - [x] Feature set is justified by measured output or explicit roadmap need.

- [x] Audit unused assets.
  - Finding: `assets/header.svg` and `assets/logo-cropped.png` are not referenced by the current app; `logo-cropped.png` is roughly 220 KB.
  - Risk: unused assets add repository weight and can confuse future design work.
  - Proposed direction:
    - [x] Keep if they are needed for the future media-kit direction.
    - [ ] Otherwise move to an archive path or remove after user approval.
  - Acceptance:
    - [x] `assets/` contains only referenced assets or intentionally retained source material.

- [ ] Review sticky header `backdrop-blur`.
  - Finding: the header uses `backdrop-blur`, which can be more expensive than a solid background on low-powered/mobile devices.
  - Risk: minor but avoidable paint cost.
  - Proposed direction:
    - [ ] Compare screenshots with a solid/semitransparent background and no blur.
    - [ ] Keep blur only if the visual value is meaningful.
  - Acceptance:
    - [ ] Header remains readable and cheaper to paint, or blur is intentionally retained.

### 23.5 P1: Accessibility And UX

- [ ] Complete keyboard tab-through QA.
  - Finding: `PLAN.md` still has keyboard navigation unchecked.
  - Risk: focus styles exist, but full route-to-route keyboard behavior has not been explicitly verified.
  - Proposed direction:
    - [ ] Test keyboard navigation across home, projects, project detail, writing, writing post, contact, and 404.
    - [ ] Verify skip/navigation ergonomics on mobile-width and desktop-width layouts.
  - Acceptance:
    - [ ] Keyboard navigation acceptance item can be marked complete with notes.

- [ ] Add a skip-to-content link.
  - Finding: the layout has semantic landmarks but no skip link.
  - Risk: keyboard users must tab through the full header navigation on every route.
  - Current decision: defer until accessibility QA.
  - Proposed direction:
    - [ ] Add a visually hidden/focus-visible skip link before the header.
    - [ ] Give `main` a stable id.
  - Acceptance:
    - [ ] First Tab exposes a skip link that moves focus to main content.

- [ ] Decide whether the breakpoint strip should remain exposed to assistive tech.
  - Finding: `BreakpointStrip` is a visual design artifact with `aria_label`, not core portfolio content.
  - Risk: screen-reader users may hear implementation/design language that does not help them evaluate the portfolio.
  - Proposed direction:
    - [ ] Decide whether it is content or decorative.
    - [ ] If decorative, mark it `aria-hidden`.
    - [ ] If content, ensure the label and text are useful outside visual context.
  - Acceptance:
    - [ ] The responsive indicator has a deliberate accessibility role.

- [ ] Reconcile mobile navigation behavior with the current spec.
  - Finding: `SPEC.md` asks for collapsed mobile navigation, while the current implementation uses wrapped visible links and avoids JS.
  - Risk: the current UI may be acceptable, but the spec and implementation disagree.
  - Proposed direction:
    - [ ] Either update the spec to permit always-visible wrapped nav, or design a CSS-only accessible disclosure pattern.
    - [ ] Avoid custom JS unless explicitly approved.
  - Acceptance:
    - [ ] Mobile navigation behavior is documented and tested.

### 23.6 P2: CSS And Design-System Hygiene

- [ ] Consolidate repeated utility-class groups.
  - Finding: many route files repeat long Tailwind utility strings for similar link/button/card patterns.
  - Risk: visual changes require broad search/replace and can introduce inconsistencies.
  - Proposed direction:
    - [ ] Add a small set of CSS component classes in root `tailwind.css`, such as blueprint button/link variants.
    - [ ] Keep classes semantic and limited; avoid a broad design-system abstraction.
  - Acceptance:
    - [ ] Route files become easier to scan without changing visual output.

- [ ] Review skeleton component strategy.
  - Finding: skeleton components are exported but not used in production routes; `components/mod.rs` uses `#[allow(unused_imports)]`.
  - Risk: retained code can become stale and untested.
  - Proposed direction:
    - [ ] Either keep skeletons as explicitly future-facing and add tests/visual references, or stop exporting them until delayed states exist.
    - [ ] If kept, document where they will be used.
  - Acceptance:
    - [ ] No unexplained unused exports remain.

- [ ] Decide whether SVG diagram text belongs in code or data.
  - Finding: `BlueprintDiagram` is a large inline RSX component with hardcoded labels.
  - Risk: future copy/layout edits are cumbersome and easy to break.
  - Proposed direction:
    - [ ] Keep inline SVG if it remains stable.
    - [ ] Or split repeated SVG node patterns into small helper components/records.
  - Acceptance:
    - [ ] Diagram remains easy to adjust without making `blueprint_diagram.rs` harder to read.

### 23.7 P2: Testing, CI, And Tooling

- [x] Add automated checks for Markdown safety beyond raw HTML.
  - Finding: current tests cover raw HTML escaping and basic project detail rendering, but not Markdown link/image sanitization.
  - Proposed direction:
    - [x] Add unit tests for unsafe Markdown destinations.
    - [x] Add tests for safe `https`, safe `mailto`, root-relative links, and local image paths.
  - Acceptance:
    - [x] Markdown renderer safety rules are covered by tests before any future writing/project content expands.

- [ ] Add `git diff --check` to CI.
  - Finding: local verification uses `git diff --check`, but Forgejo workflow does not.
  - Risk: whitespace errors can slip into CI-passing changes.
  - Proposed direction:
    - [ ] Add a workflow step for `git diff --check`.
  - Acceptance:
    - [ ] CI fails on trailing whitespace or conflict markers.

- [ ] Decide whether Forgejo checks should run on pushes/PRs, not only manually.
  - Finding: `.forgejo/workflows/check.yml` only runs on `workflow_dispatch`.
  - Risk: regressions can sit unnoticed unless checks are triggered manually.
  - Proposed direction:
    - [ ] Add push and/or pull request triggers if the Forgejo environment is reliable enough.
    - [ ] Keep manual dispatch as an option.
  - Acceptance:
    - [ ] Normal code review flow gets automatic feedback.

- [ ] Add Wrangler preview verification.
  - Finding: deployment target is Cloudflare assets/Worker, but current routine verification is mostly Cargo/Dioxus.
  - Risk: routing, headers, and asset behavior can differ between `dx serve` and Wrangler.
  - Proposed direction:
    - [x] Add a documented manual `wrangler dev` / deploy-preparation path through npm scripts.
    - [ ] Decide whether a CI-safe `wrangler deploy --dry-run` check should be required.
    - [ ] Verify SPA fallback and generated asset path.
  - Acceptance:
    - [ ] Wrangler path is tested before production readiness is claimed.

- [ ] Move reusable visual QA scripts out of ignored `target/`.
  - Finding: useful screenshot/CDP helpers live under `target/visual-qa`, which is ignored build output.
  - Risk: visual QA knowledge is lost across clean builds or machines.
  - Proposed direction:
    - [ ] If visual QA remains valuable, move scripts to `scripts/visual-qa/`.
    - [ ] Keep generated screenshots under `target/visual-qa`.
  - Acceptance:
    - [ ] QA scripts are versioned; screenshots remain generated artifacts.

### 23.8 P3: Documentation And Future Architecture

- [ ] Clarify current runtime mode: static Dioxus web app versus future SSR/Worker boundary.
  - Finding: docs and content talk about SSR/Fullstack/Cloudflare Workers, while current code is a Dioxus web app served through Cloudflare static assets.
  - Risk: future contributors may assume server functions, SSR, or Worker request handling already exists.
  - Proposed direction:
    - [ ] Document what exists now.
    - [ ] Document what remains future work.
    - [ ] Avoid claiming SSR/Worker behavior until verified in Wrangler/production.
  - Acceptance:
    - [ ] README and SPEC clearly separate current implementation from roadmap.

- [ ] Decide whether `package.json` wrapper scripts are deployment-only or also official verification commands.
  - Finding: user decision says direct Cargo/Dioxus commands are source of truth, while `package.json` still provides wrappers.
  - Risk: command duplication can drift.
  - Proposed direction:
    - [x] Keep npm scripts for Wrangler/deploy convenience.
    - [x] Document direct Cargo/Dioxus commands as canonical verification.
    - [x] Ensure npm wrappers call the same commands when retained.
  - Acceptance:
    - [x] README and package scripts do not imply conflicting workflows.

- [ ] Consider route/content snapshot tests.
  - Finding: data tests verify content parsing, but there are no route-level render/snapshot checks.
  - Risk: markup regressions are mostly caught visually/manual today.
  - Proposed direction:
    - [ ] Add lightweight render tests only if Dioxus 0.7 testing support is straightforward.
    - [ ] Prefer behavior-focused assertions over brittle full HTML snapshots.
  - Acceptance:
    - [ ] Critical route states have automated coverage without making tests noisy.
