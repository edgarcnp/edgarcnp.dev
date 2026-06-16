use crate::components::{ProjectCard, SectionHeading, StatusBadge};
use crate::data::{ProjectStatus, projects};
use dioxus::prelude::*;

#[component]
pub fn Projects() -> Element {
    let total_projects = projects().len();
    let in_progress = projects()
        .iter()
        .filter(|project| project.status == ProjectStatus::InProgress)
        .count();
    let planned = projects()
        .iter()
        .filter(|project| project.status == ProjectStatus::Planned)
        .count();

    rsx! {
        div { class: "space-y-10",
            SectionHeading {
                label: "Projects".to_string(),
                title: "Selected work.".to_string(),
                description: "A concise project list covering secure content, responsive loading states, and Cloudflare-focused deployment work.".to_string(),
            }

            section { class: "section-motion grid gap-4 sm:grid-cols-3",
                article { class: "blueprint-frame p-5",
                    p { class: "blueprint-label", "Projects" }
                    p { class: "mt-4 text-3xl font-semibold text-[var(--blueprint-text)]", "{total_projects}" }
                    p { class: "mt-2 text-sm text-[var(--blueprint-muted)]", "Validated project records" }
                }
                article { class: "blueprint-frame p-5",
                    StatusBadge { status: ProjectStatus::InProgress }
                    p { class: "mt-4 text-3xl font-semibold text-[var(--blueprint-text)]", "{in_progress}" }
                    p { class: "mt-2 text-sm text-[var(--blueprint-muted)]", "Currently active" }
                }
                article { class: "blueprint-frame p-5",
                    StatusBadge { status: ProjectStatus::Planned }
                    p { class: "mt-4 text-3xl font-semibold text-[var(--blueprint-text)]", "{planned}" }
                    p { class: "mt-2 text-sm text-[var(--blueprint-muted)]", "Queued work" }
                }
            }

            section { class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                for project in projects() {
                    ProjectCard { project: project.clone() }
                }
            }
        }
    }
}
