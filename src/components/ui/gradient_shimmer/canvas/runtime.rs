use std::{cell::RefCell, rc::Rc};

use wasm_bindgen::{JsCast, JsValue};
use web_sys::{CanvasRenderingContext2d, Element, HtmlCanvasElement, MediaQueryList, Window};

use super::{
    config::{IDLE_WAVE_SECONDARY_SPEED, IDLE_WAVE_SPEED},
    dom::match_media,
    drawing::{StripeFrame, draw_grain, draw_stripe},
    model::{IntroAnimation, Size},
    speed::{trigger_speed_up_animation, update_speed_up_animation},
    state::RuntimeState,
    stripes::{is_intro_complete, sync_stripe_count},
    surface::{self, read_computed_styles},
};

#[derive(Clone)]
pub struct GradientShimmerHandle(Rc<Runtime>);

impl GradientShimmerHandle {
    pub fn intro(&self) {
        let reduced_motion = self.0.reduced_motion_query.matches();
        self.0.start_intro(reduced_motion);
    }

    pub fn emphasize(&self) {
        self.0.start_wave_speed_up();
    }
}

pub fn mount(
    element: Element,
    should_intro: bool,
    max_dpr: f64,
) -> Result<GradientShimmerHandle, JsValue> {
    let canvas = element.dyn_into::<HtmlCanvasElement>()?;
    let window = web_sys::window().ok_or_else(|| JsValue::from_str("window is unavailable"))?;
    let context = canvas
        .get_context("2d")?
        .ok_or_else(|| JsValue::from_str("2d canvas context is unavailable"))?
        .dyn_into::<CanvasRenderingContext2d>()?;
    let color_scheme_query = match_media(&window, "(prefers-color-scheme: dark)")?;
    let reduced_motion_query = match_media(&window, "(prefers-reduced-motion: reduce)")?;

    let runtime = Runtime::new(
        window,
        canvas,
        context,
        color_scheme_query,
        reduced_motion_query,
        max_dpr,
    );

    let reduced_motion = runtime.reduced_motion_query.matches();

    runtime.install_callbacks()?;
    runtime.apply_resize()?;

    if should_intro {
        runtime.start_intro(reduced_motion);
    } else {
        runtime.update_motion_preference();
    }

    runtime.state.borrow_mut().initialized = true;

    Ok(GradientShimmerHandle(runtime))
}

pub(super) struct Runtime {
    pub(super) window: Window,
    pub(super) canvas: HtmlCanvasElement,
    pub(super) context: CanvasRenderingContext2d,
    pub(super) color_scheme_query: MediaQueryList,
    pub(super) reduced_motion_query: MediaQueryList,
    pub(super) max_dpr: f64,
    pub(super) state: RefCell<RuntimeState>,
}

impl Runtime {
    fn new(
        window: Window,
        canvas: HtmlCanvasElement,
        context: CanvasRenderingContext2d,
        color_scheme_query: MediaQueryList,
        reduced_motion_query: MediaQueryList,
        max_dpr: f64,
    ) -> Rc<Self> {
        let seed = window
            .performance()
            .map(|performance| performance.now().to_bits() as u32)
            .unwrap_or(0x9e37_79b9);

        Rc::new(Self {
            window,
            canvas,
            context,
            color_scheme_query,
            reduced_motion_query,
            max_dpr,
            state: RefCell::new(RuntimeState::new(seed)),
        })
    }

    fn start_intro(&self, reduced_motion: bool) {
        let time = self.now();

        if reduced_motion {
            self.state.borrow_mut().intro_animation = None;
            self.draw_frame(time);
            return;
        }

        self.state.borrow_mut().intro_animation = Some(IntroAnimation { started_at: time });
        self.request_animation();
    }

    fn start_wave_speed_up(&self) {
        let time = self.now();

        if self.reduced_motion_query.matches() {
            self.state.borrow_mut().speed_up_animation = None;
            self.draw_frame(time);
            return;
        }

        let current = self.state.borrow().speed_up_animation;
        self.state.borrow_mut().speed_up_animation =
            Some(trigger_speed_up_animation(time, current));
        self.request_animation();
    }

