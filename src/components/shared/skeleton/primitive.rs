use crate::components::ui::UiSkeleton;
use dioxus::prelude::*;

#[component]
pub fn SkeletonBlock(class: String) -> Element {
    rsx! {
        UiSkeleton { class }
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
