use crate::Route;
use crate::components::{ActionSize, ActionVariant, LinkAction, RouteAction, StatusBadge};
use crate::data::find_project;
use dioxus::prelude::*;

#[component]
pub fn ProjectDetail(slug: String) -> Element {
    match find_project(&slug) {
        Some(project) => rsx! {
            article { class: "max-w-4xl space-y-8",
                header { class: "blueprint-frame p-5 sm:p-6",
                    div { class: "max-w-3xl space-y-4",
                        p { class: "blueprint-label", "Project / {project.slug}" }
                        h1 { class: "text-3xl font-semibold text-[var(--blueprint-text)] sm:text-4xl", "{project.title}" }
                        p { class: "text-base leading-7 text-[var(--blueprint-muted)]", "{project.summary}" }
                    }
                }
                section { class: "section-motion motion-delay-1 blueprint-frame p-5",
                    dl { class: "grid gap-5 sm:grid-cols-2",
                        div {
                            dt { class: "blueprint-label text-[0.68rem]", "Status" }
                            dd { class: "mt-2", StatusBadge { status: project.status } }
                        }
                        div {
                            dt { class: "blueprint-label text-[0.68rem]", "Year" }
                            dd { class: "mt-2 text-lg font-medium text-[var(--blueprint-text)]", "{project.year}" }
                        }
                        if !project.links.is_empty() {
                            div { class: "sm:col-span-2",
                                dt { class: "blueprint-label text-[0.68rem]", "Links" }
                                dd { class: "mt-3 flex flex-wrap gap-3",
                                    for link in project.links.iter() {
                                        LinkAction {
                                            href: link.href.clone(),
                                            external: link.external,
                                            variant: ActionVariant::Secondary,
                                            size: ActionSize::Compact,
                                            "{link.label}"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                section { class: "section-motion motion-delay-2 blueprint-frame p-5 sm:p-6",
                    h2 { class: "blueprint-label", "Project Details" }
                    div {
                        class: "markdown-body mt-5 max-w-3xl",
                        dangerous_inner_html: "{project.detail_html}",
                    }
                }
            }
        },
        None => rsx! {
            section { class: "blueprint-frame max-w-2xl space-y-5 p-5",
                p { class: "blueprint-label", "Project not found" }
                h1 { class: "text-3xl font-semibold text-[var(--blueprint-text)]", "No project matches this slug." }
                p { class: "leading-7 text-[var(--blueprint-muted)]", "The requested project is not part of the validated local portfolio content." }
                RouteAction {
                    to: Route::Projects {},
                    variant: ActionVariant::Secondary,
                    size: ActionSize::Default,
                    "Back to projects"
                }
            }
        },
    }
}
