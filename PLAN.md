# Living Responsive Blueprint Redesign Plan

## 0. Project Decision

- [ ] Direction name: Living Responsive Blueprint.
- [ ] Primary goal: redesign the portfolio so responsiveness, layout stability, and frontend judgment are visible in the interface itself.
- [ ] Design thesis: the site behaves like a living blueprint of a well-built web system. Layout frames, breakpoint-aware modules, measured spacing, SVG drafting lines, and restrained motion make the portfolio feel distinctive without becoming a forced interactive experience.
- [ ] Experience goal: visitors should immediately understand who Edgar is, what kind of systems he builds, and where to inspect projects, writing, or contact links.
- [ ] Engineering goal: keep the implementation fast, auditable, Dioxus 0.7-compatible, SSR-friendly, responsive, accessible, and Cloudflare Worker-safe.
- [ ] Motion goal: use SVG and CSS motion for orientation and polish, not entertainment. Avoid custom JavaScript at all costs.
- [ ] Content goal: turn existing security, validation, Cloudflare, Dioxus, skeleton, and responsive-system work into a coherent portfolio story.

## 1. Non-Goals

- [ ] Do not introduce a light theme or theme toggle.
- [ ] Do not add a contact form.
- [ ] Do not add visitor tracking, analytics, or message collection.
- [ ] Do not depend on remote font providers.
- [ ] Do not implement scroll hijacking.
- [ ] Do not write custom JavaScript for animation, layout, routing, resize handling, breakpoint detection, or interaction behavior.
- [ ] Do not introduce browser-side JavaScript dependencies for the redesign unless the user explicitly approves a specific exception.
- [ ] Large animation frameworks are allowed in principle if they are explicitly approved, work cleanly with Dioxus, respect `prefers-reduced-motion`, keep content usable without motion, and do not require custom JavaScript glue code.
- [ ] Do not require WebGPU, canvas, or 3D rendering for the main experience.
- [ ] Do not make the homepage a generic marketing landing page.
- [ ] Do not hide content behind a puzzle, command palette, game, or forced exploration flow.
- [ ] Do not hand-edit `assets/tailwind.css`; edit `tailwind.css` and let Dioxus/Tailwind generate the browser stylesheet.
- [ ] Do not use removed Dioxus APIs such as `cx`, `Scope`, or `use_state`.

## 2. Current Baseline

### 2.1 Framework

- [ ] Confirm app remains Dioxus `0.7`.
- [ ] Keep `dioxus::launch(App)` in `src/main.rs`.
- [ ] Keep Dioxus Router with the existing `Route` enum.
- [ ] Keep Dioxus Fullstack-compatible dependency setup.
- [ ] Keep component props owned and `Clone + PartialEq` where needed.

### 2.2 Styling

- [ ] Keep Tailwind v4 source in root `tailwind.css`.
- [ ] Keep generated CSS linked through `asset!("/assets/tailwind.css")`.
- [ ] Use utility classes for most layout and styling.
- [ ] Add custom CSS only for reusable blueprint primitives, SVG animation, markdown styling, and reduced-motion handling.
- [ ] Maintain dark-only visual system.

### 2.3 Routing

- [ ] Preserve current route list:
  - [ ] `/`
  - [ ] `/projects`
  - [ ] `/projects/:slug`
  - [ ] `/writing`
  - [ ] `/writing/:slug`
  - [ ] `/contact`
  - [ ] catch-all 404
- [ ] Preserve `PortfolioLayout` as the shared route layout.
- [ ] Add active-route visual treatment if possible with Dioxus Router APIs.
- [ ] Ensure route changes still work without custom client-side animation requirements.

### 2.4 Data And Content

- [ ] Preserve `src/data.rs` as the typed content boundary.
- [ ] Keep local TOML project content.
- [ ] Keep local Markdown writing content.
- [ ] Keep raw HTML escaping behavior for Markdown rendering.
- [ ] Keep static contact links only.
- [ ] Consider extending content structs only if the blueprint design needs richer project detail.
- [ ] Avoid introducing runtime filesystem assumptions that would not hold on Cloudflare Workers.

### 2.5 Existing UI Pattern

- [ ] Current app uses simple dark cards, emerald accent, sticky nav, route-level pages, project cards, writing cards, contact cards, and skeleton previews.
- [ ] Reuse useful pieces where possible:
  - [ ] `ProjectCard`
  - [ ] `Footer`
  - [ ] skeleton components
  - [ ] markdown body styles
- [ ] Replace placeholder language and visible skeleton preview details during redesign.

## 3. Brand And Product Positioning

### 3.1 Core Message

- [ ] Homepage message should communicate:
  - [ ] Edgar Christian
  - [ ] Software Engineer
  - [ ] Secure, pragmatic web systems
  - [ ] Rust, Dioxus, Cloudflare
  - [ ] Frontend engineering with attention to responsive UX and system safety
- [ ] Avoid vague claims such as "crafting digital experiences."
- [ ] Prefer concrete statements:
  - [ ] "Building secure, responsive web systems with Rust, Dioxus, and Cloudflare."
  - [ ] "Interfaces that stay fast, inspectable, and stable across breakpoints."
  - [ ] "Security-first content, static contact, and edge-ready deployment."

### 3.2 Visitor Priorities

- [ ] First-time visitor should be able to answer within 10 seconds:
  - [ ] Who is this?
  - [ ] What does he build?
  - [ ] Where are the projects?
  - [ ] Is there writing?
  - [ ] How do I contact him?
- [ ] Technical visitor should quickly see:
  - [ ] Dioxus 0.7
  - [ ] Rust
  - [ ] Cloudflare Workers
  - [ ] static content validation
  - [ ] reduced-motion and responsive care
