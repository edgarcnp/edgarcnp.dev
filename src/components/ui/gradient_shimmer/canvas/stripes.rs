use super::{
    config::{
        IDLE_WAVE_PRIMARY_AMPLITUDE, IDLE_WAVE_SECONDARY_AMPLITUDE,
        IDLE_WAVE_SECONDARY_STRIPE_PHASE, IDLE_WAVE_STRIPE_PHASE, INTRO_DELAY,
        INTRO_IDLE_BLEND_DURATION, INTRO_REVEAL_DURATION, INTRO_STAGGER,
    },
    math::{clamp, ease_out_cubic},
    model::{IntroAnimation, Stripe, StripeSizing},
};

pub(super) fn sync_stripe_count(
    stripes: &mut Vec<Stripe>,
    width: f64,
    sizing: StripeSizing,
) -> f64 {
    let count = (width / sizing.min_width).floor().max(1.0) as usize;

    while stripes.len() < count {
        stripes.push(create_stripe(stripes.len()));
    }

    stripes.truncate(count);
    width / count as f64
}

pub(super) fn get_intro_reveal_progress(
    time: f64,
    intro_animation: Option<IntroAnimation>,
    index: usize,
    stripe_count: usize,
) -> f64 {
    let Some(intro_animation) = intro_animation else {
        return 1.0;
    };

    get_staggered_progress(
        time,
        intro_animation.started_at,
        index,
        stripe_count,
        INTRO_REVEAL_DURATION,
        INTRO_STAGGER,
        INTRO_DELAY,
    )
}

pub(super) fn get_intro_idle_progress(
    time: f64,
    intro_animation: Option<IntroAnimation>,
    index: usize,
    stripe_count: usize,
) -> f64 {
    let Some(intro_animation) = intro_animation else {
        return 1.0;
    };

    let elapsed = time
        - intro_animation.started_at
        - INTRO_DELAY
        - get_reveal_delay(index, stripe_count)
        - INTRO_REVEAL_DURATION;

    ease_out_cubic(clamp(elapsed / INTRO_IDLE_BLEND_DURATION, 0.0, 1.0))
}

pub(super) fn is_intro_complete(
    time: f64,
    intro_animation: Option<IntroAnimation>,
    stripe_count: usize,
) -> bool {
    let Some(intro_animation) = intro_animation else {
        return true;
    };

    let complete_at = intro_animation.started_at
        + INTRO_DELAY
        + get_max_reveal_delay(stripe_count)
        + INTRO_REVEAL_DURATION
        + INTRO_IDLE_BLEND_DURATION;

    time >= complete_at
}

pub(super) fn get_idle_center(stripe: &Stripe, wave_phase: f64, secondary_wave_phase: f64) -> f64 {
    let primary_wave = (wave_phase - stripe.phase).sin();
    let secondary_wave = (secondary_wave_phase + stripe.secondary_phase).sin();

    0.5 + primary_wave * IDLE_WAVE_PRIMARY_AMPLITUDE
        + secondary_wave * IDLE_WAVE_SECONDARY_AMPLITUDE
}

fn create_stripe(index: usize) -> Stripe {
    Stripe {
        phase: index as f64 * IDLE_WAVE_STRIPE_PHASE,
        secondary_phase: index as f64 * IDLE_WAVE_SECONDARY_STRIPE_PHASE,
    }
}

fn get_reveal_delay(index: usize, stripe_count: usize) -> f64 {
    let center_index = (stripe_count.saturating_sub(1)) as f64 / 2.0;
    let center_distance = if stripe_count.is_multiple_of(2) {
        0.5
    } else {
        0.0
    };
    let distance_from_center = (index as f64 - center_index).abs() - center_distance;

    distance_from_center.max(0.0) * INTRO_STAGGER
}

fn get_max_reveal_delay(stripe_count: usize) -> f64 {
    if stripe_count == 0 {
        return 0.0;
    }

    get_reveal_delay(0, stripe_count).max(get_reveal_delay(stripe_count - 1, stripe_count))
}

fn get_staggered_progress(
    time: f64,
    started_at: f64,
    index: usize,
    stripe_count: usize,
    duration: f64,
    stagger: f64,
    delay: f64,
) -> f64 {
    let center_index = (stripe_count.saturating_sub(1)) as f64 / 2.0;
    let center_distance = if stripe_count.is_multiple_of(2) {
        0.5
    } else {
        0.0
    };
    let distance_from_center = (index as f64 - center_index).abs() - center_distance;
    let reveal_delay = distance_from_center.max(0.0) * stagger;
    let elapsed = time - started_at - delay - reveal_delay;

    ease_out_cubic(clamp(elapsed / duration, 0.0, 1.0))
}
