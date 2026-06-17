use super::config::STRIPE_WIDTH_MIN;

#[derive(Clone, Copy, Default)]
pub(super) struct Size {
    pub(super) width: f64,
    pub(super) height: f64,
    pub(super) dpr: f64,
}

#[derive(Clone, Copy)]
pub(super) struct StripeSizing {
    pub(super) min_width: f64,
}

impl StripeSizing {
    pub(super) fn new(min_width: f64) -> Self {
        let default = Self::default();
        let min_width = positive_finite(min_width).unwrap_or(default.min_width);

        Self { min_width }
    }
}

impl Default for StripeSizing {
    fn default() -> Self {
        Self {
            min_width: STRIPE_WIDTH_MIN,
        }
    }
}

fn positive_finite(value: f64) -> Option<f64> {
    (value.is_finite() && value > 0.0).then_some(value)
}

#[derive(Clone)]
pub(super) struct Colors {
    pub(super) alpha: f64,
    pub(super) grain_alpha: f64,
    pub(super) grain_luminance: f64,
    pub(super) grain_contrast: f64,
    pub(super) grain_saturation: f64,
    pub(super) intro_alpha: f64,
    pub(super) start: String,
    pub(super) highlight: String,
    pub(super) speed_up_shine_boost: f64,
}

impl Default for Colors {
    fn default() -> Self {
        Self {
            alpha: 0.7,
            grain_alpha: 0.15,
            grain_luminance: 144.0,
            grain_contrast: 64.0,
            grain_saturation: 32.0,
            intro_alpha: 1.0,
            start: "#0b111d".to_string(),
            highlight: "#5ed6ee".to_string(),
            speed_up_shine_boost: 0.15,
        }
    }
}

#[derive(Clone, Copy)]
pub(super) struct Stripe {
    pub(super) phase: f64,
    pub(super) secondary_phase: f64,
}

#[derive(Clone, Copy)]
pub(super) struct IntroAnimation {
    pub(super) started_at: f64,
}

#[derive(Clone, Copy)]
pub(super) enum WaveSpeedUpAnimation {
    RampUp {
        started_at: f64,
        duration: f64,
        from: WaveSpeedUpValues,
    },
    Hold {
        started_at: f64,
    },
    RampDown {
        started_at: f64,
        from: WaveSpeedUpValues,
    },
}

#[derive(Clone, Copy)]
pub(super) struct WaveSpeedUpValues {
    pub(super) multiplier: f64,
    pub(super) shine_progress: f64,
}

#[derive(Clone, Copy)]
pub(super) struct WaveSpeedUpAnimationState {
    pub(super) animation: Option<WaveSpeedUpAnimation>,
    pub(super) multiplier: f64,
    pub(super) shine_progress: f64,
}
