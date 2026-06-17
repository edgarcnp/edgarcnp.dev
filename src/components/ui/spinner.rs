use dioxus::prelude::*;

use super::{UiIconLoader, helpers::join_classes};

#[component]
pub fn UiSpinner(#[props(default = 24)] size: u16, #[props(default)] class: String) -> Element {
    let style = format!("--size: {size}px");
    let class = join_classes("ui-spinner", &class);

    rsx! {
        div { class, style,
            UiIconLoader {}
        }
    }
}
