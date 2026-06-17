use dioxus::prelude::*;

#[component]
pub fn BlueprintFrame(class: String, children: Element) -> Element {
    let classes = if class.trim().is_empty() {
        "blueprint-frame".to_string()
    } else {
        format!("blueprint-frame {class}")
    };

    rsx! {
        div { class: "{classes}", {children} }
    }
}
