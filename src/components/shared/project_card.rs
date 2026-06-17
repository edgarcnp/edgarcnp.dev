use super::{StatusBadge, TechTag};
use crate::Route;
use crate::data::Project;
use dioxus::prelude::*;

#[component]
pub fn ProjectCard(project: Project) -> Element {
    rsx! {
        Link {
            class: "blueprint-module blueprint-module-link group flex h-full min-h-72 flex-col justify-between p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--blueprint-accent)]",
            to: Route::ProjectDetail { slug: project.slug.clone() },
            div { class: "space-y-5",
                div { class: "flex items-start justify-between gap-4",
                    div { class: "space-y-3",
                        if project.pinned {
                            span { class: "inline-flex w-fit items-center gap-1.5 rounded-sm border border-[rgba(246,201,107,0.35)] bg-[rgba(246,201,107,0.07)] px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--blueprint-accent-2)]",
                                span { aria_hidden: "true",
                                    svg {
                                    class: "h-3.5 w-3.5",
                                    fill: "none",
                                    stroke: "currentColor",
                                    stroke_linecap: "round",
                                    stroke_linejoin: "round",
                                    stroke_width: "2",
                                    view_box: "0 0 24 24",
                                    path { d: "M12 17v5" }
                                    path { d: "M5 17h14" }
                                    path { d: "M7 17l2-9h6l2 9" }
                                    path { d: "M9 8V3h6v5" }
                                    }
                                }
                                "Pinned"
                            }
                        }
                        h3 { class: "text-xl font-semibold leading-7 text-[var(--blueprint-text)]", "{project.title}" }
                    }
                    span {
                        class: "blueprint-chip shrink-0",
                        "{project.year}"
                    }
                }
                p { class: "text-sm leading-6 text-[var(--blueprint-muted)]", "{project.summary}" }
                ul { class: "flex flex-wrap gap-2",
                    for technology in project.technologies.iter() {
                        li { TechTag { label: technology.clone() } }
                    }
                }
            }
            div { class: "mt-8 flex items-center justify-between gap-4",
                StatusBadge { status: project.status }
                span { class: "font-mono text-xs font-semibold uppercase tracking-wide text-[var(--blueprint-accent)] underline-offset-4 group-hover:underline", "Inspect" }
            }
        }
    }
}
