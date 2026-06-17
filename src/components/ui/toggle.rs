use dioxus::prelude::*;

use super::helpers::join_classes;

#[component]
pub fn UiToggle(
    #[props(default)] checked: bool,
    #[props(default)] disabled: bool,
    #[props(default)] name: String,
    #[props(default)] desc: String,
    #[props(default)] class: String,
    #[props(default)] onchange: EventHandler<bool>,
    #[props(default)] onclick: EventHandler<MouseEvent>,
    children: Element,
) -> Element {
    let class = join_classes("ui-button ui-button-card ui-toggle-button", &class);
    let enabled_class = if checked {
        "ui-toggle enabled"
    } else {
        "ui-toggle"
    };
    let has_text_props = !name.trim().is_empty() || !desc.trim().is_empty();
    let next_checked = !checked;

    rsx! {
        button {
            class,
            disabled,
            r#type: "button",
            role: "switch",
            aria_checked: "{checked}",
            onclick: move |event| {
                onclick.call(event);
                if !disabled {
                    onchange.call(next_checked);
                }
            },
            div { class: "ui-toggle-text",
                if has_text_props {
                    if !name.trim().is_empty() {
                        h4 { "{name}" }
                    }
                    if !desc.trim().is_empty() {
                        p { "{desc}" }
                    }
                } else {
                    {children}
                }
            }
            div { class: enabled_class, aria_hidden: "true",
                div { class: "ui-toggle-runner" }
            }
        }
    }
}
