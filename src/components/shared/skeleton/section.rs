use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn SectionHeadingSkeleton() -> Element {
    rsx! {
        header {
            class: "space-y-3",
            aria_busy: "true",
            aria_label: "Loading section heading",
            SkeletonBlock { class: "h-3 w-28".to_string() }
            div { class: "max-w-3xl space-y-3",
                SkeletonBlock { class: "h-8 w-3/4 max-w-xl".to_string() }
                SkeletonText { lines: 2 }
            }
        }
    }
}
