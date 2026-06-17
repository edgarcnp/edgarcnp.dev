use dioxus::prelude::*;

use super::helpers::icon_class;

#[component]
pub fn UiIconCopy(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" }
            path { d: "M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" }
        }
    }
}

#[component]
pub fn UiIconDownload(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" }
            path { d: "M7 11l5 5l5 -5" }
            path { d: "M12 4l0 12" }
        }
    }
}

#[component]
pub fn UiIconExternalLink(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" }
            path { d: "M11 13l9 -9" }
            path { d: "M15 4h5v5" }
        }
    }
}

#[component]
pub fn UiIconLink(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M9 15l6 -6" }
            path { d: "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" }
            path { d: "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" }
        }
    }
}

#[component]
pub fn UiIconSearch(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" }
            path { d: "M21 21l-6 -6" }
        }
    }
}

#[component]
pub fn UiIconWorld(#[props(default)] class: String) -> Element {
    let class = icon_class(&class);
    rsx! {
        svg { class, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", view_box: "0 0 24 24", fill: "none", stroke: "currentColor", stroke_width: "2", stroke_linecap: "round", stroke_linejoin: "round",
            path { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" }
            path { d: "M3.6 9h16.8" }
            path { d: "M3.6 15h16.8" }
            path { d: "M11.5 3a17 17 0 0 0 0 18" }
            path { d: "M12.5 3a17 17 0 0 1 0 18" }
        }
    }
}
