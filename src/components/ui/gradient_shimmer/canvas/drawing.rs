use web_sys::{CanvasPattern, CanvasRenderingContext2d};

use super::{
    config::{
        GRADIENT_BAND_WIDTH, GRADIENT_MAX_STOP, GRADIENT_MIN_STOP, INTRO_IDLE_CENTER,
        INTRO_START_CENTER,
    },
    math::{clamp, lerp, snap_to_device_pixel},
    model::{Colors, IntroAnimation, Size, Stripe},
    stripes::{get_idle_center, get_intro_idle_progress, get_intro_reveal_progress},
};

pub(super) struct StripeFrame {
    pub(super) time: f64,
    pub(super) intro_animation: Option<IntroAnimation>,
    pub(super) stripe_count: usize,
    pub(super) wave_phase: f64,
    pub(super) secondary_wave_phase: f64,
    pub(super) shine_progress: f64,
}

pub(super) fn draw_stripe(
    context: &CanvasRenderingContext2d,
    stripe: &Stripe,
    index: usize,
    stripe_width: f64,
    size: Size,
    colors: &Colors,
    frame: &StripeFrame,
) {
    let x = snap_to_device_pixel(index as f64 * stripe_width, size.dpr);
    let next_x = if index == frame.stripe_count.saturating_sub(1) {
        size.width
    } else {
        snap_to_device_pixel((index + 1) as f64 * stripe_width, size.dpr)
    };
    let width = next_x - x;

    let (alpha, center, reveal_progress) = if frame.intro_animation.is_none() {
        let idle_center = get_idle_center(stripe, frame.wave_phase, frame.secondary_wave_phase);
        (colors.alpha, idle_center, 1.0)
    } else {
        let reveal_progress = get_intro_reveal_progress(
            frame.time,
            frame.intro_animation,
            index,
            frame.stripe_count,
        );
        let idle_progress = get_intro_idle_progress(
            frame.time,
            frame.intro_animation,
            index,
            frame.stripe_count,
        );
        let alpha =
            colors.intro_alpha + (colors.alpha - colors.intro_alpha) * idle_progress;
        let intro_center = lerp(INTRO_START_CENTER, INTRO_IDLE_CENTER, reveal_progress);
        let idle_center = get_idle_center(stripe, frame.wave_phase, frame.secondary_wave_phase);
        let center = intro_center + (idle_center - intro_center) * idle_progress;
        (alpha, center, reveal_progress)
    };
    let band_start = clamp(
        center - GRADIENT_BAND_WIDTH,
        GRADIENT_MIN_STOP,
        GRADIENT_MAX_STOP,
    );
    let band_end = clamp(
        center + GRADIENT_BAND_WIDTH,
        GRADIENT_MIN_STOP,
        GRADIENT_MAX_STOP,
    );
    let gradient =
        context.create_linear_gradient(x, size.height * -0.35, next_x, size.height * 1.35);

    context.set_global_alpha(alpha);
    context.set_fill_style_str(&colors.start);
    context.fill_rect(x, 0.0, width, size.height);

    let _ = gradient.add_color_stop(0.0, &colors.highlight);
    let _ = gradient.add_color_stop(band_start as f32, &colors.start);
    let _ = gradient.add_color_stop(center as f32, &colors.highlight);
    let _ = gradient.add_color_stop(band_end as f32, &colors.start);
    let _ = gradient.add_color_stop(1.0, &colors.start);

    context.set_global_alpha(
        clamp(
            alpha * (1.0 + frame.shine_progress * colors.speed_up_shine_boost),
            0.0,
            1.0,
        ) * reveal_progress,
    );
    context.set_fill_style_canvas_gradient(&gradient);
    context.fill_rect(x, 0.0, width, size.height);
}

pub(super) fn draw_grain(
    context: &CanvasRenderingContext2d,
    pattern: &CanvasPattern,
    size: Size,
    colors: &Colors,
) {
    context.save();
    context.set_global_alpha(colors.grain_alpha);
    let _ = context.set_global_composite_operation("overlay");
    context.set_fill_style_canvas_pattern(pattern);
    context.fill_rect(0.0, 0.0, size.width, size.height);
    context.restore();
}
