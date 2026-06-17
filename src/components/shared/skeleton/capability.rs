use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn CapabilityGridSkeleton() -> Element {
    rsx! {
        section {
            class: "section-motion motion-delay-2 grid gap-4 lg:grid-cols-4",
            aria_busy: "true",
            aria_label: "Loading capabilities",
            for _ in 0..4 {
                article { class: "blueprint-module p-5",
                    SkeletonBlock { class: "h-3 w-20".to_string() }
                    SkeletonBlock { class: "mt-4 h-6 w-3/4".to_string() }
                    div { class: "mt-4", SkeletonText { lines: 3 } }
                }
            }
        }
    }
}
