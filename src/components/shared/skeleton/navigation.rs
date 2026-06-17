use dioxus::prelude::*;

use super::primitive::SkeletonBlock;

#[component]
pub fn NavSkeleton() -> Element {
    rsx! {
        header {
            class: "sticky top-0 z-20 border-b border-[var(--blueprint-line-muted)] bg-[rgba(8,10,15,0.82)] px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12",
            aria_busy: "true",
            aria_label: "Loading navigation",
            div { class: "mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between",
                div { class: "flex min-h-11 items-center gap-3",
                    SkeletonBlock { class: "size-9".to_string() }
                    div { class: "space-y-2",
                        SkeletonBlock { class: "h-3 w-28".to_string() }
                        SkeletonBlock { class: "h-2 w-20".to_string() }
                    }
                }
                div { class: "grid grid-cols-3 gap-1 rounded-sm border border-[var(--blueprint-line-muted)] bg-[rgba(244,247,251,0.035)] p-1 sm:flex sm:w-fit",
                    for _ in 0..3 {
                        SkeletonBlock { class: "h-10 w-full sm:w-24".to_string() }
                    }
                }
            }
        }
    }
}
