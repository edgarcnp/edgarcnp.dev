use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn NotFound(route: Vec<String>) -> Element {
    let requested = if route.is_empty() {
        "/".to_string()
    } else {
        format!("/{}", route.join("/"))
    };

    rsx! {
        section { class: "max-w-2xl space-y-5",
            p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "404" }
            h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "Page not found" }
            p { class: "leading-7 text-zinc-400",
                "The requested path "
                code { class: "rounded-sm bg-zinc-900 px-1.5 py-0.5 text-zinc-200", "{requested}" }
                " is not available."
            }
            Link {
                class: "inline-flex min-h-11 items-center rounded-sm bg-emerald-300 px-5 text-sm font-semibold text-zinc-950 outline-none transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                to: Route::Home {},
                "Return home"
            }
        }
    }
}
