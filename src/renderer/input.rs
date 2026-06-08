use std::cell::RefCell;
use std::rc::Rc;

use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;
use web_sys::{MouseEvent, window};

pub struct SceneInput {
    pointer: Rc<RefCell<Pointer>>,
    reduced_motion: bool,
    _pointer_listener: Option<Closure<dyn FnMut(MouseEvent)>>,
}

impl SceneInput {
    pub fn new() -> Self {
        let pointer = Rc::new(RefCell::new(Pointer { x: 0.5, y: 0.5 }));
        let mut pointer_listener = None;

        if let Some(browser_window) = window() {
            let pointer_handle = Rc::clone(&pointer);
            let listener = Closure::wrap(Box::new(move |event: MouseEvent| {
                let width = web_sys::window()
                    .and_then(|browser_window| browser_window.inner_width().ok())
                    .and_then(|value| value.as_f64())
                    .unwrap_or(1.0)
                    .max(1.0);
                let height = web_sys::window()
                    .and_then(|browser_window| browser_window.inner_height().ok())
                    .and_then(|value| value.as_f64())
                    .unwrap_or(1.0)
                    .max(1.0);

                *pointer_handle.borrow_mut() = Pointer {
                    x: (event.client_x() as f32 / width as f32).clamp(0.0, 1.0),
                    y: (event.client_y() as f32 / height as f32).clamp(0.0, 1.0),
                };
            }) as Box<dyn FnMut(MouseEvent)>);

            let _ = browser_window
                .add_event_listener_with_callback("mousemove", listener.as_ref().unchecked_ref());
            pointer_listener = Some(listener);
        }

        Self {
            pointer,
            reduced_motion: prefers_reduced_motion(),
            _pointer_listener: pointer_listener,
        }
    }

    pub fn snapshot(&self) -> InputSnapshot {
        let pointer = *self.pointer.borrow();

        InputSnapshot {
            pointer_x: pointer.x,
            pointer_y: pointer.y,
            scroll_progress: scroll_progress(),
            reduced_motion: self.reduced_motion || prefers_reduced_motion(),
        }
    }
}

#[derive(Clone, Copy)]
pub struct InputSnapshot {
    pub pointer_x: f32,
    pub pointer_y: f32,
    pub scroll_progress: f32,
    pub reduced_motion: bool,
}

#[derive(Clone, Copy)]
struct Pointer {
    x: f32,
    y: f32,
}

fn prefers_reduced_motion() -> bool {
    window()
        .and_then(|window| window.match_media("(prefers-reduced-motion: reduce)").ok())
        .flatten()
        .map(|query| query.matches())
        .unwrap_or(false)
}

fn scroll_progress() -> f32 {
    let Some(window) = window() else {
        return 0.0;
    };
    let Some(document) = window.document() else {
        return 0.0;
    };
    let Some(root) = document.document_element() else {
        return 0.0;
    };

    let scroll_y = window.scroll_y().unwrap_or(0.0);
    let viewport_height = window
        .inner_height()
        .ok()
        .and_then(|value| value.as_f64())
        .unwrap_or(1.0);
    let scrollable = (root.scroll_height() as f64 - viewport_height).max(1.0);

    (scroll_y / scrollable).clamp(0.0, 1.0) as f32
}
