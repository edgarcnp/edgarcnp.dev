+++
title = "Structured Portfolio Content"
slug = "structured-portfolio-content"
summary = "Validated local content files for profile data, project metadata, writing, capabilities, and external links."
year = 2026
uploaded = "2026-06-10"
status = "Planned"
technologies = ["Rust", "Validation", "Content"]
featured = false
pinned = true
+++

This project moves portfolio content into local TOML and Markdown files while keeping a typed Rust validation boundary. Profile data, project metadata, writing frontmatter, capability records, and contact links are parsed at startup, checked for required fields, and rejected when slugs or URLs do not match the allowed shapes.

Markdown writing and project details use the same rendering path. Raw HTML is escaped before it reaches the UI, which lets project pages support richer prose without turning the portfolio into an untrusted HTML surface.

The result is a content workflow that stays simple: edit local files, keep validation close to the Rust data model, and render only the fields the interface actually uses.
