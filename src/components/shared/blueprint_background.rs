use crate::components::ui::UiGradientShimmer;
use dioxus::prelude::*;

const BACKGROUND_SHIMMER_MAX_DPR: f64 = 1.5;

#[component]
pub fn BlueprintBackground(emphasis_key: u64) -> Element {
    rsx! {
        div {
            aria_hidden: "true",
            class: "blueprint-background",
            UiGradientShimmer {
                class: "blueprint-background-shimmer".to_string(),
                intro: true,
                emphasis_key,
                max_dpr: BACKGROUND_SHIMMER_MAX_DPR,
            }
        }
    }
}