- [ ] Non-technical visitor should still understand:
  - [ ] secure websites
  - [ ] fast interfaces
  - [ ] reliable systems
  - [ ] clear communication

## 4. Visual System

### 4.1 Theme

- [ ] Keep dark-only.
- [ ] Avoid pure black for the main background.
- [ ] Use a graphite/ink base rather than current plain zinc-only look.
- [ ] Keep high-contrast text.
- [ ] Keep muted text accessible on dark backgrounds.
- [ ] Use accent colors sparingly and intentionally.

### 4.2 Color Direction

- [ ] Define semantic CSS variables in `tailwind.css` for:
  - [ ] `--blueprint-bg`
  - [ ] `--blueprint-panel`
  - [ ] `--blueprint-panel-strong`
  - [ ] `--blueprint-line`
  - [ ] `--blueprint-line-muted`
  - [ ] `--blueprint-text`
  - [ ] `--blueprint-muted`
  - [ ] `--blueprint-accent`
  - [ ] `--blueprint-accent-2`
  - [ ] `--blueprint-warning`
  - [ ] `--blueprint-success`
- [ ] Candidate palette:
  - [ ] Background: deep graphite, near `#080a0d` or `#090b10`.
  - [ ] Panel: `#0f1319`.
  - [ ] Strong panel: `#151b23`.
  - [ ] Primary text: soft white, near `#f4f7fb`.
  - [ ] Secondary text: cool gray, near `#a7b0bd`.
  - [ ] Blueprint line: muted cyan, near `#4fbfd4`.
  - [ ] Accent: cyan or aqua for structural lines.
  - [ ] Secondary accent: amber for active breakpoint/status.
  - [ ] Success: muted green, not neon.
- [ ] Do not let the UI become one-note cyan.
- [ ] Use amber, gray, and white to prevent a monochrome blue theme.
- [ ] Run a visual scan after implementation to make sure the palette is not dominated by a single hue family.

### 4.3 Typography

- [ ] Use system sans by default for performance.
- [ ] Use system mono only for metadata labels, coordinates, route labels, and code snippets.
- [ ] Keep heading sizes controlled:
  - [ ] Mobile hero heading around `text-4xl`.
  - [ ] Tablet/desktop hero heading around `text-5xl` to `text-6xl`.
  - [ ] Cards and panels use compact headings.
- [ ] Do not scale font sizes with viewport width.
- [ ] Keep letter spacing at normal for body and headings.
- [ ] Only use uppercase tracking for small metadata labels.
- [ ] Ensure line lengths stay readable:
  - [ ] Body copy max around `65ch`.
  - [ ] Technical descriptions max around `72ch`.

### 4.4 Shape And Surface Rules

- [ ] Use small radii only, preferably `4px` to `8px`.
- [ ] Do not nest cards inside cards.
- [ ] Use cards only for repeated items, panels, modals, and framed tool-like surfaces.
- [ ] Use full-width page bands or unframed constrained layouts for sections.
- [ ] Blueprint frames can border sections, but avoid making every section a floating card.
- [ ] Use thin borders and low-contrast structural lines.
- [ ] Use stable dimensions for repeated modules.

### 4.5 Blueprint Language

- [ ] Create visual motifs:
  - [ ] coordinate labels
  - [ ] breakpoint markers
  - [ ] thin frame corners
  - [ ] measurement ticks
  - [ ] connecting SVG paths
  - [ ] module labels
  - [ ] status stamps
- [ ] Keep motifs functional:
  - [ ] Show responsive breakpoints.
  - [ ] Show project status.
  - [ ] Show route location.
  - [ ] Show content type.
- [ ] Avoid decorative clutter.
- [ ] Avoid fake complexity.

## 5. Motion System

### 5.1 Motion Principles

- [ ] Prefer CSS and SVG animation.
- [ ] Treat no custom JavaScript as a hard constraint for the design layer.
- [ ] Use CSS media queries, CSS variables, SVG, Dioxus-rendered markup, and Tailwind utilities before considering any runtime animation tool.
- [ ] A large animation framework is acceptable only after an explicit decision and only if:
  - [ ] it respects the browser `prefers-reduced-motion` flag.
  - [ ] it can disable nonessential animation globally.
  - [ ] it does not hide content before hydration or runtime startup.
  - [ ] it does not require custom JavaScript authoring.
  - [ ] it does not create scroll hijacking or forced experience flows.
  - [ ] it does not materially hurt first paint or mobile responsiveness.
- [ ] Animate cheap properties:
  - [ ] opacity
  - [ ] transform
  - [ ] stroke-dashoffset
  - [ ] color
  - [ ] background-color
  - [ ] border-color
- [ ] Avoid layout-triggering animation:
  - [ ] width
  - [ ] height
  - [ ] top
  - [ ] left
  - [ ] margin
  - [ ] expensive filters
- [ ] Default duration range:
  - [ ] micro feedback: `120ms` to `180ms`
  - [ ] section entrance: `180ms` to `260ms`
  - [ ] SVG path draw: `500ms` to `900ms`
- [ ] Use motion to show orientation, hierarchy, or feedback.
- [ ] Respect `prefers-reduced-motion`.

### 5.2 Required Motion Primitives

- [ ] Page entrance:
  - [ ] subtle fade and translate
  - [ ] keep current `page-motion` concept or replace with blueprint-named equivalent
- [ ] Section entrance:
  - [ ] staggered content reveal
  - [ ] no more than two or three delay levels
- [ ] Card interaction:
  - [ ] border/highlight shift
  - [ ] subtle translate or frame-line reveal
  - [ ] no large hover movement
- [ ] SVG blueprint draw:
  - [ ] stroke path draws once on load
  - [ ] reduced motion disables drawing
  - [ ] final static SVG still communicates layout
- [ ] Breakpoint indicator:
  - [ ] active marker changes through CSS media queries
  - [ ] no JavaScript required
