use crate::data::Project;
use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn ProjectCard(project: Project) -> Element {
    rsx! {
        article {
            class: "flex h-full flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm shadow-black/20 transition hover:border-emerald-400/60",
            div {
                class: "space-y-4",
                div {
                    class: "flex items-start justify-between gap-4",
                    h3 { class: "text-lg font-semibold text-zinc-50", "{project.title}" }
                    span {
                        class: "shrink-0 rounded-sm border border-zinc-700 px-2 py-1 text-xs text-zinc-400",
                        "{project.year}"
                    }
                }
                p { class: "text-sm leading-6 text-zinc-400", "{project.summary}" }
                ul {
                    class: "flex flex-wrap gap-2",
                    for technology in project.technologies {
                        li {
                            class: "rounded-sm bg-zinc-900 px-2 py-1 text-xs text-zinc-300",
                            "{technology}"
                        }
                    }
                }
            }
            div {
                class: "mt-6 flex items-center justify-between gap-4",
                span { class: "text-xs uppercase tracking-wide text-emerald-300", "{project.status}" }
                Link {
                    class: "rounded-sm text-sm font-medium text-zinc-100 underline-offset-4 outline-none transition hover:text-emerald-300 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-300",
                    to: Route::ProjectDetail { slug: project.slug.to_string() },
                    "View"
                }
            }
        }
    }
}
