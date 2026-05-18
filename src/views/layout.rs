use crate::components::Footer;
use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn PortfolioLayout() -> Element {
    rsx! {
        div {
            class: "min-h-screen bg-zinc-950 text-zinc-100 antialiased",
            header {
                class: "sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 px-5 py-4 backdrop-blur sm:px-8 lg:px-12",
                nav {
                    class: "mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                    Link {
                        class: "w-fit rounded-sm text-base font-semibold text-zinc-50 outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
                        to: Route::Home {},
                        "edgarcnp.dev"
                    }
                    div {
                        class: "flex flex-wrap gap-2 text-sm text-zinc-300",
                        NavLink { to: Route::Projects {}, label: "Projects".to_string() }
                        NavLink { to: Route::Writing {}, label: "Writing".to_string() }
                        NavLink { to: Route::Contact {}, label: "Contact".to_string() }
                    }
                }
            }
            main {
                class: "mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16",
                Outlet::<Route> {}
            }
            Footer {}
        }
    }
}

#[component]
fn NavLink(to: Route, label: String) -> Element {
    rsx! {
        Link {
            class: "rounded-sm px-3 py-2 outline-none transition hover:bg-zinc-900 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
            to,
            "{label}"
        }
    }
}
