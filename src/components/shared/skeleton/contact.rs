use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn ContactEndpointSkeleton() -> Element {
    rsx! {
        article {
            class: "blueprint-module p-5",
            aria_busy: "true",
            aria_label: "Loading contact link",
            SkeletonBlock { class: "h-3 w-20".to_string() }
            SkeletonBlock { class: "mt-4 h-6 w-36".to_string() }
            div { class: "mt-4", SkeletonText { lines: 2 } }
        }
    }
}

#[component]
pub fn ContactListSkeleton() -> Element {
    rsx! {
        div {
            class: "section-motion motion-delay-1 grid gap-4 sm:grid-cols-2",
            aria_busy: "true",
            aria_label: "Loading contact links",
            for _ in 0..4 {
                ContactEndpointSkeleton {}
            }
        }
    }
}
