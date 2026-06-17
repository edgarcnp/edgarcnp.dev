use dioxus::prelude::*;

use super::helpers::{input_classes, join_classes, width_style};

#[component]
pub fn UiInput(
    id: String,
    aria_label: String,
    #[props(default)] value: String,
    #[props(default)] placeholder: String,
    #[props(default = "text".to_string())] input_type: String,
    #[props(default)] small: bool,
    #[props(default)] disabled: bool,
    #[props(default)] width: String,
    #[props(default)] class: String,
    #[props(default)] leading: Option<Element>,
    #[props(default)] trailing: Option<Element>,
    #[props(default)] oninput: EventHandler<String>,
) -> Element {
    let class = join_classes(input_classes(small, disabled), &class);
    let style = width_style(&width);

    rsx! {
        label { class, style,
            if let Some(leading) = leading {
                span { class: "ui-input-accessory", aria_hidden: "true", {leading} }
            }
            input {
                id,
                value,
                placeholder,
                disabled,
                aria_label,
                r#type: input_type,
                oninput: move |event| oninput.call(event.value()),
            }
            if let Some(trailing) = trailing {
                span { class: "ui-input-accessory", aria_hidden: "true", {trailing} }
            }
        }
    }
}
