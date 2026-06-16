use dioxus::prelude::*;

#[component]
pub fn BreakpointStrip() -> Element {
    rsx! {
        aside {
            class: "breakpoint-strip",
            aria_label: "Responsive breakpoint states",
            div { class: "breakpoint-item breakpoint-mobile",
                strong { "Mobile" }
                span { "0-639px" }
            }
            div { class: "breakpoint-item breakpoint-tablet",
                strong { "Tablet" }
                span { "640-1023px" }
            }
            div { class: "breakpoint-item breakpoint-desktop",
                strong { "Desktop" }
                span { "1024px+" }
            }
        }
    }
}
