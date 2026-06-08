use std::cell::RefCell;
use std::rc::Rc;

use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;
use wasm_bindgen_futures::spawn_local;
use web_sys::{HtmlCanvasElement, window};

use super::gpu::{GpuContext, RendererError};
use super::input::SceneInput;
use super::layout::ReactiveBoundsTracker;
use super::pipeline::ScenePipeline;
use super::scene::SceneState;

thread_local! {
    static ACTIVE_SCENE: RefCell<Option<SceneHandle>> = const { RefCell::new(None) };
}

struct SceneHandle {
    _loop: Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>>,
}

pub fn start(canvas_id: String) {
    ACTIVE_SCENE.with(|active| {
        if active.borrow().is_some() {
            return;
        }

        spawn_local(async move {
            let Some(canvas) = canvas_by_id(&canvas_id) else {
                return;
            };

            let renderer = match Renderer::new(canvas).await {
                Ok(renderer) => renderer,
                Err(error) => {
                    web_sys::console::error_1(
                        &format!("portfolio scene renderer failed: {error:?}").into(),
                    );
                    return;
                }
            };

            let handle = start_loop(renderer);
            ACTIVE_SCENE.with(|active| {
                *active.borrow_mut() = Some(handle);
            });
        });
    });
}

fn canvas_by_id(canvas_id: &str) -> Option<HtmlCanvasElement> {
    window()?
        .document()?
        .get_element_by_id(canvas_id)?
        .dyn_into::<HtmlCanvasElement>()
        .ok()
}

fn start_loop(renderer: Renderer) -> SceneHandle {
    let renderer = Rc::new(RefCell::new(renderer));
    let loop_closure: Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>> = Rc::new(RefCell::new(None));
    let loop_handle = Rc::clone(&loop_closure);
    let renderer_handle = Rc::clone(&renderer);
    let mut last_time: Option<f64> = None;

    *loop_handle.borrow_mut() = Some(Closure::wrap(Box::new(move |time: f64| {
        let dt = last_time
            .map(|last| ((time - last) / 1000.0).clamp(0.0, 0.05) as f32)
            .unwrap_or(0.0);
        last_time = Some(time);

        renderer_handle.borrow_mut().frame(dt);

        if let Some(window) = window() {
            if let Some(callback) = loop_closure.borrow().as_ref() {
                let _ = window.request_animation_frame(callback.as_ref().unchecked_ref());
            }
        }
    }) as Box<dyn FnMut(f64)>));

    if let Some(window) = window() {
        if let Some(callback) = loop_handle.borrow().as_ref() {
            let _ = window.request_animation_frame(callback.as_ref().unchecked_ref());
        }
    }

    SceneHandle { _loop: loop_handle }
}

struct Renderer {
    gpu: GpuContext,
    input: SceneInput,
    bounds: ReactiveBoundsTracker,
    scene: SceneState,
    pipeline: ScenePipeline,
}

impl Renderer {
    async fn new(canvas: HtmlCanvasElement) -> Result<Self, RendererError> {
        let gpu = GpuContext::new(canvas).await?;
        let input = SceneInput::new();
        let bounds = ReactiveBoundsTracker::new();
        let scene = SceneState::new();
        let pipeline = ScenePipeline::new(&gpu.device, gpu.config.format);

        Ok(Self {
            gpu,
            input,
            bounds,
            scene,
            pipeline,
        })
    }

    fn frame(&mut self, dt: f32) {
        if self.gpu.resize_if_needed() {
            self.bounds.mark_dirty();
        }
        if let Some(rects) = self.bounds.measure_if_dirty() {
            self.pipeline
                .update_reactive_rects(&self.gpu.queue, rects);
        }
        self.scene.update(dt, &self.input.snapshot());
        self.pipeline.update_uniforms(
            &self.gpu.queue,
            self.scene
                .uniforms(self.gpu.config.width, self.gpu.config.height),
        );
        self.render();
    }

    fn render(&mut self) {
        let Some(output) = self.gpu.current_texture() else {
            return;
        };

        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());
        let mut encoder = self
            .gpu
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("portfolio-render-encoder"),
            });

        self.pipeline.render(&mut encoder, &view);

        self.gpu.queue.submit(Some(encoder.finish()));
        output.present();
    }
}