- [ ] Route/nav indicator:
  - [ ] active or hover state feels like a drafting marker sliding or locking into place

### 5.3 Reduced Motion

- [ ] Keep all content visible when motion is disabled.
- [ ] Disable path draw animation under `prefers-reduced-motion: reduce`.
- [ ] Disable card lift under reduced motion.
- [ ] Keep color and border feedback under reduced motion.
- [ ] Do not rely on motion as the only state signal.

## 6. Responsive System

### 6.1 Breakpoints

- [ ] Preserve the three primary breakpoints from the spec:
  - [ ] Mobile: `0px - 639px`
  - [ ] Tablet: `640px - 1023px`
  - [ ] Desktop: `1024px+`
- [ ] The design should visibly acknowledge these breakpoints.
- [ ] The layout should change intentionally across breakpoints.
- [ ] No content should become inaccessible at any viewport.

### 6.2 Mobile Layout

- [ ] Single-column layout.
- [ ] Header should not consume too much vertical space.
- [ ] Navigation must remain accessible and touch-friendly.
- [ ] Minimum target size: `44px` for key touch interactions.
- [ ] Blueprint diagram should become a vertical route/measurement rail.
- [ ] Project modules stack with stable spacing.
- [ ] Avoid hover-only interactions.
- [ ] Ensure long project titles wrap cleanly.
- [ ] Ensure metadata chips wrap without causing awkward layout jumps.

### 6.3 Tablet Layout

- [ ] Use two-column opportunities where content benefits:
  - [ ] hero text plus compact blueprint frame
  - [ ] project cards in two columns
  - [ ] capability modules in two columns
- [ ] Keep reading pages constrained.
- [ ] Avoid squeezed multi-column dense layouts.
- [ ] Maintain comfortable spacing and clear section boundaries.

### 6.4 Desktop Layout

- [ ] Use constrained max width around current `max-w-6xl` or slightly wider if blueprint frame needs space.
- [ ] Hero can use asymmetric grid:
  - [ ] text area
  - [ ] live blueprint SVG/frame
- [ ] Project modules can use two or three columns depending on card density.
- [ ] Writing should remain readable, not full-width.
- [ ] The blueprint layer must not compete with content.

### 6.5 Dynamic Responsive Behavior

- [ ] Implement visible breakpoint changes with CSS:
  - [ ] different SVG frame orientation
  - [ ] active breakpoint labels
  - [ ] grid changes
  - [ ] content rail changes
- [ ] Do not use JavaScript resize listeners.
- [ ] Use CSS media queries and responsive markup for breakpoint behavior.
- [ ] Ensure breakpoint transitions do not animate layout properties directly.
- [ ] Use opacity and transform changes around breakpoint-specific elements.

## 7. Information Architecture

### 7.1 Global Layout

- [ ] Redesign `PortfolioLayout`.
- [ ] Header requirements:
  - [ ] brand/home link remains visible.
  - [ ] nav links: Projects, Writing, Contact.
  - [ ] visible focus states.
  - [ ] active route indication if feasible.
  - [ ] sticky behavior should remain if it does not hurt mobile.
- [ ] Main requirements:
  - [ ] keep semantic `main`.
  - [ ] apply page-level blueprint background or frame.
  - [ ] avoid wrapping every route in excessive visual chrome.
- [ ] Footer requirements:
  - [ ] include copyright.
  - [ ] include email.
  - [ ] include concise build/runtime note if useful.
  - [ ] align with blueprint visual language.

### 7.2 Homepage

- [ ] Redesign the homepage as the main blueprint experience.
- [ ] Proposed section order:
  - [ ] Hero blueprint frame.
  - [ ] Breakpoint strip / responsive proof.
  - [ ] Featured project modules.
  - [ ] Capability blueprint.
  - [ ] Writing preview.
  - [ ] Contact band.
- [ ] The first viewport must show:
  - [ ] Edgar Christian.
  - [ ] Role / positioning.
  - [ ] at least one direct action.
  - [ ] a clear visual signal of the blueprint concept.
  - [ ] a hint of the next section.
- [ ] Avoid oversized empty hero.
- [ ] Avoid marketing copy that delays access to projects.

### 7.3 Projects Index

- [ ] Replace generic "Selected Work" presentation with blueprint modules.
- [ ] Show project metadata clearly:
  - [ ] title
  - [ ] year
  - [ ] status
  - [ ] role
  - [ ] technologies
  - [ ] short summary
- [ ] Consider grouping or visual sorting by:
  - [ ] In Progress
  - [ ] Planned
  - [ ] Archived
- [ ] Full card remains clickable.
- [ ] Remove visible skeleton preview details from production UI.
- [ ] Add an empty-state pattern only if future filters are added.

### 7.4 Project Detail

- [ ] Redesign project detail pages as blueprint case studies.
- [ ] Required content structure:
  - [ ] title
  - [ ] summary
  - [ ] status/year/role
  - [ ] technologies
  - [ ] problem
  - [ ] constraints
  - [ ] approach
  - [ ] implementation notes
  - [ ] current state/outcome
  - [ ] next steps if planned
- [ ] Current project TOML does not yet include all required fields.
- [ ] Decide whether to:
  - [ ] extend project TOML schema
  - [ ] create Markdown-backed project case studies
  - [ ] keep first pass lightweight and expand later
- [ ] Avoid showing placeholder text as if it were real case study content.
- [ ] Keep not-found behavior clear and route-safe.

### 7.5 Writing Index

- [ ] Redesign writing cards with blueprint record styling.
- [ ] Show:
  - [ ] title
  - [ ] published date
  - [ ] summary
  - [ ] tags
  - [ ] read affordance
- [ ] Maintain full-card links.
- [ ] Remove visible skeleton preview details.
- [ ] Keep line lengths readable.

