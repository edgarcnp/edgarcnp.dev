use crate::data::PROFILE;
use dioxus::prelude::*;

#[component]
pub fn Footer() -> Element {
    rsx! {
        footer {
            class: "border-t border-zinc-800/80 px-5 py-8 text-sm text-zinc-500 sm:px-8 lg:px-12",
            div {
                class: "mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                p { "© 2026 {PROFILE.name}. Built with Dioxus." }
                a {
                    class: "w-fit rounded-sm text-zinc-400 underline-offset-4 outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
                    href: "mailto:{PROFILE.email}",
                    "{PROFILE.email}"
                }
            }
        }
    }
}
