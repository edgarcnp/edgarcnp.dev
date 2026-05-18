use crate::Route;
use crate::components::ArticleSkeleton;
use crate::data::find_project;
use dioxus::prelude::*;

#[component]
pub fn ProjectDetail(slug: String) -> Element {
    match find_project(&slug) {
        Some(project) => rsx! {
            article { class: "max-w-3xl space-y-8",
                header { class: "space-y-4",
                    p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Case Study" }
                    h1 { class: "text-3xl font-semibold text-zinc-50 sm:text-4xl", "{project.title}" }
                    p { class: "text-base leading-7 text-zinc-400", "{project.detail}" }
                }
                section { class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-3",
                    Stat { label: "Role".to_string(), value: project.role.to_string() }
                    Stat { label: "Status".to_string(), value: project.status.to_string() }
                    Stat { label: "Year".to_string(), value: project.year.to_string() }
                }
                section { class: "section-motion motion-delay-2 space-y-4 text-zinc-400",
                    h2 { class: "text-xl font-semibold text-zinc-100", "Technology" }
                    ul { class: "flex flex-wrap gap-2",
                        for technology in project.technologies.iter() {
                            li {
                                class: "rounded-sm bg-zinc-900 px-2 py-1 text-xs text-zinc-300",
                                "{technology}"
                            }
                        }
                    }
                    p { class: "leading-7",
                        "Project detail pages currently render from typed static Rust data. The next phase will migrate this data into structured files while preserving validation."
                    }
                }
                details { class: "rounded-md border border-zinc-800 bg-zinc-950/70 p-5",
                    summary { class: "cursor-pointer text-sm font-medium text-zinc-200", "Article skeleton preview" }
                    div { class: "mt-5",
                        ArticleSkeleton {}
                    }
                }
            }
        },
        None => rsx! {
            section { class: "max-w-2xl space-y-5",
                p { class: "text-sm font-medium uppercase tracking-[0.18em] text-emerald-300", "Project not found" }
                h1 { class: "text-3xl font-semibold text-zinc-50", "No project matches this slug." }
                p { class: "leading-7 text-zinc-400", "The requested project is not part of the validated local portfolio content." }
                Link {
                    class: "inline-flex min-h-11 items-center rounded-sm border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 outline-none transition hover:border-emerald-300 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300",
                    to: Route::Projects {},
                    "Back to projects"
                }
            }
        },
    }
}

#[component]
fn Stat(label: String, value: String) -> Element {
    rsx! {
        div { class: "rounded-md border border-zinc-800 bg-zinc-950/70 p-4",
            dt { class: "text-xs uppercase tracking-wide text-zinc-500", "{label}" }
            dd { class: "mt-1 font-medium text-zinc-100", "{value}" }
        }
    }
}