### 7.6 Writing Post

- [ ] Preserve safe Markdown rendering.
- [ ] Improve markdown typography for blueprint theme.
- [ ] Add article metadata frame:
  - [ ] published date
  - [ ] tags
  - [ ] content type
  - [ ] back link
- [ ] Ensure code blocks are horizontally scrollable.
- [ ] Ensure headings have adequate spacing.
- [ ] Remove visible skeleton preview details.

### 7.7 Contact

- [ ] Keep contact static and simple.
- [ ] Present contact links as endpoints or records.
- [ ] Keep `mailto:` and external links.
- [ ] Preserve safe external link attributes.
- [ ] Avoid contact form.
- [ ] Add concise trust copy:
  - [ ] no message collection
  - [ ] static contact links
  - [ ] verified external profile

### 7.8 Not Found

- [ ] Redesign 404 as a blueprint route miss.
- [ ] Show requested path safely.
- [ ] Provide route back to Home and/or Projects.
- [ ] Do not expose internal implementation details.

## 8. Component Architecture

### 8.1 Existing Components To Keep Or Refactor

- [ ] `Footer`
  - [ ] Refactor to blueprint style.
  - [ ] Keep profile email from data.
- [ ] `ProjectCard`
  - [ ] Refactor into blueprint module card.
  - [ ] Keep full-card link behavior.
  - [ ] Add stable metadata layout.
- [ ] Skeleton components
  - [ ] Keep available for future delayed states.
  - [ ] Style them to match blueprint surfaces if retained.
  - [ ] Do not show skeleton previews on production pages.

### 8.2 New Components To Add

- [ ] `BlueprintFrame`
  - [ ] Purpose: reusable section frame with optional label and coordinate text.
  - [ ] Props:
    - [ ] `label: String`
    - [ ] `children: Element` or children props pattern supported by Dioxus 0.7
    - [ ] optional class string if local pattern supports it
- [ ] `BlueprintHero`
  - [ ] Purpose: homepage hero with identity, CTAs, and SVG diagram.
  - [ ] Contains responsive blueprint SVG.
- [ ] `BreakpointStrip`
  - [ ] Purpose: visible mobile/tablet/desktop indicator.
  - [ ] Pure CSS active states via media queries.
- [ ] `BlueprintDiagram`
  - [ ] Purpose: SVG responsive frame/diagram.
  - [ ] Should render meaningful static SVG even without animation.
- [ ] `BlueprintModule`
  - [ ] Purpose: generic project/writing/contact record shell.
  - [ ] Avoid over-abstraction if project and writing layouts diverge significantly.
- [ ] `StatusBadge`
  - [ ] Purpose: consistent status display for In Progress, Planned, Archived.
  - [ ] Use label + color, not color alone.
- [ ] `TechTag`
  - [ ] Purpose: consistent compact technology chip.
- [ ] `CapabilityGrid`
  - [ ] Purpose: show engineering capabilities on homepage.
- [ ] `SectionHeading`
  - [ ] Purpose: consistent section headings with label, title, and description.
- [ ] `ContactEndpoint`
  - [ ] Purpose: blueprint-styled contact link.

### 8.3 Component Boundaries

- [ ] Keep route-level composition in `src/views`.
- [ ] Keep reusable visual primitives in `src/components`.
- [ ] Do not place large page-specific sections into `components` unless reused.
- [ ] Avoid a single massive `home.rs` if the homepage becomes too large.
- [ ] Prefer simple components over a generic design-system abstraction if only used once.

### 8.4 Dioxus 0.7 Rules

- [ ] Use `#[component]`.
- [ ] Return `Element`.
- [ ] Use `use_signal` only if state is necessary.
- [ ] Avoid unnecessary state; most blueprint behavior should be CSS/SVG.
- [ ] Props should be owned values.
- [ ] Props should implement `Clone` and `PartialEq`.
- [ ] Use `ReadOnlySignal` only if a prop needs reactive behavior.
- [ ] Use `asset!` for local assets.
- [ ] Use `document::Link` or `document::Stylesheet` for document assets.

## 9. Content Model Plan

### 9.1 Profile Content

- [ ] Keep existing fields:
  - [ ] name
  - [ ] role
  - [ ] summary
  - [ ] email
- [ ] Consider adding optional fields:
  - [ ] `location`
  - [ ] `availability`
  - [ ] `focus`
  - [ ] `stack`
- [ ] Only add fields if they are displayed.

### 9.2 Project Content

- [ ] Current fields:
  - [ ] title
  - [ ] slug
  - [ ] summary
  - [ ] detail
  - [ ] year
  - [ ] status
  - [ ] role
  - [ ] technologies
  - [ ] featured
- [ ] Proposed optional additions:
  - [ ] `problem`
  - [ ] `constraints`
  - [ ] `decisions`
  - [ ] `outcome`
  - [ ] `next_steps`
  - [ ] `links`
  - [ ] `artifact_label`
  - [ ] `blueprint_axis`
- [ ] Decide whether project details should remain TOML-only.
- [ ] Consider Markdown-backed project case studies if detail text becomes long.
- [ ] Update validation tests for every new content field.

### 9.3 Writing Content

- [ ] Keep current Markdown frontmatter:
  - [ ] title
  - [ ] slug
  - [ ] summary
  - [ ] published
  - [ ] tags
- [ ] Consider adding:
  - [ ] `reading_time`
  - [ ] `category`
  - [ ] `updated`
- [ ] Avoid adding metadata that is not displayed.

### 9.4 Contact Content

- [ ] Keep current fields:
  - [ ] label
  - [ ] href
  - [ ] detail
  - [ ] external
- [ ] Consider adding:
  - [ ] `kind` such as email, code, profile
  - [ ] `verified`
