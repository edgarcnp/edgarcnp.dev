#[cfg(target_arch = "wasm32")]
mod app;
#[cfg(target_arch = "wasm32")]
mod gpu;
#[cfg(target_arch = "wasm32")]
mod input;
#[cfg(target_arch = "wasm32")]
mod layout;
#[cfg(target_arch = "wasm32")]
mod pipeline;
#[cfg(target_arch = "wasm32")]
mod scene;

#[cfg(target_arch = "wasm32")]
pub fn start_scene(canvas_id: &str) {
    app::start(canvas_id.to_string());
}

#[cfg(not(target_arch = "wasm32"))]
pub fn start_scene(_canvas_id: &str) {}
