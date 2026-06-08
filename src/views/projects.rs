use crate::components::{ProjectCard, ProjectGridSkeleton};
use crate::data::projects;
use dioxus::prelude::*;

#[component]
pub fn Projects() -> Element {
    rsx! {
        div { class: "space-y-8",
            header { class: "max-w-3xl space-y-4",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Projects" }
                h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "Selected Work" }
                p { class: "text-base leading-7 text-zinc-400",
                    "Case studies will expand as the site moves from scaffold to production content. The current list defines the intended responsive card system."
                }
            }
            div { class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                for project in projects() {
                    ProjectCard { project: project.clone() }
                }
            }
            details {
                class: "section-motion motion-delay-2 rounded-md border border-zinc-800 bg-zinc-950/70 p-5",
                "data-bg-reactive": "projects-skeleton-preview",
                "data-bg-radius": "12",
                "data-bg-influence": "0.9",
                summary { class: "cursor-pointer text-sm font-medium text-zinc-200", "Loading skeleton preview" }
                div { class: "mt-5",
                    ProjectGridSkeleton {}
                }
            }
        }
    }
}
