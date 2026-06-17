use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn WritingCardSkeleton() -> Element {
    rsx! {
        article {
            class: "blueprint-module p-5",
            aria_busy: "true",
            aria_label: "Loading writing card",
            div { class: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
                div { class: "w-full space-y-3",
                    SkeletonBlock { class: "h-3 w-44".to_string() }
                    SkeletonBlock { class: "h-7 w-3/4 max-w-xl".to_string() }
                    SkeletonText { lines: 2 }
                    div { class: "flex flex-wrap gap-2",
                        SkeletonBlock { class: "h-6 w-16".to_string() }
                        SkeletonBlock { class: "h-6 w-20".to_string() }
                        SkeletonBlock { class: "h-6 w-24".to_string() }
                    }
                }
                SkeletonBlock { class: "h-3 w-12 shrink-0".to_string() }
            }
        }
    }
}

#[component]
pub fn WritingListSkeleton() -> Element {
    rsx! {
        section {
            class: "space-y-4",
            aria_busy: "true",
            aria_label: "Loading writing",
            for _ in 0..3 {
                WritingCardSkeleton {}
            }
        }
    }
}

#[component]
pub fn WritingPostSkeleton() -> Element {
    rsx! {
        article {
            class: "mx-auto max-w-3xl space-y-8",
            aria_busy: "true",
            aria_label: "Loading writing post",
            header {
                class: "blueprint-frame space-y-4 p-5 sm:p-6",
                SkeletonBlock { class: "h-5 w-28".to_string() }
                div {
                    class: "space-y-3",
                    SkeletonBlock { class: "h-3 w-24".to_string() }
                    SkeletonBlock { class: "h-8 w-3/4 max-w-xl".to_string() }
                    SkeletonText { lines: 2 }
                }
                div {
                    class: "flex gap-2",
                    SkeletonBlock { class: "h-6 w-16".to_string() }
                    SkeletonBlock { class: "h-6 w-20".to_string() }
                    SkeletonBlock { class: "h-6 w-24".to_string() }
                }
            }
            div {
                class: "space-y-6",
                SkeletonText { lines: 4 }
                SkeletonBlock { class: "h-7 w-1/2 max-w-md".to_string() }
                SkeletonText { lines: 5 }
                SkeletonBlock { class: "h-32 w-full".to_string() }
            }
        }
    }
}
