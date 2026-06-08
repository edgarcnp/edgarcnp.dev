use crate::Route;
use crate::data::Project;
use dioxus::prelude::*;

#[component]
pub fn ProjectCard(project: Project) -> Element {
    let reactive_id = format!("project-card-{}", project.slug);

    rsx! {
        article {
            class: "h-full",
            "data-bg-reactive": "{reactive_id}",
            "data-bg-radius": "12",
            "data-bg-influence": "1",
            Link {
                class: "interactive-lift group flex h-full flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm shadow-black/20 outline-none hover:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-300",
                to: Route::ProjectDetail { slug: project.slug.clone() },
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
                        for technology in project.technologies.iter() {
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
                    span { class: "text-sm font-medium text-zinc-100 underline-offset-4 group-hover:text-emerald-300 group-hover:underline", "Read" }
                }
            }
        }
    }
}
