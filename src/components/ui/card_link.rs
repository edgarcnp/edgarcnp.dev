use dioxus::prelude::*;

use super::{UiIconExternalLink, UiLink, helpers::join_classes};

#[component]
pub fn UiCardLink(
    title: String,
    desc: String,
    href: String,
    #[props(default = true)] external: bool,
    #[props(default)] class: String,
) -> Element {
    rsx! {
        UiLink {
            href,
            external,
            button: true,
            card: true,
            class: join_classes("ui-card-link", &class),
            div { class: "ui-card-link-text",
                h4 { "{title}" }
                p { "{desc}" }
            }
            UiIconExternalLink {}
        }
    }
}
