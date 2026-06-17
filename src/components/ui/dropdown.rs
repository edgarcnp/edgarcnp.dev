use dioxus::prelude::*;

use super::{
    UiIconChevronDown, helpers::dropdown_classes, helpers::join_classes, helpers::width_style,
};

#[derive(Clone, Debug, PartialEq)]
pub struct UiDropdownOption {
    pub value: String,
    pub label: String,
    pub disabled: bool,
}

impl UiDropdownOption {
    pub fn new(value: impl Into<String>, label: impl Into<String>) -> Self {
        Self {
            value: value.into(),
            label: label.into(),
            disabled: false,
        }
    }

    pub fn disabled(mut self) -> Self {
        self.disabled = true;
        self
    }
}

#[component]
pub fn UiDropdown(
    id: String,
    aria_label: String,
    options: Vec<UiDropdownOption>,
    #[props(default)] value: String,
    #[props(default)] placeholder: String,
    #[props(default)] disabled: bool,
    #[props(default)] width: String,
    #[props(default)] class: String,
    #[props(default)] onchange: EventHandler<String>,
) -> Element {
    let class = join_classes(dropdown_classes(disabled), &class);
    let style = width_style(&width);
    let has_placeholder = !placeholder.trim().is_empty();
    let select_class = if value.is_empty() && has_placeholder {
        "ui-dropdown-placeholder"
    } else {
        ""
    };

    rsx! {
        label { class, style,
            select {
                id,
                value,
                class: select_class,
                disabled,
                aria_label,
                onchange: move |event| onchange.call(event.value()),
                if has_placeholder {
                    option { value: "", disabled: true, hidden: true, "{placeholder}" }
                }
                for option in options {
                    option {
                        value: option.value,
                        disabled: option.disabled,
                        "{option.label}"
                    }
                }
            }
            span { class: "ui-dropdown-icon", aria_hidden: "true",
                UiIconChevronDown {}
            }
        }
    }
}
