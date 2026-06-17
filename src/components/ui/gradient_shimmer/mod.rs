#[cfg(target_arch = "wasm32")]
use std::{cell::RefCell, rc::Rc};

use dioxus::prelude::*;

use super::helpers::join_classes;

#[cfg(target_arch = "wasm32")]
mod canvas;

#[component]
pub fn UiGradientShimmer(
    #[props(default)] background: bool,
    #[props(default = true)] intro: bool,
    #[props(default)] intro_key: u64,
    #[props(default)] emphasis_key: u64,
    #[props(default)] max_dpr: f64,
    #[props(default)] class: String,
) -> Element {
    let base = if background {
        "ui-gradient-shimmer ui-gradient-shimmer-background"
    } else {
        "ui-gradient-shimmer"
    };
    let base = if intro {
        format!("{base} intro")
    } else {
        base.to_string()
    };
    let class = join_classes(&base, &class);

    #[cfg(target_arch = "wasm32")]
    {
        use dioxus::web::WebEventExt;

        let handle = use_hook(|| Rc::new(RefCell::new(None::<canvas::GradientShimmerHandle>)));
        let cleanup_handle = handle.clone();

        use_drop(move || {
            cleanup_handle.borrow_mut().take();
        });

        let intro_handle = handle.clone();
        use_effect(use_reactive((&intro_key,), move |(intro_key,)| {
            if intro_key == 0 {
                return;
            }

            if let Some(handle) = intro_handle.borrow().as_ref() {
                handle.intro();
            }
        }));

        let emphasis_handle = handle.clone();
        use_effect(use_reactive((&emphasis_key,), move |(emphasis_key,)| {
            if emphasis_key == 0 {
                return;
            }

            if let Some(handle) = emphasis_handle.borrow().as_ref() {
                handle.emphasize();
            }
        }));

        let mounted_handle = handle.clone();

        rsx! {
            canvas {
                class,
                aria_hidden: "true",
                onmounted: move |event| {
                    let element = event.data().as_ref().as_web_event();
                    match canvas::mount(element, intro, max_dpr) {
                        Ok(controller) => {
                            mounted_handle.borrow_mut().replace(controller);
                        }
                        Err(_error) => {
                            // Leave the CSS fallback visible if the browser cannot attach the canvas renderer.
                        }
                    }
                },
            }
        }
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        let _ = (intro_key, emphasis_key, max_dpr);

        rsx! {
            canvas {
                class,
                aria_hidden: "true",
            }
        }
    }
}