- [ ] Maintain URL validation:
  - [ ] `mailto:`
  - [ ] `https://`

## 10. Page-Level Implementation Tasks

### 10.1 Layout Shell

- [ ] Update `src/views/layout.rs`.
- [ ] Replace current generic dark shell with blueprint background.
- [ ] Add subtle page grid or frame through CSS pseudo-elements where possible.
- [ ] Keep semantic `header`, `nav`, `main`, `footer`.
- [ ] Ensure nav wraps gracefully on mobile.
- [ ] Add active/hover/focus treatments.
- [ ] Ensure sticky header background remains readable over blueprint lines.
- [ ] Test header at:
  - [ ] 320px width
  - [ ] 390px width
  - [ ] 768px width
  - [ ] 1024px width
  - [ ] 1440px width

### 10.2 Homepage

- [ ] Update `src/views/home.rs`.
- [ ] Build hero layout:
  - [ ] eyebrow/coordinate label
  - [ ] name
  - [ ] positioning statement
  - [ ] primary CTA to Projects
  - [ ] secondary CTA to Writing or Contact
  - [ ] blueprint SVG diagram
- [ ] Build breakpoint strip:
  - [ ] mobile label
  - [ ] tablet label
  - [ ] desktop label
  - [ ] active state via CSS media queries
- [ ] Build featured project section:
  - [ ] title
  - [ ] explanatory copy
  - [ ] featured project cards
  - [ ] link to all projects
- [ ] Build capability section:
  - [ ] secure content boundaries
  - [ ] responsive interface systems
  - [ ] edge-ready deployment
  - [ ] progressive loading states
- [ ] Build writing preview:
  - [ ] latest writing card
  - [ ] link to writing index
- [ ] Build contact band:
  - [ ] brief availability/contact copy
  - [ ] email link
  - [ ] Codeberg link if useful
- [ ] Ensure first viewport is not empty below hero.
- [ ] Ensure hero does not overflow on mobile.

### 10.3 Projects Index

- [ ] Update `src/views/projects.rs`.
- [ ] Replace placeholder intro copy.
- [ ] Use `SectionHeading`.
- [ ] Add project count or status summary if useful.
- [ ] Use blueprint-styled project modules.
- [ ] Remove `details` skeleton preview from visible route.
- [ ] Consider status grouping:
  - [ ] In Progress first
  - [ ] Planned next
  - [ ] Archived last
- [ ] If grouping is implemented, avoid complex runtime state.
- [ ] Ensure cards are full-card links.
- [ ] Ensure card heights remain stable in grid.

### 10.4 Project Detail

- [ ] Update `src/views/project_detail.rs`.
- [ ] Replace current placeholder paragraph about future content.
- [ ] Add top metadata frame:
  - [ ] role
  - [ ] status
  - [ ] year
- [ ] Add technology tag group.
- [ ] Add case-study sections based on available content.
- [ ] If content model is not expanded yet, use current `detail` honestly and avoid fake sections.
- [ ] Remove `details` skeleton preview.
- [ ] Keep not-found state.
- [ ] Style not-found state with blueprint route-miss language.

### 10.5 Writing Index

- [ ] Update `src/views/writing.rs`.
- [ ] Replace placeholder copy about content model with visitor-facing copy.
- [ ] Use blueprint writing records.
- [ ] Remove visible skeleton preview.
- [ ] Ensure writing cards have:
  - [ ] date
  - [ ] title
  - [ ] summary
  - [ ] tags
  - [ ] read affordance
- [ ] Ensure full-card link behavior remains.

### 10.6 Writing Post

- [ ] Update `WritingPost` in `src/views/writing.rs` or split into separate file if it grows.
- [ ] Add blueprint article header.
- [ ] Keep safe `dangerous_inner_html` output from sanitized renderer.
- [ ] Update markdown styling in `tailwind.css`.
- [ ] Remove skeleton preview.
- [ ] Ensure code block styles match blueprint theme.
- [ ] Ensure mobile code blocks scroll horizontally.

### 10.7 Contact Page

- [ ] Update `src/views/contact.rs`.
- [ ] Replace generic "Static Contact Links" title with stronger copy.
- [ ] Present links as contact endpoints.
- [ ] Show external link behavior clearly.
- [ ] Keep static link-only approach.
- [ ] Ensure email link works.
- [ ] Ensure external links use `target="_blank"` and `rel="noopener noreferrer"`.

### 10.8 404 Page

- [ ] Update `src/views/not_found.rs`.
- [ ] Use blueprint route-miss visual.
- [ ] Show requested path in a code-style token.
- [ ] Provide direct home link.
- [ ] Optionally provide projects link.

## 11. CSS Implementation Plan

### 11.1 File Rules

- [ ] Edit only `tailwind.css` for source CSS.
- [ ] Do not directly edit generated `assets/tailwind.css`.
- [ ] Let `dx serve` or `dx build` regenerate generated CSS.

### 11.2 CSS Layers

- [ ] Keep custom classes under `@layer components`.
- [ ] Add blueprint custom properties near the top.
- [ ] Keep keyframes near the bottom.
- [ ] Keep reduced-motion overrides near the bottom.

### 11.3 Proposed Classes

- [ ] `.blueprint-page`
  - [ ] page-level background and grid effect.
- [ ] `.blueprint-shell`
  - [ ] constrained main layout.
- [ ] `.blueprint-frame`
  - [ ] bordered frame with corner ticks.
- [ ] `.blueprint-label`
  - [ ] small uppercase/mono metadata label.
- [ ] `.blueprint-line`
  - [ ] shared SVG stroke behavior.
- [ ] `.blueprint-draw`
  - [ ] stroke-dash path drawing.
- [ ] `.blueprint-module`
  - [ ] card/module surface.
- [ ] `.blueprint-module-link`
  - [ ] full-card link interaction.
