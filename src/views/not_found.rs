use crate::Route;
use crate::components::{ActionSize, ActionVariant, RouteAction};
use dioxus::prelude::*;

#[component]
pub fn NotFound(route: Vec<String>) -> Element {
    let requested = if route.is_empty() {
        "/".to_string()
    } else {
        format!("/{}", route.join("/"))
    };

    rsx! {
        section { class: "blueprint-frame max-w-2xl space-y-5 p-5 sm:p-6",
            p { class: "blueprint-label", "Route miss / 404" }
            h1 { class: "text-3xl font-semibold text-[var(--blueprint-text)] sm:text-4xl", "Page not found" }
            p { class: "leading-7 text-[var(--blueprint-muted)]",
                "The requested path "
                code { class: "rounded-sm bg-[rgba(244,247,251,0.06)] px-1.5 py-0.5 text-[var(--blueprint-accent-2)]", "{requested}" }
                " is not available."
            }
            div { class: "flex flex-col gap-3 sm:flex-row",
                RouteAction {
                    to: Route::Home {},
                    variant: ActionVariant::Primary,
                    size: ActionSize::Default,
                    "Return home"
                }
                RouteAction {
                    to: Route::Projects {},
                    variant: ActionVariant::Secondary,
                    size: ActionSize::Default,
                    "View projects"
                }
            }
        }
    }
}
