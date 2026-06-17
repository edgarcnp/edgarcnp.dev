use super::{
    config::{
        WAVE_SPEED_UP_MULTIPLIER, WAVE_SPEED_UP_RAMP_DOWN_DURATION, WAVE_SPEED_UP_RAMP_UP_DURATION,
        WAVE_SPEED_UP_WAVE_DURATION,
    },
    math::{clamp, ease_in_out_cubic, ease_out_cubic, lerp},
    model::{WaveSpeedUpAnimation, WaveSpeedUpAnimationState, WaveSpeedUpValues},
};

pub(super) const IDLE_SPEED_UP: WaveSpeedUpValues = WaveSpeedUpValues {
    multiplier: 1.0,
    shine_progress: 0.0,
};

const PEAK_SPEED_UP: WaveSpeedUpValues = WaveSpeedUpValues {
    multiplier: WAVE_SPEED_UP_MULTIPLIER,
    shine_progress: 1.0,
};

pub(super) fn trigger_speed_up_animation(
    time: f64,
    speed_up_animation: Option<WaveSpeedUpAnimation>,
) -> WaveSpeedUpAnimation {
    let current = update_speed_up_animation(time, speed_up_animation);
    let from = WaveSpeedUpValues {
        multiplier: current.multiplier,
        shine_progress: current.shine_progress,
    };

    if is_speed_up_at_peak(from) {
        return WaveSpeedUpAnimation::Hold { started_at: time };
    }

    WaveSpeedUpAnimation::RampUp {
        started_at: time,
        duration: get_speed_up_ramp_up_duration(from),
        from,
    }
}

pub(super) fn update_speed_up_animation(
    time: f64,
    speed_up_animation: Option<WaveSpeedUpAnimation>,
) -> WaveSpeedUpAnimationState {
    let Some(speed_up_animation) = speed_up_animation else {
        return WaveSpeedUpAnimationState {
            animation: None,
            multiplier: IDLE_SPEED_UP.multiplier,
            shine_progress: IDLE_SPEED_UP.shine_progress,
        };
    };

    match speed_up_animation {
        WaveSpeedUpAnimation::RampUp {
            started_at,
            duration,
            from,
        } => {
            let progress = get_progress(time, started_at, duration);
            let values = lerp_speed_up_values(from, PEAK_SPEED_UP, ease_out_cubic(progress));

            if progress >= 1.0 {
                return WaveSpeedUpAnimationState {
                    animation: Some(WaveSpeedUpAnimation::Hold { started_at: time }),
                    multiplier: values.multiplier,
                    shine_progress: values.shine_progress,
                };
            }

            WaveSpeedUpAnimationState {
                animation: Some(speed_up_animation),
                multiplier: values.multiplier,
                shine_progress: values.shine_progress,
            }
        }
        WaveSpeedUpAnimation::Hold { started_at } => {
            let progress = get_progress(time, started_at, WAVE_SPEED_UP_WAVE_DURATION);

            if progress >= 1.0 {
                return WaveSpeedUpAnimationState {
                    animation: Some(WaveSpeedUpAnimation::RampDown {
                        started_at: time,
                        from: PEAK_SPEED_UP,
                    }),
                    multiplier: PEAK_SPEED_UP.multiplier,
                    shine_progress: PEAK_SPEED_UP.shine_progress,
                };
            }

            WaveSpeedUpAnimationState {
                animation: Some(speed_up_animation),
                multiplier: PEAK_SPEED_UP.multiplier,
                shine_progress: PEAK_SPEED_UP.shine_progress,
            }
        }
        WaveSpeedUpAnimation::RampDown { started_at, from } => {
            let progress = get_progress(time, started_at, WAVE_SPEED_UP_RAMP_DOWN_DURATION);
            let values = lerp_speed_up_values(from, IDLE_SPEED_UP, ease_in_out_cubic(progress));

            WaveSpeedUpAnimationState {
                animation: (progress < 1.0).then_some(speed_up_animation),
                multiplier: values.multiplier,
                shine_progress: values.shine_progress,
            }
        }
    }
}

fn get_speed_up_ramp_up_duration(from: WaveSpeedUpValues) -> f64 {
    let multiplier_remaining = clamp(
        (WAVE_SPEED_UP_MULTIPLIER - from.multiplier) / (WAVE_SPEED_UP_MULTIPLIER - 1.0),
        0.0,
        1.0,
    );
    let shine_remaining = 1.0 - from.shine_progress;

    (WAVE_SPEED_UP_RAMP_UP_DURATION * multiplier_remaining.max(shine_remaining)).max(1.0)
}

fn is_speed_up_at_peak(values: WaveSpeedUpValues) -> bool {
    values.multiplier >= WAVE_SPEED_UP_MULTIPLIER && values.shine_progress >= 1.0
}

fn lerp_speed_up_values(
    from: WaveSpeedUpValues,
    to: WaveSpeedUpValues,
    progress: f64,
) -> WaveSpeedUpValues {
    WaveSpeedUpValues {
        multiplier: lerp(from.multiplier, to.multiplier, progress),
        shine_progress: lerp(from.shine_progress, to.shine_progress, progress),
    }
}

fn get_progress(time: f64, started_at: f64, duration: f64) -> f64 {
    clamp((time - started_at) / duration, 0.0, 1.0)
}