- [ ] `.blueprint-chip`
  - [ ] technology/status chip base.
- [ ] `.blueprint-status-*`
  - [ ] status-specific treatment.
- [ ] `.breakpoint-strip`
  - [ ] responsive indicator container.
- [ ] `.breakpoint-mobile`
  - [ ] active on mobile.
- [ ] `.breakpoint-tablet`
  - [ ] active on tablet.
- [ ] `.breakpoint-desktop`
  - [ ] active on desktop.

### 11.4 Background Grid

- [ ] Implement a subtle blueprint grid with CSS gradients.
- [ ] Keep opacity low.
- [ ] Ensure text contrast remains high.
- [ ] Disable or simplify grid if it causes visual noise on mobile.
- [ ] Avoid animated background grid.

### 11.5 SVG Styling

- [ ] SVG should use `currentColor` or CSS variables where possible.
- [ ] Set stable `viewBox`.
- [ ] Use `preserveAspectRatio` intentionally.
- [ ] Keep SVG DOM small.
- [ ] Avoid huge inline SVG if an asset file is better.
- [ ] Prefer inline SVG for components that need CSS animation tied to current theme.

### 11.6 Markdown Styling

- [ ] Update `.markdown-body` colors.
- [ ] Add heading anchor spacing if anchors are introduced.
- [ ] Style blockquotes if needed.
- [ ] Style tables if writing uses tables.
- [ ] Keep code blocks accessible and readable.
- [ ] Keep link styles visibly distinct from body text.

## 12. Asset Plan

### 12.1 Existing Assets

- [ ] Keep `assets/favicon.ico`.
- [ ] Decide whether `assets/logo-cropped.png` is needed.
- [ ] Decide whether `assets/header.svg` fits the new blueprint direction.
- [ ] If `header.svg` is reused:
  - [ ] inspect colors
  - [ ] ensure it respects reduced motion if embedded
  - [ ] avoid clashing with new blueprint visual language
- [ ] If `header.svg` is not reused:
  - [ ] leave it unless cleanup is explicitly requested later
  - [ ] do not delete unrelated assets in this phase

### 12.2 New SVGs

- [ ] Create SVGs as Dioxus components when they need responsive CSS hooks.
- [ ] Create SVG files in `assets/` only when they are static decorative assets.
- [ ] Add meaningful `aria-hidden="true"` to decorative SVGs.
- [ ] Provide text alternatives only if SVG conveys unique content not available nearby.

## 13. Accessibility Plan

### 13.1 Semantics

- [ ] Preserve semantic landmarks:
  - [ ] `header`
  - [ ] `nav`
  - [ ] `main`
  - [ ] `section`
  - [ ] `article`
  - [ ] `footer`
- [ ] Use headings in logical order.
- [ ] Avoid heading jumps caused by purely visual labels.
- [ ] Use `p`, `dl`, `ul`, and `article` appropriately.

### 13.2 Keyboard

- [ ] All links must be keyboard reachable.
- [ ] Full-card links must have visible focus.
- [ ] Focus rings must have sufficient contrast.
- [ ] Avoid focus styles hidden by overflow clipping.
- [ ] Ensure sticky header does not obscure focused content after navigation.

### 13.3 Color And State

- [ ] Status must use labels, not color alone.
- [ ] Active breakpoint indicator must include text label.
- [ ] Links must be visually distinguishable.
- [ ] Check contrast for:
  - [ ] body text
  - [ ] muted text
  - [ ] borders
  - [ ] accent links
  - [ ] focus rings
  - [ ] status badges

### 13.4 Motion And Reduced Motion

- [ ] Test with `prefers-reduced-motion: reduce`.
- [ ] Confirm no essential content is hidden before animation.
- [ ] Confirm SVG draw animation is disabled.
- [ ] Confirm hover/focus still gives non-motion feedback.

### 13.5 Mobile Accessibility

- [ ] Tap targets at least `44px`.
- [ ] No text overlap.
- [ ] No horizontal page scroll.
- [ ] Navigation remains usable at narrow widths.
- [ ] Cards have enough spacing for touch.

## 14. Performance Plan

### 14.1 Runtime

- [ ] Keep interactions CSS-first.
- [ ] Do not add custom JavaScript.
- [ ] Do not add JavaScript animation, resize, scroll, or interaction code.
- [ ] Dioxus-generated runtime/bootstrap code is acceptable as part of the framework; the redesign itself should not add handwritten JS.
- [ ] If a large animation framework is proposed, document why CSS/SVG is insufficient and verify reduced-motion behavior before implementation.
- [ ] Avoid large rendering loops.
- [ ] Avoid canvas/WebGPU for the chosen direction.
- [ ] Avoid hydration-sensitive browser APIs unless placed in `use_effect`.

### 14.2 CSS

- [ ] Keep custom CSS modest.
- [ ] Avoid heavy filters/backdrop effects over large areas.
- [ ] Use `backdrop-blur` sparingly because sticky headers can be expensive.
- [ ] Avoid constantly running animations.
- [ ] SVG path draw should run once, not indefinitely.

### 14.3 Assets

- [ ] Avoid large raster hero images.
- [ ] Prefer compact SVG for blueprint visuals.
- [ ] Ensure unused heavy assets are not newly referenced.

### 14.4 Build

- [ ] Ensure `dx build --platform web --release` still succeeds.
- [ ] Ensure release output remains compatible with Cloudflare asset serving.

## 15. Security And Content Safety

- [ ] Preserve Markdown raw HTML escaping.
- [ ] Keep `dangerous_inner_html` only for rendered sanitized Markdown.
- [ ] Do not add unvalidated external URLs.
- [ ] Keep contact link validation.
- [ ] Keep project slug validation.
- [ ] Keep writing slug validation.
- [ ] Keep content tests updated when schema changes.
- [ ] Do not add APIs or server functions unless necessary.
- [ ] If server functions are later added, gate them correctly and validate input.

