use crate::Route;
use crate::components::Footer;
use dioxus::prelude::*;

#[component]
pub fn PortfolioLayout() -> Element {
    let current_route = use_route::<Route>();
    let projects_active = matches!(
        current_route,
        Route::Projects {} | Route::ProjectDetail { .. }
    );
    let writing_active = matches!(current_route, Route::Writing {} | Route::WritingPost { .. });
    let contact_active = matches!(current_route, Route::Contact {});

    rsx! {
        div {
            class: "blueprint-page antialiased",
            header {
                class: "sticky top-0 z-20 border-b border-[var(--blueprint-line-muted)] bg-[rgba(8,10,15,0.88)] px-5 py-4 backdrop-blur sm:px-8 lg:px-12",
                nav {
                    class: "mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                    Link {
                        class: "w-fit rounded-sm font-mono text-base font-semibold text-[var(--blueprint-text)] outline-none transition hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
                        to: Route::Home {},
                        "edgarcnp.dev"
                    }
                    div {
                        class: "flex flex-wrap gap-2 text-sm text-[var(--blueprint-muted)]",
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
            main {
                class: "blueprint-shell page-motion mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16",
                Outlet::<Route> {}
            }
            Footer {}
        }
    }
}

#[component]
fn NavLink(to: Route, label: String, active: bool) -> Element {
    let class = if active {
        "min-h-11 rounded-sm bg-[rgba(94,214,238,0.08)] px-3 py-2 text-[var(--blueprint-accent)] outline-none ring-1 ring-[var(--blueprint-line-muted)] transition hover:bg-[rgba(94,214,238,0.12)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
    } else {
        "min-h-11 rounded-sm px-3 py-2 outline-none transition hover:bg-[rgba(94,214,238,0.08)] hover:text-[var(--blueprint-accent)] focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]"
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
