# edgarcnp.dev

Personal portfolio site built with Dioxus 0.7, Rust, typed local content, and a Cloudflare-ready static asset deployment path.

## Current Shape

- Dioxus 0.7 web app with router-based pages.
- Route definitions live in `src/main.rs`.
- Shared UI lives in `src/components/`, grouped into `ui`, `footer`, `navbar`, and `shared`.
- Dioxus-native Helium-style UI primitives live in `src/components/ui/` and use `ui-*` CSS classes in `tailwind.css`.
- `UiGradientShimmer` uses a WASM canvas renderer on web with a CSS fallback for non-browser/server rendering.
- Reusable one-off components live as flat `.rs` modules under `src/components/shared/`; keep `src/components/mod.rs`, `src/components/shared/mod.rs`, and `src/components/ui/mod.rs` as re-export indexes.
- Route views live in `src/views/`.
- Typed portfolio content loading, parsing, validation, and Markdown rendering live in `src/data/`.
- `build.rs` generates the compile-time project/writing source manifest from the content directories.
- Source CSS is authored in root `tailwind.css`.
- Browser CSS is generated to `assets/tailwind.css` by Dioxus/Tailwind.
- Cloudflare asset deployment points at `target/dx/edgarcnp-dev/release/web/public` through `wrangler.toml`.

This is currently a static Dioxus web build served through Cloudflare assets. Cloudflare Static Assets security headers are authored through `cloudflare/_headers`; SSR and custom Worker request handling are roadmap items, not current runtime guarantees.

## Important File Boundaries

Edit these:

```text
src/
content/
cloudflare/_headers
tailwind.css
Cargo.toml
Dioxus.toml
wrangler.toml
package.json
```

Do not hand-edit these:

```text
assets/tailwind.css
target/
```

`assets/tailwind.css` is generated from `tailwind.css`. It should not be treated as source. If it is still tracked by git, remove it from the index during the final git cleanup while keeping the file ignored.

## Content

Portfolio content is bundled at build time from local files:

```text
content/profile.toml
content/contact.toml
content/capabilities.toml
content/projects/*.md
content/writing/*.md
```

Project and writing Markdown files use TOML frontmatter. The Rust data layer validates required fields, slugs, dates, contact kinds, project status values, and link schemes before route views render the content.

Markdown raw HTML is escaped before rendering through `dangerous_inner_html`.

Project and writing Markdown files are discovered by `build.rs`; new files under `content/projects/` or `content/writing/` do not need manual registration in Rust source.

## Development

Start the Dioxus dev server:

```bash
dx serve --platform web
```

Run the core checks:

```bash
cargo fmt --check
cargo check
cargo test
cargo clippy --all-targets --no-default-features --features web -- -D warnings
dx check
```

Build the release web bundle:

```bash
dx build --platform web --release
```

The release build currently emits the web output to:

```text
target/dx/edgarcnp-dev/release/web/public
```

## Cloudflare

Wrangler is used for Cloudflare deployment and local Cloudflare-style preview.
Deployment response headers are authored in `cloudflare/_headers`. The Wrangler npm scripts copy this file into Dioxus' generated asset directory after a release build so Cloudflare can apply it as a static assets `_headers` file.

Install npm dependencies if Wrangler is needed:

```bash
npm ci
```

Build and preview:

```bash
npm run wrangler:dev
```

Build the Cloudflare-ready asset directory without starting Wrangler:

```bash
npm run cloudflare:prepare
```

Deploy:

```bash
npm run deploy
```

Direct Cargo/Dioxus commands are the source of truth for local verification. npm scripts are kept for Wrangler/deploy convenience.

## CI

Forgejo Actions are configured in `.forgejo/workflows/check.yml`. The current workflow runs formatting, tests, clippy, Dioxus checks, and a release web build.

## Licensing

Source code is licensed under the MIT License. See `LICENSE-MIT`.

Visual assets, written content, branding, and design elements are licensed under Creative Commons Attribution 4.0 International. See `LICENSE-CC-BY`.
