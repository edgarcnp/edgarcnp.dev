use dioxus::prelude::*;

use super::{UiIconCheck, UiIconCopy, UiIconLink, helpers::join_classes};

#[component]
pub fn UiCopyIcon(
    check: bool,
    #[props(default)] link: bool,
    #[props(default)] class: String,
) -> Element {
    let class = if check {
        join_classes("ui-copy-animation check", &class)
    } else {
        join_classes("ui-copy-animation", &class)
    };

    rsx! {
        div { class,
            div { class: "ui-copy-source",
                if link {
                    UiIconLink {}
                } else {
                    UiIconCopy {}
                }
            }
            div { class: "ui-copy-check",
                UiIconCheck {}
            }
        }
    }
}
