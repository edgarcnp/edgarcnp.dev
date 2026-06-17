use dioxus::prelude::*;

use super::primitive::{SkeletonBlock, SkeletonText};

#[component]
pub fn ProjectCardSkeleton() -> Element {
    rsx! {
        article {
            class: "blueprint-module flex h-full min-h-72 flex-col justify-between p-5",
            aria_busy: "true",
            aria_label: "Loading project card",
            div { class: "space-y-5",
                div { class: "flex items-start justify-between gap-4",
                    div { class: "w-full max-w-sm space-y-3",
                        SkeletonBlock { class: "h-6 w-2/3".to_string() }
                        SkeletonBlock { class: "h-7 w-full".to_string() }
                    }
                    SkeletonBlock { class: "h-8 w-16 shrink-0".to_string() }
                }
                SkeletonText { lines: 3 }
                div { class: "flex flex-wrap gap-2",
                    SkeletonBlock { class: "h-6 w-16".to_string() }
                    SkeletonBlock { class: "h-6 w-20".to_string() }
                    SkeletonBlock { class: "h-6 w-14".to_string() }
                }
            }
            div { class: "mt-8 flex items-center justify-between gap-4",
                SkeletonBlock { class: "h-7 w-24".to_string() }
                SkeletonBlock { class: "h-3 w-16".to_string() }
            }
        }
    }
}

#[component]
pub fn ProjectStatsSkeleton() -> Element {
    rsx! {
        section {
            class: "section-motion grid gap-4 sm:grid-cols-3",
            aria_busy: "true",
            aria_label: "Loading project summary",
            for _ in 0..3 {
                article { class: "blueprint-frame p-5",
                    SkeletonBlock { class: "h-5 w-24".to_string() }
                    SkeletonBlock { class: "mt-4 h-9 w-16".to_string() }
                    SkeletonBlock { class: "mt-3 h-3 w-32".to_string() }
                }
            }
        }
    }
}

#[component]
pub fn ProjectGridSkeleton() -> Element {
    rsx! {
        section {
            class: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            aria_busy: "true",
            aria_label: "Loading projects",
            for _ in 0..6 {
                ProjectCardSkeleton {}
            }
        }
    }
}

#[component]
pub fn ProjectDetailSkeleton() -> Element {
    rsx! {
        article {
            class: "max-w-4xl space-y-8",
            aria_busy: "true",
            aria_label: "Loading project detail",
            header { class: "blueprint-frame p-5 sm:p-6",
                div { class: "max-w-3xl space-y-4",
                    SkeletonBlock { class: "h-3 w-32".to_string() }
                    SkeletonBlock { class: "h-10 w-3/4 max-w-xl".to_string() }
                    SkeletonText { lines: 2 }
                }
            }
            section { class: "section-motion motion-delay-1 blueprint-frame p-5",
                div { class: "grid gap-5 sm:grid-cols-2",
                    SkeletonBlock { class: "h-14 w-full".to_string() }
                    SkeletonBlock { class: "h-14 w-full".to_string() }
                    SkeletonBlock { class: "h-10 w-44 sm:col-span-2".to_string() }
                }
            }
            section { class: "section-motion motion-delay-2 blueprint-frame p-5 sm:p-6",
                SkeletonBlock { class: "h-3 w-32".to_string() }
                div { class: "mt-5 max-w-3xl space-y-6",
                    SkeletonText { lines: 5 }
                    SkeletonBlock { class: "h-7 w-1/2 max-w-md".to_string() }
                    SkeletonText { lines: 4 }
                    SkeletonBlock { class: "h-28 w-full".to_string() }
                }
            }
        }
    }
}
