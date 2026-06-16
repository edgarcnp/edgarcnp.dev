use crate::data::ProjectStatus;
use dioxus::prelude::*;

#[component]
pub fn StatusBadge(status: ProjectStatus) -> Element {
    let class = match status {
        ProjectStatus::InProgress => "blueprint-status blueprint-status-progress",
        ProjectStatus::Planned => "blueprint-status blueprint-status-planned",
        ProjectStatus::Archived => "blueprint-status blueprint-status-archived",
    };

    rsx! {
        span { class, "{status}" }
    }
}
