use dioxus::prelude::*;

use super::helpers::icon_class;

#[component]
pub fn UiIconBang(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" }
            path { d: "M21 21l-6 -6" }
            path { d: "M10 13v.01" }
            path { d: "M10 7v3" }
        }
    }
}

#[component]
pub fn UiIconCheck(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M5 12l5 5l10 -10" }
        }
    }
}

#[component]
pub fn UiIconInfo(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" }
            path { d: "M12 9h.01" }
            path { d: "M11 12h1v4h1" }
        }
    }
}

#[component]
pub fn UiIconLoader(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M12 3a9 9 0 1 0 9 9" }
        }
    }
}

#[component]
pub fn UiIconX(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M18 6l-12 12" }
            path { d: "M6 6l12 12" }
        }
    }
}
