use dioxus::prelude::*;

use super::helpers::{button_classes, join_classes};

#[component]
pub fn UiButton(
    #[props(default)] primary: bool,
    #[props(default)] transparent: bool,
    #[props(default)] card: bool,
    #[props(default)] selected: bool,
    #[props(default)] circle: bool,
    #[props(default)] disabled: bool,
    #[props(default = "button".to_string())] button_type: String,
    #[props(default)] class: String,
    #[props(default)] onclick: EventHandler<MouseEvent>,
    children: Element,
) -> Element {
    let class = join_classes(
        button_classes(primary, transparent, card, selected, circle),
        &class,
    );

    rsx! {
        button {
            class,
            disabled,
            r#type: button_type,
            onclick: move |event| onclick.call(event),
            {children}
        }
    }
}
