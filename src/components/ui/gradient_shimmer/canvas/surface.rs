use wasm_bindgen::{Clamped, JsCast, JsValue};
use web_sys::{
    CssStyleDeclaration, CanvasRenderingContext2d, HtmlCanvasElement, ImageData,
    Window,
};

use super::{
    config::{GRAIN_SIZE, STRIPE_WIDTH_MIN},
    dom::{read_css_number, read_css_string},
    math::clamp,
    model::{Colors, StripeSizing},
    rng::PseudoRng,
    state::RuntimeState,
};

pub(super) fn read_computed_styles(
    window: &Window,
    canvas: &HtmlCanvasElement,
) -> Result<CssStyleDeclaration, JsValue> {
    window
        .get_computed_style(canvas)?
        .ok_or_else(|| JsValue::from_str("computed styles are unavailable"))
}

pub(super) fn read_colors(styles: &CssStyleDeclaration) -> Colors {
    Colors {
        alpha: read_css_number(styles, "--ui-shimmer-alpha", 0.7),
        grain_alpha: read_css_number(styles, "--ui-shimmer-grain-alpha", 0.15),
        grain_luminance: read_css_number(styles, "--ui-shimmer-grain-luminance", 144.0),
        grain_contrast: read_css_number(styles, "--ui-shimmer-grain-contrast", 64.0),
        grain_saturation: read_css_number(styles, "--ui-shimmer-grain-saturation", 32.0),
        intro_alpha: read_css_number(styles, "--ui-shimmer-intro-alpha", 1.0),
        speed_up_shine_boost: read_css_number(styles, "--ui-shimmer-speed-up-shine-boost", 0.15),
        start: read_css_string(styles, "--ui-shimmer-start", "#0b111d"),
        highlight: read_css_string(styles, "--ui-shimmer-highlight", "#5ed6ee"),
    }
}

pub(super) fn read_stripe_sizing(styles: &CssStyleDeclaration) -> StripeSizing {
    let legacy_min_width =
        read_css_number(styles, "--ui-shimmer-stripe-width-min", STRIPE_WIDTH_MIN);

    StripeSizing::new(read_css_number(
        styles,
        "--ui-shimmer-stripe-min-width",
        legacy_min_width,
    ))
}

pub(super) fn ensure_grain_pattern(
    window: &Window,
    context: &CanvasRenderingContext2d,
    state: &mut RuntimeState,
    colors: &Colors,
) -> Result<(), JsValue> {
    let params_changed = (state.grain_luminance - colors.grain_luminance).abs() > f64::EPSILON
        || (state.grain_contrast - colors.grain_contrast).abs() > f64::EPSILON
        || (state.grain_saturation - colors.grain_saturation).abs() > f64::EPSILON;

    if state.grain_pattern.is_some() && !params_changed {
        return Ok(());
    }

    let document = window
        .document()
        .ok_or_else(|| JsValue::from_str("document is unavailable"))?;

    let grain_canvas = match state.grain_canvas.take() {
        Some(canvas) => canvas,
        None => document
            .create_element("canvas")?
            .dyn_into::<HtmlCanvasElement>()?,
    };
    grain_canvas.set_width(GRAIN_SIZE);
    grain_canvas.set_height(GRAIN_SIZE);

    let grain_context = grain_canvas
        .get_context("2d")?
        .ok_or_else(|| JsValue::from_str("2d grain context is unavailable"))?
        .dyn_into::<CanvasRenderingContext2d>()?;

    let pixel_count = (GRAIN_SIZE * GRAIN_SIZE * 4) as usize;
    state.grain_pixels.resize(pixel_count, 0);
    let seed = state.next_seed();
    let pixels = &mut state.grain_pixels[..pixel_count];
    pixels.fill(0);

    let mut rng = PseudoRng::new(seed);

    for pixel in pixels.chunks_exact_mut(4) {
        let luminance = colors.grain_luminance + (rng.next_f64() - 0.5) * colors.grain_contrast;
        let red_shift = (rng.next_f64() - 0.5) * colors.grain_saturation;
        let green_shift = (rng.next_f64() - 0.5) * colors.grain_saturation;
        let blue_shift = (rng.next_f64() - 0.5) * colors.grain_saturation;

        pixel[0] = clamp(luminance + red_shift, 0.0, 255.0) as u8;
        pixel[1] = clamp(luminance + green_shift, 0.0, 255.0) as u8;
        pixel[2] = clamp(luminance + blue_shift, 0.0, 255.0) as u8;
        pixel[3] = 255;
    }

    let image_data =
        ImageData::new_with_u8_clamped_array_and_sh(Clamped(pixels), GRAIN_SIZE, GRAIN_SIZE)?;
    grain_context.put_image_data(&image_data, 0.0, 0.0)?;

    state.grain_pattern =
        context.create_pattern_with_html_canvas_element(&grain_canvas, "repeat")?;
    state.grain_canvas = Some(grain_canvas);
    state.grain_luminance = colors.grain_luminance;
    state.grain_contrast = colors.grain_contrast;
    state.grain_saturation = colors.grain_saturation;

    Ok(())
}
