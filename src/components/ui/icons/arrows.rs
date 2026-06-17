use dioxus::prelude::*;

use super::helpers::icon_class;

#[component]
pub fn UiIconArrowDown(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M12 5l0 14" }
            path { d: "M18 13l-6 6" }
            path { d: "M6 13l6 6" }
        }
    }
}

#[component]
pub fn UiIconArrowLeft(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M5 12l14 0" }
            path { d: "M5 12l6 6" }
            path { d: "M5 12l6 -6" }
        }
    }
}

#[component]
pub fn UiIconArrowRight(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M5 12l14 0" }
            path { d: "M13 18l6 -6" }
            path { d: "M13 6l6 6" }
        }
    }
}

#[component]
pub fn UiIconArrowUp(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M12 5l0 14" }
            path { d: "M18 11l-6 -6" }
            path { d: "M6 11l6 -6" }
        }
    }
}

#[component]
pub fn UiIconChevronDown(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M6 9l6 6l6 -6" }
        }
    }
}
