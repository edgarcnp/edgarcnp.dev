use dioxus::prelude::*;

use super::helpers::{join_classes, size_style};

#[component]
pub fn UiSkeleton(
    #[props(default)] width: String,
    #[props(default)] height: String,
    #[props(default)] class: String,
) -> Element {
    let style = size_style(&width, &height);
    let class = join_classes("ui-skeleton", &class);

    rsx! {
        div {
            class,
            style,
            aria_hidden: "true",
        }
    }
}
