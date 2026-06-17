+++
title = "Secure Portfolio Platform"
slug = "secure-portfolio-platform"
summary = "A Dioxus Fullstack portfolio planned around SSR, Cloudflare Workers, static contact links, and strict content boundaries."
year = 2026
published = "2026-06-15"
updated = "2026-06-15"
status = "In Progress"
technologies = ["Rust", "Dioxus", "Cloudflare"]
featured = true
pinned = true

[[links]]
label = "Live site"
href = "https://edgarcnp.dev"
external = true
+++

This project establishes the portfolio foundation: a Dioxus Router surface, typed local content, safe Markdown rendering, static contact links, and a dark responsive interface.

The implementation keeps content bundled and validated before rendering, avoids handwritten browser JavaScript, and keeps the primary pages useful without forcing a custom interaction model. Current work is focused on making the portfolio easier to inspect: project content is moving into Markdown-backed records, navigation exposes route state, and visual detail is being reduced when it does not explain the system.

The deployment target remains Cloudflare Workers. That keeps the runtime assumptions explicit: local content is compiled into the application, external links stay validated, and the UI does not depend on browser-only layout or animation code.
