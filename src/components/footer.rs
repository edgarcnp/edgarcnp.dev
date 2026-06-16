use crate::data::profile;
use dioxus::prelude::*;

#[component]
pub fn Footer() -> Element {
    let profile = profile();

    rsx! {
        footer {
            class: "border-t border-[var(--blueprint-line-muted)] px-5 py-8 text-sm text-[var(--blueprint-subtle)] sm:px-8 lg:px-12",
            div {
                class: "mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                p { "© 2026 {profile.name}. Dioxus / Rust / Cloudflare-ready." }
                a {
                    class: "w-fit rounded-sm text-[var(--blueprint-muted)] underline-offset-4 outline-none transition hover:text-[var(--blueprint-accent)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
                    href: "mailto:{profile.email}",
                    "{profile.email}"
                }
            }
        }
    }
}
