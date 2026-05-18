use dioxus::prelude::*;

#[component]
pub fn Writing() -> Element {
    rsx! {
        section { class: "max-w-3xl space-y-7",
            header { class: "space-y-4",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Writing" }
                h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "Notes and Technical Writing" }
                p { class: "text-base leading-7 text-zinc-400",
                    "Writing is planned for a later content pass. The route exists now so navigation, SSR rendering, and responsive layout can settle early."
                }
            }
            div { class: "rounded-md border border-dashed border-zinc-700 bg-zinc-950/70 p-6",
                h2 { class: "text-lg font-semibold text-zinc-100", "No posts published yet" }
                p { class: "mt-2 leading-7 text-zinc-400",
                    "Future posts will render from validated local content with sanitized Markdown and no arbitrary embedded HTML."
                }
            }
        }
    }
}
