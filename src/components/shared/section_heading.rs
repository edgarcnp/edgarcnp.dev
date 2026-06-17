use dioxus::prelude::*;

#[component]
pub fn SectionHeading(label: String, title: String, description: String) -> Element {
    let has_description = !description.trim().is_empty();

    rsx! {
        header { class: "space-y-3",
            p { class: "blueprint-label", "{label}" }
            div { class: "max-w-3xl space-y-3",
                h2 { class: "text-2xl font-semibold text-[var(--blueprint-text)] sm:text-3xl", "{title}" }
                if has_description {
                    p { class: "blueprint-muted text-sm leading-6 sm:text-base sm:leading-7", "{description}" }
                }
            }
        }
    }
}