## 16. Implementation Phases

### Phase 1: Design Tokens And CSS Foundation

- [ ] Add blueprint CSS variables.
- [ ] Add page background and grid.
- [ ] Add motion primitives.
- [ ] Add reduced-motion overrides.
- [ ] Add base blueprint utility classes.
- [ ] Update markdown theme to align with blueprint direction.
- [ ] Verify `cargo fmt --check` not affected by CSS-only changes.
- [ ] Run `dx check` if available after CSS integration.

### Phase 2: Component Primitives

- [ ] Add `BlueprintFrame`.
- [ ] Add `SectionHeading`.
- [ ] Add `StatusBadge`.
- [ ] Add `TechTag`.
- [ ] Add `BreakpointStrip`.
- [ ] Add `BlueprintDiagram`.
- [ ] Refactor `ProjectCard`.
- [ ] Refactor `Footer`.
- [ ] Export new components through `src/components/mod.rs`.
- [ ] Run `cargo fmt`.
- [ ] Run `cargo check`.

### Phase 3: Layout Shell

- [ ] Update `PortfolioLayout`.
- [ ] Apply blueprint page class.
- [ ] Update header/nav styling.
- [ ] Add active/hover/focus nav treatments.
- [ ] Update main spacing.
- [ ] Update footer placement and style.
- [ ] Verify all routes still render.

### Phase 4: Homepage

- [ ] Replace current hero.
- [ ] Add responsive blueprint diagram.
- [ ] Add breakpoint strip.
- [ ] Add featured project modules.
- [ ] Add capabilities.
- [ ] Add writing preview.
- [ ] Add contact band.
- [ ] Remove placeholder copy.
- [ ] Verify mobile first viewport.
- [ ] Verify desktop first viewport.

### Phase 5: Project Routes

- [ ] Update projects index.
- [ ] Remove skeleton preview.
- [ ] Update project detail layout.
- [ ] Remove project detail placeholder copy.
- [ ] Decide whether to extend project content schema.
- [ ] If schema changes:
  - [ ] update TOML files
  - [ ] update structs
  - [ ] update validation
  - [ ] update tests
- [ ] Verify project not-found route.

### Phase 6: Writing Routes

- [ ] Update writing index.
- [ ] Remove skeleton preview.
- [ ] Update writing post header.
- [ ] Remove writing post skeleton preview.
- [ ] Update markdown styling.
- [ ] Verify Markdown code blocks.
- [ ] Verify writing not-found route.

### Phase 7: Contact And 404

- [ ] Update contact page.
- [ ] Update contact endpoint cards.
- [ ] Update 404 page.
- [ ] Verify external link attributes.
- [ ] Verify mailto link.

### Phase 8: Responsive QA

- [ ] Test at 320px width.
- [ ] Test at 375px width.
- [ ] Test at 390px width.
- [ ] Test at 640px width.
- [ ] Test at 768px width.
- [ ] Test at 1024px width.
- [ ] Test at 1280px width.
- [ ] Test at 1440px width.
- [ ] Confirm no horizontal scroll.
- [ ] Confirm text does not overlap.
- [ ] Confirm buttons fit labels.
- [ ] Confirm project cards remain stable.
- [ ] Confirm blueprint diagram does not crowd text.

### Phase 9: Accessibility QA

- [ ] Keyboard tab through all pages.
- [ ] Verify focus visibility.
- [ ] Verify headings order.
- [ ] Verify landmarks.
- [ ] Verify link labels.
- [ ] Verify reduced motion.
- [ ] Verify color contrast manually or with tooling.
- [ ] Verify screen-reader-hidden decorative SVGs are marked correctly.

### Phase 10: Build And Checks

- [ ] Run `cargo fmt --check`.
- [ ] Run `cargo test`.
- [ ] Run `cargo clippy --all-targets --no-default-features --features web -- -D warnings`.
- [ ] Run `dx check`.
- [ ] Run `dx build --platform web --release`.
- [ ] If npm scripts are preferred, run:
  - [ ] `npm run fmt:check`
  - [ ] `npm test`
  - [ ] `npm run clippy`
  - [ ] `npm run dx:check`
  - [ ] `npm run build`

### Phase 11: Visual QA

- [ ] Start local dev server with `dx serve`.
- [ ] Capture desktop screenshots:
  - [ ] home
  - [ ] projects
  - [ ] project detail
  - [ ] writing
  - [ ] writing post
  - [ ] contact
  - [ ] 404
- [ ] Capture mobile screenshots:
  - [ ] home
  - [ ] projects
  - [ ] writing
  - [ ] contact
- [ ] Capture reduced-motion screenshot.
- [ ] Inspect for:
  - [ ] overlap
  - [ ] clipped text
  - [ ] awkward wrapping
  - [ ] low contrast
  - [ ] excessive decoration
  - [ ] broken SVG framing
  - [ ] sticky header issues

## 17. File-Level Change Map

### 17.1 Likely Edited Files

- [ ] `tailwind.css`
  - [ ] blueprint variables
  - [ ] background grid
  - [ ] frame classes
  - [ ] SVG animation
  - [ ] responsive indicator CSS
  - [ ] markdown style updates
  - [ ] reduced-motion rules
- [ ] `src/views/layout.rs`
  - [ ] page shell
  - [ ] nav
  - [ ] main wrapper
- [ ] `src/views/home.rs`
  - [ ] full homepage redesign
- [ ] `src/views/projects.rs`
  - [ ] project index redesign
- [ ] `src/views/project_detail.rs`
  - [ ] project detail redesign
- [ ] `src/views/writing.rs`
  - [ ] writing index and article redesign
