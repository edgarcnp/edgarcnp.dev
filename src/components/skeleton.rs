use dioxus::prelude::*;

#[component]
pub fn SkeletonBlock(class: String) -> Element {
    rsx! {
        div {
            class: "motion-safe:animate-pulse rounded-sm border border-[var(--blueprint-line-muted)] bg-[rgba(244,247,251,0.055)] {class}",
            aria_hidden: "true",
        }
    }
}

#[component]
pub fn SkeletonText(lines: usize) -> Element {
    rsx! {
        div {
            class: "space-y-3",
            aria_hidden: "true",
            for line in 0..lines {
                div {
                    class: if line + 1 == lines {
                        "h-3 w-2/3 rounded-sm bg-[rgba(244,247,251,0.055)] motion-safe:animate-pulse"
                    } else {
                        "h-3 w-full rounded-sm bg-[rgba(244,247,251,0.055)] motion-safe:animate-pulse"
                    }
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
                article {
                    class: "blueprint-module p-5",
                    SkeletonBlock { class: "h-5 w-2/3".to_string() }
                    div { class: "mt-5", SkeletonText { lines: 3 } }
                    div {
                        class: "mt-6 flex gap-2",
                        SkeletonBlock { class: "h-6 w-16".to_string() }
                        SkeletonBlock { class: "h-6 w-20".to_string() }
                    }
                }
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
                article {
                    class: "blueprint-module p-5",
                    SkeletonBlock { class: "h-3 w-24".to_string() }
                    div { class: "mt-5", SkeletonBlock { class: "h-6 w-3/4 max-w-xl".to_string() } }
                    div { class: "mt-5", SkeletonText { lines: 2 } }
                    div {
                        class: "mt-6 flex gap-2",
                        SkeletonBlock { class: "h-6 w-16".to_string() }
                        SkeletonBlock { class: "h-6 w-20".to_string() }
                    }
                }
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
