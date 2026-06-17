use crate::data::Capability;
use dioxus::prelude::*;

#[component]
pub fn CapabilityGrid(capabilities: Vec<Capability>) -> Element {
    rsx! {
        section { class: "section-motion motion-delay-2 grid gap-4 lg:grid-cols-4",
            for capability in capabilities {
                article { class: "blueprint-module p-5",
                    p { class: "blueprint-label", "{capability.label}" }
                    h3 { class: "mt-4 text-lg font-semibold text-[var(--blueprint-text)]", "{capability.title}" }
                    p { class: "mt-3 text-sm leading-6 text-[var(--blueprint-muted)]", "{capability.description}" }
                }
            }
        }
    }
}
