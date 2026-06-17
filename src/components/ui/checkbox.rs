use dioxus::prelude::*;

use super::{UiIconCheck, helpers::checkbox_classes, helpers::join_classes};

#[component]
pub fn UiCheckbox(
    id: String,
    #[props(default)] checked: bool,
    #[props(default)] disabled: bool,
    #[props(default)] aria_label: String,
    #[props(default)] class: String,
    #[props(default)] onchange: EventHandler<bool>,
    children: Element,
) -> Element {
    let class = join_classes(checkbox_classes(disabled), &class);

    rsx! {
        label { class,
            input {
                id,
                r#type: "checkbox",
                checked,
                disabled,
                aria_label,
                onchange: move |event| onchange.call(event.checked()),
            }
            span { class: "ui-checkbox-control", aria_hidden: "true",
                UiIconCheck {}
            }
            span { class: "ui-checkbox-content", {children} }
        }
    }
}
