use dioxus::prelude::*;

use super::helpers::join_classes;

#[component]
pub fn UiTooltip(
    label: String,
    #[props(default)] id: String,
    #[props(default)] class: String,
    children: Element,
) -> Element {
    let tooltip_id = if id.trim().is_empty() {
        "ui-tooltip".to_string()
    } else {
        id
    };
    let class = join_classes("ui-tooltip-anchor", &class);

    rsx! {
        span { class, role: "group", aria_describedby: tooltip_id.clone(),
            {children}
            span { class: "ui-tooltip-content", role: "tooltip", id: tooltip_id, "{label}" }
        }
    }
}
