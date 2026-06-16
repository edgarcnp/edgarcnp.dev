use crate::components::SafeAnchor;
use crate::data::ContactLink;
use dioxus::prelude::*;

#[component]
pub fn ContactEndpoint(link: ContactLink) -> Element {
    rsx! {
        SafeAnchor {
            class: "blueprint-module blueprint-module-link group p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
            href: link.href,
            external: link.external,
            span { class: "blueprint-label block", "{link.kind}" }
            span { class: "mt-4 block text-lg font-semibold text-[var(--blueprint-text)] group-hover:text-[var(--blueprint-accent)]", "{link.label}" }
            span { class: "mt-2 block text-sm leading-6 text-[var(--blueprint-muted)]", "{link.detail}" }
        }
    }
}
