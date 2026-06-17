use dioxus::prelude::*;

use super::helpers::{button_classes, join_classes};

#[component]
pub fn UiLink(
    href: String,
    #[props(default)] external: bool,
    #[props(default)] button: bool,
    #[props(default)] primary: bool,
    #[props(default)] card: bool,
    #[props(default)] class: String,
    children: Element,
) -> Element {
    let opens_external = external || href.starts_with("https://") || href.starts_with("http://");
    let target = opens_external.then(|| "_blank".to_string());
    let rel = opens_external.then(|| "noopener noreferrer".to_string());
    let base = if button {
        button_classes(primary, false, card, false, false)
    } else {
        "ui-link"
    };
    let class = join_classes(base, &class);

    rsx! {
        a {
            class,
            href,
            target,
            rel,
            {children}
        }
    }
}
