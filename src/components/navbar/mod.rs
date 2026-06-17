use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn Navbar() -> Element {
    let current_route = use_route::<Route>();
    let home_active = matches!(current_route, Route::Home {});
    let projects_active = matches!(
        current_route,
        Route::Projects {} | Route::ProjectDetail { .. }
    );
    let writing_active = matches!(current_route, Route::Writing {} | Route::WritingPost { .. });
    let contact_active = matches!(current_route, Route::Contact {});

    rsx! {
        header {
            class: "sticky top-0 z-20 border-b border-[var(--blueprint-line-muted)] bg-[rgba(8,10,15,0.82)] px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-8 lg:px-12",
            nav {
                aria_label: "Primary navigation",
                class: "mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between",
                Link {
                    aria_current: if home_active { "page" },
                    class: "group flex min-h-11 w-fit items-center gap-3 rounded-sm pr-3 font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
                    to: Route::Home {},
                    span {
                        class: if home_active {
                            "grid size-9 place-items-center rounded-sm border border-[var(--blueprint-accent)] bg-[rgba(94,214,238,0.12)] text-[var(--blueprint-accent)] shadow-[0_0_24px_rgba(94,214,238,0.12)]"
                        } else {
                            "grid size-9 place-items-center rounded-sm border border-[var(--blueprint-line-muted)] bg-[rgba(244,247,251,0.035)] text-[var(--blueprint-muted)] transition group-hover:border-[var(--blueprint-accent)] group-hover:text-[var(--blueprint-accent)]"
                        },
                        span { class: "text-xs font-semibold", "EC" }
                    }
                    span { class: "flex flex-col leading-none",
                        span { class: "text-sm font-semibold text-[var(--blueprint-text)] transition group-hover:text-[var(--blueprint-accent)]", "edgarcnp.dev" }
                        span { class: "mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--blueprint-muted)]", "Portfolio" }
                    }
                }
                div {
                    class: "grid grid-cols-3 gap-1 rounded-sm border border-[var(--blueprint-line-muted)] bg-[rgba(244,247,251,0.035)] p-1 text-sm text-[var(--blueprint-muted)] shadow-[inset_0_1px_0_rgba(244,247,251,0.05)] sm:flex sm:w-fit",
                    NavLink {
                        to: Route::Projects {},
                        label: "Projects".to_string(),
                        active: projects_active,
                    }
                    NavLink {
                        to: Route::Writing {},
                        label: "Writing".to_string(),
                        active: writing_active,
                    }
                    NavLink {
                        to: Route::Contact {},
                        label: "Contact".to_string(),
                        active: contact_active,
                    }
                }
            }
        }
    }
}

#[component]
fn NavLink(to: Route, label: String, active: bool) -> Element {
    let class = if active {
        "relative inline-flex min-h-10 items-center justify-center rounded-sm bg-[rgba(94,214,238,0.12)] px-3 py-2 font-semibold text-[var(--blueprint-accent)] outline-none ring-1 ring-[rgba(94,214,238,0.24)] transition hover:bg-[rgba(94,214,238,0.16)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] sm:min-w-24"
    } else {
        "inline-flex min-h-10 items-center justify-center rounded-sm px-3 py-2 outline-none transition hover:bg-[rgba(94,214,238,0.08)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)] sm:min-w-24"
    };

    rsx! {
        Link {
            aria_current: if active { "page" },
            class,
            to,
            "{label}"
        }
    }
}
