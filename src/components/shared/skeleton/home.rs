use dioxus::prelude::*;

use super::{
    article::ArticleSkeleton, capability::CapabilityGridSkeleton, primitive::SkeletonBlock,
    project::ProjectGridSkeleton, section::SectionHeadingSkeleton,
};

#[component]
pub fn HomeSkeleton() -> Element {
    rsx! {
        div {
            class: "space-y-16",
            aria_busy: "true",
            aria_label: "Loading homepage",
            section { class: "section-motion grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center",
                div { class: "space-y-8",
                    SectionHeadingSkeleton {}
                    article { class: "blueprint-frame p-5",
                        div { class: "grid gap-4 sm:grid-cols-3",
                            for _ in 0..3 {
                                div {
                                    SkeletonBlock { class: "h-3 w-20".to_string() }
                                    SkeletonBlock { class: "mt-3 h-5 w-28".to_string() }
                                }
                            }
                        }
                    }
                    div { class: "flex flex-col gap-3 sm:flex-row",
                        SkeletonBlock { class: "h-11 w-full sm:w-36".to_string() }
                        SkeletonBlock { class: "h-11 w-full sm:w-28".to_string() }
                    }
                }
                SkeletonBlock { class: "min-h-80 w-full".to_string() }
            }
            section { class: "section-motion motion-delay-1 space-y-6",
                SectionHeadingSkeleton {}
                ProjectGridSkeleton {}
            }
            CapabilityGridSkeleton {}
            section { class: "section-motion motion-delay-2 grid gap-4 lg:grid-cols-[1fr_1fr]",
                ArticleSkeleton {}
                ArticleSkeleton {}
            }
        }
    }
}
