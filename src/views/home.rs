use crate::components::ProjectCard;
use crate::data::{featured_projects, PROFILE};
use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn Home() -> Element {
    rsx! {
        div { class: "space-y-14",
            section {
                class: "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end",
                div { class: "space-y-7",
                    p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Portfolio" }
                    div { class: "space-y-5",
                        h1 { class: "max-w-3xl text-4xl font-semibold tracking-normal text-zinc-50 sm:text-5xl lg:text-6xl", "{PROFILE.name}" }
                        p { class: "max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl",
                            "{PROFILE.summary}"
                        }
                    }
                    div { class: "flex flex-col gap-3 sm:flex-row",
                        Link {
                            class: "inline-flex min-h-11 items-center justify-center rounded-sm bg-emerald-300 px-5 text-sm font-semibold text-zinc-950 outline-none transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                            to: Route::Projects {},
                            "View projects"
                        }
                        Link {
                            class: "inline-flex min-h-11 items-center justify-center rounded-sm border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 outline-none transition hover:border-emerald-300 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
                            to: Route::Contact {},
                            "Contact"
                        }
                    }
                }
                aside {
                    class: "rounded-md border border-zinc-800 bg-zinc-950/80 p-5",
                    h2 { class: "text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400", "Focus" }
                    dl { class: "mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1",
                        div {
                            dt { class: "text-xs uppercase tracking-wide text-zinc-500", "Runtime" }
                            dd { class: "mt-1 text-zinc-100", "Cloudflare Workers" }
                        }
                        div {
                            dt { class: "text-xs uppercase tracking-wide text-zinc-500", "Frontend" }
                            dd { class: "mt-1 text-zinc-100", "{PROFILE.role}" }
                        }
                        div {
                            dt { class: "text-xs uppercase tracking-wide text-zinc-500", "Priority" }
                            dd { class: "mt-1 text-zinc-100", "Security first" }
                        }
                    }
                }
            }

            section { class: "space-y-5",
                div { class: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                    div {
                        h2 { class: "text-2xl font-semibold text-zinc-50", "Featured Projects" }
                        p { class: "mt-2 max-w-2xl text-sm leading-6 text-zinc-400", "Selected work and planned case studies for the portfolio launch." }
                    }
                    Link {
                        class: "w-fit rounded-sm text-sm font-medium text-emerald-300 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-emerald-300",
                        to: Route::Projects {},
                        "All projects"
                    }
                }
                div { class: "grid gap-4 md:grid-cols-2",
                    for project in featured_projects() {
                        ProjectCard { project }
                    }
                }
            }
        }
    }
}
