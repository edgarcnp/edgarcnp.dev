use wasm_bindgen::JsValue;
use web_sys::{CssStyleDeclaration, MediaQueryList, Window};

pub(super) fn match_media(window: &Window, query: &str) -> Result<MediaQueryList, JsValue> {
    window
        .match_media(query)?
        .ok_or_else(|| JsValue::from_str("media query list is unavailable"))
}

pub(super) fn read_css_number(styles: &CssStyleDeclaration, name: &str, fallback: f64) -> f64 {
    styles
        .get_property_value(name)
        .ok()
        .and_then(|value| value.trim().parse::<f64>().ok())
        .filter(|value| value.is_finite())
        .unwrap_or(fallback)
}

pub(super) fn read_css_string(
    styles: &CssStyleDeclaration,
    name: &str,
    fallback: &'static str,
) -> String {
    match styles.get_property_value(name) {
        Ok(value) if !value.trim().is_empty() => value.trim().to_string(),
        _ => fallback.to_string(),
    }
}
