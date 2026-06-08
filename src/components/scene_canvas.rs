use dioxus::prelude::*;

#[component]
pub fn SceneCanvas() -> Element {
    #[cfg(feature = "web")]
    use_effect(|| {
        crate::renderer::start_scene("portfolio-scene");
    });

    rsx! {
        canvas {
            id: "portfolio-scene",
            class: "scene-canvas",
            aria_hidden: "true",
        }
    }
}
