use std::rc::Rc;

use wasm_bindgen::{JsCast, JsValue, closure::Closure};
use web_sys::{MutationObserver, MutationObserverInit, ResizeObserver};

use super::runtime::Runtime;

impl Runtime {
    pub(super) fn install_callbacks(self: &Rc<Self>) -> Result<(), JsValue> {
        let weak = Rc::downgrade(self);
        let draw_closure = Closure::<dyn FnMut(f64)>::wrap(Box::new(move |time| {
            if let Some(runtime) = weak.upgrade() {
                runtime.on_animation_frame(time);
            }
        }));

        let weak = Rc::downgrade(self);
        let resize_closure = Closure::<dyn FnMut()>::wrap(Box::new(move || {
            if let Some(runtime) = weak.upgrade() {
                if !runtime.state.borrow().initialized {
                    return;
                }
                if runtime.apply_resize().is_ok() {
                    runtime.draw_frame(runtime.now());
                }
            }
        }));

        let resize_observer = ResizeObserver::new(resize_closure.as_ref().unchecked_ref())?;
        resize_observer.observe(&self.canvas);

        let weak = Rc::downgrade(self);
        let color_closure = Closure::<dyn FnMut()>::wrap(Box::new(move || {
            if let Some(runtime) = weak.upgrade()
                && runtime.read_colors().is_ok()
            {
                runtime.draw_frame(runtime.now());
            }
        }));

        let weak = Rc::downgrade(self);
        let motion_closure = Closure::<dyn FnMut()>::wrap(Box::new(move || {
            if let Some(runtime) = weak.upgrade() {
                runtime.update_motion_preference();
            }
        }));

        self.color_scheme_query
            .set_onchange(Some(color_closure.as_ref().unchecked_ref()));
        self.reduced_motion_query
            .set_onchange(Some(motion_closure.as_ref().unchecked_ref()));

        let theme_observer = MutationObserver::new(color_closure.as_ref().unchecked_ref())?;
        if let Some(document_element) = self
            .window
            .document()
            .and_then(|document| document.document_element())
        {
            let options = MutationObserverInit::new();
            options.set_attributes(true);
            theme_observer.observe_with_options(&document_element, &options)?;
        }

        let mut state = self.state.borrow_mut();
        state.draw_closure = Some(draw_closure);
        state.resize_closure = Some(resize_closure);
        state.color_closure = Some(color_closure);
        state.motion_closure = Some(motion_closure);
        state.resize_observer = Some(resize_observer);
        state.theme_observer = Some(theme_observer);

        Ok(())
    }

    pub(super) fn update_motion_preference(&self) {
        let reduced_motion = self.reduced_motion_query.matches();
        {
            let mut state = self.state.borrow_mut();
            state.reduced_motion = reduced_motion;
            state.intro_animation = None;
            state.speed_up_animation = None;
            if reduced_motion {
                state.last_frame_time = None;
            }
        }
        if reduced_motion {
            self.cancel_animation();
        } else {
            self.state.borrow_mut().last_frame_time = None;
            self.request_animation();
        }
        self.draw_frame(self.now());
    }

    pub(super) fn request_animation(&self) {
        let frame = {
            let state = self.state.borrow();
            if state.reduced_motion || state.animation_frame.is_some() {
                return;
            }
            let Some(callback) = state.draw_closure.as_ref() else {
                return;
            };

            self.window
                .request_animation_frame(callback.as_ref().unchecked_ref())
                .ok()
        };

        if let Some(frame) = frame {
            self.state.borrow_mut().animation_frame = Some(frame);
        }
    }

    pub(super) fn cancel_animation(&self) {
        let frame = self.state.borrow_mut().animation_frame.take();

        if let Some(frame) = frame {
            let _ = self.window.cancel_animation_frame(frame);
        }
    }

    fn on_animation_frame(&self, time: f64) {
        self.state.borrow_mut().animation_frame = None;
        self.draw_frame(time);

        if !self.state.borrow().reduced_motion {
            self.request_animation();
        }
    }
}
