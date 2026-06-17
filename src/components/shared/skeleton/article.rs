use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn ArticleSkeleton() -> Element {
    rsx! {
        article {
            class: "blueprint-frame space-y-6 p-5 sm:p-6",
            aria_busy: "true",
            aria_label: "Loading article",
            SkeletonBlock { class: "h-8 w-3/4 max-w-xl".to_string() }
            SkeletonText { lines: 5 }
            SkeletonBlock { class: "aspect-[16/9] w-full max-w-3xl".to_string() }
            SkeletonText { lines: 4 }
        }
    }
}
