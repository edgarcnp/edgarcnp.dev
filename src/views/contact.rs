use crate::data::{ContactLink as ContactLinkData, contact_links};
use dioxus::prelude::*;

#[component]
pub fn Contact() -> Element {
    rsx! {
        section { class: "max-w-3xl space-y-8",
            header { class: "space-y-4",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Contact" }
                h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "Static Contact Links" }
                p { class: "text-base leading-7 text-zinc-400",
                    "This site does not collect messages. Use email or a verified profile link to get in touch."
                }
            }
            div { class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-2",
                for link in contact_links() {
                    ContactItem { link: link.clone() }
                }
            }
        }
    }
}

#[component]
fn ContactItem(link: ContactLinkData) -> Element {
    let reactive_id = format!(
        "contact-card-{}",
        link.label.to_ascii_lowercase().replace(' ', "-")
    );

    rsx! {
        a {
            class: "interactive-lift group rounded-md border border-zinc-800 bg-zinc-950/80 p-5 outline-none hover:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
            "data-bg-reactive": "{reactive_id}",
            "data-bg-radius": "12",
            "data-bg-influence": "1",
            href: link.href,
            target: if link.external { "_blank" },
            rel: if link.external { "noopener noreferrer" },
            span { class: "block text-lg font-semibold text-zinc-50 group-hover:text-emerald-300", "{link.label}" }
            span { class: "mt-2 block text-sm leading-6 text-zinc-400", "{link.detail}" }
        }
    }
}
