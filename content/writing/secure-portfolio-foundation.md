+++
title = "Building a Secure Portfolio Foundation"
slug = "secure-portfolio-foundation"
summary = "A short note on starting this portfolio with SSR, static content validation, and restrained progressive enhancement."
published = "2026-05-18"
tags = ["Dioxus", "Security", "Cloudflare"]
+++

The first version of this portfolio starts with a narrow rule: every feature should be easy to audit before it becomes visually interesting.

That means the foundation favors server-rendered routes, structured local content, static contact links, and a dark-only interface. The site can still feel polished, but the default path should avoid unnecessary runtime state and avoid collecting visitor data.

## What matters first

- Keep portfolio content in validated files.
- Render Markdown without arbitrary embedded HTML.
- Prefer CSS and small interactions over large client-side behavior.
- Make responsive loading states match the final layout.

## Why this shape works

Dioxus gives the site a typed route surface while still allowing the UI to stay close to HTML. Cloudflare Workers are the target runtime, so the implementation should stay compatible with a lightweight deployment model and avoid server assumptions that do not hold at the edge.

```rust
#[derive(Clone, PartialEq)]
pub struct WritingPost {
    pub title: String,
    pub slug: String,
}
```

The next pass can add restrained animation, but only where it improves orientation and does not interfere with reduced-motion preferences.