    pub(super) fn apply_resize(&self) -> Result<(), JsValue> {
        let rect = self.canvas.get_bounding_client_rect();
        let dpr = capped_device_pixel_ratio(self.window.device_pixel_ratio(), self.max_dpr);
        let css_width = rect.width().max(1.0);
        let css_height = rect.height().max(1.0);

        self.canvas.set_width((css_width * dpr).ceil() as u32);
        self.canvas.set_height((css_height * dpr).ceil() as u32);
        self.context.set_transform(dpr, 0.0, 0.0, dpr, 0.0, 0.0)?;

        {
            let mut state = self.state.borrow_mut();
            state.size = Size {
                width: css_width,
                height: css_height,
                dpr,
            };
        }

        self.read_colors()
    }

    pub(super) fn read_colors(&self) -> Result<(), JsValue> {
        let styles = read_computed_styles(&self.window, &self.canvas)?;
        let colors = surface::read_colors(&styles);
        let stripe_sizing = surface::read_stripe_sizing(&styles);
        let seed = self.state.borrow_mut().next_seed();
        let grain_pattern =
            surface::create_grain_pattern(&self.window, &self.context, &colors, seed)?;
        let mut state = self.state.borrow_mut();
        state.colors = colors;
        state.stripe_sizing = stripe_sizing;
        let width = state.size.width;
        state.stripe_width = sync_stripe_count(&mut state.stripes, width, stripe_sizing);
        state.grain_pattern = grain_pattern;

        Ok(())
    }

    pub(super) fn draw_frame(&self, time: f64) {
        let reduced_motion = self.reduced_motion_query.matches();
        let mut state = self.state.borrow_mut();

        let delta_seconds = if reduced_motion {
            0.0
        } else if let Some(last_frame_time) = state.last_frame_time {
            ((time - last_frame_time) / 1000.0).clamp(0.0, 0.064)
        } else {
            0.0
        };
        let speed_up = update_speed_up_animation(time, state.speed_up_animation);
        let active_intro_animation = if reduced_motion {
            None
        } else {
            state.intro_animation
        };

        state.last_frame_time = if reduced_motion { None } else { Some(time) };
        state.speed_up_animation = if reduced_motion {
            None
        } else {
            speed_up.animation
        };

        if !reduced_motion {
            state.wave_phase += IDLE_WAVE_SPEED * speed_up.multiplier * delta_seconds;
            state.secondary_wave_phase +=
                IDLE_WAVE_SECONDARY_SPEED * speed_up.multiplier * delta_seconds;
        }

        self.context.set_global_alpha(1.0);
        self.context
            .clear_rect(0.0, 0.0, state.size.width, state.size.height);

        let stripe_count = state.stripes.len();
        for (index, stripe) in state.stripes.iter().enumerate() {
            draw_stripe(
                &self.context,
                stripe,
                index,
                state.stripe_width,
                state.size,
                &state.colors,
                StripeFrame {
                    time,
                    intro_animation: active_intro_animation,
                    stripe_count,
                    wave_phase: state.wave_phase,
                    secondary_wave_phase: state.secondary_wave_phase,
                    shine_progress: if reduced_motion {
                        0.0
                    } else {
                        speed_up.shine_progress
                    },
                },
            );
        }

        if let Some(pattern) = state.grain_pattern.as_ref() {
            draw_grain(&self.context, pattern, state.size, &state.colors);
        }

        if is_intro_complete(time, state.intro_animation, stripe_count) {
            state.intro_animation = None;
        }
    }

    pub(super) fn now(&self) -> f64 {
        self.window
            .performance()
            .map(|performance| performance.now())
            .unwrap_or(0.0)
    }
}

fn capped_device_pixel_ratio(device_pixel_ratio: f64, max_dpr: f64) -> f64 {
    let device_pixel_ratio = device_pixel_ratio.max(1.0);

    if max_dpr.is_finite() && max_dpr >= 1.0 {
        device_pixel_ratio.min(max_dpr)
    } else {
        device_pixel_ratio
    }
}

impl Drop for Runtime {
    fn drop(&mut self) {
        let state = self.state.get_mut();

        if let Some(frame) = state.animation_frame.take() {
            let _ = self.window.cancel_animation_frame(frame);
        }

        if let Some(observer) = state.resize_observer.take() {
            observer.disconnect();
        }

        if let Some(observer) = state.theme_observer.take() {
            observer.disconnect();
        }

        self.color_scheme_query.set_onchange(None);
        self.reduced_motion_query.set_onchange(None);
    }
}
