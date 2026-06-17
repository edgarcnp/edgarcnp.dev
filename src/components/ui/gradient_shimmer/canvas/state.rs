use wasm_bindgen::closure::Closure;
use web_sys::{CanvasPattern, MutationObserver, ResizeObserver};

use super::{
    config::FULL_CIRCLE,
    model::{Colors, IntroAnimation, Size, Stripe, StripeSizing, WaveSpeedUpAnimation},
    rng::PseudoRng,
};

pub(super) struct RuntimeState {
    pub(super) stripes: Vec<Stripe>,
    pub(super) size: Size,
    pub(super) stripe_width: f64,
    pub(super) stripe_sizing: StripeSizing,
    pub(super) colors: Colors,
    pub(super) grain_pattern: Option<CanvasPattern>,
    pub(super) animation_frame: Option<i32>,
    pub(super) intro_animation: Option<IntroAnimation>,
    pub(super) speed_up_animation: Option<WaveSpeedUpAnimation>,
    pub(super) wave_phase: f64,
    pub(super) secondary_wave_phase: f64,
    pub(super) last_frame_time: Option<f64>,
    seed: u32,
    pub(super) draw_closure: Option<Closure<dyn FnMut(f64)>>,
    pub(super) resize_closure: Option<Closure<dyn FnMut()>>,
    pub(super) color_closure: Option<Closure<dyn FnMut()>>,
    pub(super) motion_closure: Option<Closure<dyn FnMut()>>,
    pub(super) resize_observer: Option<ResizeObserver>,
    pub(super) theme_observer: Option<MutationObserver>,
}

impl RuntimeState {
    pub(super) fn new(seed: u32) -> Self {
        let seed = if seed == 0 { 0x9e37_79b9 } else { seed };
        let mut rng = PseudoRng::new(seed);
        let wave_phase = rng.next_f64() * FULL_CIRCLE;

        Self {
            stripes: Vec::new(),
            size: Size::default(),
            stripe_width: StripeSizing::default().min_width,
            stripe_sizing: StripeSizing::default(),
            colors: Colors::default(),
            grain_pattern: None,
            animation_frame: None,
            intro_animation: None,
            speed_up_animation: None,
            wave_phase,
            secondary_wave_phase: -wave_phase * 0.7,
            last_frame_time: None,
            seed,
            draw_closure: None,
            resize_closure: None,
            color_closure: None,
            motion_closure: None,
            resize_observer: None,
            theme_observer: None,
        }
    }

    pub(super) fn next_seed(&mut self) -> u32 {
        self.seed = self
            .seed
            .wrapping_mul(1_664_525)
            .wrapping_add(1_013_904_223);
        self.seed
    }
}