- [ ] `src/views/contact.rs`
  - [ ] contact endpoint redesign
- [ ] `src/views/not_found.rs`
  - [ ] 404 redesign
- [ ] `src/components/mod.rs`
  - [ ] export new components
- [ ] `src/components/footer.rs`
  - [ ] footer redesign
- [ ] `src/components/project_card.rs`
  - [ ] project card redesign

### 17.2 Possible New Files

- [ ] `src/components/blueprint_frame.rs`
- [ ] `src/components/blueprint_diagram.rs`
- [ ] `src/components/breakpoint_strip.rs`
- [ ] `src/components/section_heading.rs`
- [ ] `src/components/status_badge.rs`
- [ ] `src/components/tech_tag.rs`
- [ ] `src/components/contact_endpoint.rs`
- [ ] `src/components/capability_grid.rs`

### 17.3 Possible Content Files

- [ ] Existing `content/projects/*.toml` may be extended if case-study fields are added.
- [ ] Existing `content/profile.toml` may be extended if availability/focus fields are displayed.
- [ ] Existing `content/contact.toml` may be extended if contact kind/verified fields are displayed.

### 17.4 Files Not To Touch Unless Needed

- [ ] `assets/tailwind.css` should not be hand-edited.
- [ ] `Cargo.lock` should not change unless dependencies change.
- [ ] `Cargo.toml` should not need changes for this direction.
- [ ] `wrangler.toml` should not need changes for design work.
- [ ] Deleted renderer files should not be restored or removed unless the user requests cleanup.

## 18. Content Copy Drafts

### 18.1 Homepage Hero Draft

- [ ] Eyebrow: `Responsive Blueprint / Edge-ready UI`
- [ ] Heading: `Edgar Christian`
- [ ] Body option A: `Software engineer building secure, responsive web systems with Rust, Dioxus, and Cloudflare.`
- [ ] Body option B: `I build pragmatic interfaces with stable layouts, validated content, and edge-ready deployment paths.`
- [ ] Primary CTA: `View projects`
- [ ] Secondary CTA: `Read notes` or `Contact`

### 18.2 Capability Drafts

- [ ] `Responsive systems`: `Layouts that keep their shape across mobile, tablet, and desktop.`
- [ ] `Content boundaries`: `Typed local content, safe Markdown rendering, and validated links.`
- [ ] `Edge delivery`: `Cloudflare-focused deployment with a small runtime surface.`
- [ ] `Progressive states`: `Skeletons and loading patterns that preserve dimensions and respect reduced motion.`

### 18.3 Projects Intro Draft

- [ ] `Selected systems, organized by current state and implementation focus. Each project records the constraint, role, stack, and next useful detail.`

### 18.4 Writing Intro Draft

- [ ] `Technical notes from building this portfolio: Dioxus, security boundaries, responsive UI, and Cloudflare deployment.`

### 18.5 Contact Intro Draft

- [ ] `Static contact endpoints only. No on-site message collection.`

## 19. Acceptance Criteria

### 19.1 Product Acceptance

- [ ] The site clearly feels like a living responsive blueprint.
- [ ] The design is distinctive without hiding content.
- [ ] Visitors can reach projects, writing, and contact quickly.
- [ ] Homepage is useful without requiring interaction.
- [ ] Motion improves orientation and does not dominate.
- [ ] The site feels personal enough for a portfolio and rigorous enough for a software engineer.

### 19.2 Technical Acceptance

- [ ] All routes compile and render.
- [ ] Dioxus 0.7 APIs are used correctly.
- [ ] No removed APIs are introduced.
- [ ] Content validation tests pass.
- [ ] Markdown safety is preserved.
- [ ] External links remain safe.
- [ ] No unnecessary dependencies are added.
- [ ] Release build succeeds.

### 19.3 Responsive Acceptance

- [ ] Mobile layout is single-column and readable.
- [ ] Tablet layout uses two-column opportunities without crowding.
- [ ] Desktop layout uses available space intentionally.
- [ ] Breakpoint strip correctly communicates mobile/tablet/desktop behavior.
- [ ] No text overlap on tested viewports.
- [ ] No horizontal scroll on mobile.

### 19.4 Accessibility Acceptance

- [ ] Keyboard navigation works across all routes.
- [ ] Focus styles are visible.
- [ ] Reduced motion is respected.
- [ ] Decorative SVGs are hidden from assistive tech.
- [ ] Color is not the only state indicator.
- [ ] Text contrast is sufficient.

### 19.5 Performance Acceptance

- [ ] No heavy animation runtime.
- [ ] No canvas/WebGPU requirement.
- [ ] SVGs remain lightweight.
- [ ] CSS animations are limited and cheap.
- [ ] Page remains fast on mobile.

## 20. Open Decisions

- [ ] Should the homepage secondary CTA point to Writing or Contact?
- [ ] Should project details remain TOML-only or move to Markdown-backed case studies?
- [ ] Should the existing `assets/header.svg` be reused, redesigned, or ignored?
- [ ] Should nav active state be implemented in the first pass or deferred?
- [ ] Should project cards be grouped by status on the Projects page?
- [ ] Should the blueprint diagram be inline SVG component code or an asset file?
- [ ] Should capability content live in Rust constants or structured content files?
- [ ] Should profile content gain availability/focus fields?

## 21. Suggested First Implementation Pass

- [ ] Build CSS tokens and blueprint primitives.
- [ ] Build `BlueprintDiagram`, `BreakpointStrip`, and `SectionHeading`.
- [ ] Redesign `PortfolioLayout`.
- [ ] Redesign homepage only.
- [ ] Run checks and visual QA.
- [ ] Review direction before applying the system to all secondary pages.

## 22. Progress Log

- [ ] Plan created.
- [ ] Direction approved by user.
- [ ] Implementation not started yet.
