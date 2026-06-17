pub(super) fn snap_to_device_pixel(value: f64, dpr: f64) -> f64 {
    (value * dpr).round() / dpr
}

pub(super) fn lerp(start: f64, end: f64, progress: f64) -> f64 {
    start + (end - start) * progress
}

pub(super) fn ease_out_cubic(value: f64) -> f64 {
    1.0 - (1.0 - value).powi(3)
}

pub(super) fn ease_in_out_cubic(value: f64) -> f64 {
    if value < 0.5 {
        4.0 * value * value * value
    } else {
        1.0 - (-2.0 * value + 2.0).powi(3) / 2.0
    }
}

pub(super) fn clamp(value: f64, min: f64, max: f64) -> f64 {
    value.max(min).min(max)
}
