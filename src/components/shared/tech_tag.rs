use dioxus::prelude::*;

#[component]
pub fn TechTag(label: String) -> Element {
    rsx! {
        span { class: "blueprint-chip", "{label}" }
    }
}
