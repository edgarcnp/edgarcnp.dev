use std::cell::Cell;
use std::rc::Rc;

use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;
use web_sys::{
    Element, Event, MutationObserver, MutationObserverInit, ResizeObserver, window,
};

use super::scene::{MAX_REACTIVE_RECTS, ReactiveRectGpu, ReactiveRectsUniform};

const REACTIVE_SELECTOR: &str = "[data-bg-reactive]";
const DEFAULT_RADIUS: f32 = 10.0;
const DEFAULT_INFLUENCE: f32 = 1.0;
const OFFSCREEN_MARGIN_PX: f32 = 96.0;
const SETTLE_FRAMES: u8 = 8;

pub struct ComponentBounds {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub radius: f32,
    pub influence: f32,
}

pub struct ReactiveBoundsTracker {
    dirty: Rc<Cell<bool>>,
    settle_frames: Rc<Cell<u8>>,
    element_size_observer: Option<ResizeObserver>,
    _element_size_observer_callback: Option<Closure<dyn FnMut()>>,
    _mutation_observer: Option<MutationObserver>,
    _mutation_callback: Option<Closure<dyn FnMut()>>,
    _window_size_listener: Option<Closure<dyn FnMut(Event)>>,
    _scroll_listener: Option<Closure<dyn FnMut(Event)>>,
}

impl ReactiveBoundsTracker {
    pub fn new() -> Self {
        let dirty = Rc::new(Cell::new(true));
        let settle_frames = Rc::new(Cell::new(SETTLE_FRAMES));

        let (element_size_observer, element_size_observer_callback) =
            element_size_observer(Rc::clone(&dirty), Rc::clone(&settle_frames));
        let (mutation_observer, mutation_callback) =
            mutation_observer(Rc::clone(&dirty), Rc::clone(&settle_frames));
        let window_size_listener = window_listener(
            concat!("resi", "ze"),
            Rc::clone(&dirty),
            Rc::clone(&settle_frames),
        );
        let scroll_listener = window_listener("scroll", Rc::clone(&dirty), Rc::clone(&settle_frames));

        Self {
            dirty,
            settle_frames,
            element_size_observer,
            _element_size_observer_callback: element_size_observer_callback,
            _mutation_observer: mutation_observer,
            _mutation_callback: mutation_callback,
            _window_size_listener: window_size_listener,
            _scroll_listener: scroll_listener,
        }
    }

    pub fn mark_dirty(&self) {
        mark_dirty(&self.dirty, &self.settle_frames);
    }

    pub fn measure_if_dirty(&mut self) -> Option<ReactiveRectsUniform> {
        let settling = self.settle_frames.get();
        if !self.dirty.get() && settling == 0 {
            return None;
        }

        self.dirty.set(false);
        if settling > 0 {
            self.settle_frames.set(settling - 1);
        }

        Some(self.measure())
    }

    fn measure(&mut self) -> ReactiveRectsUniform {
        let Some(viewport) = Viewport::current() else {
            return ReactiveRectsUniform::default();
        };
        let Some(document) = window().and_then(|window| window.document()) else {
            return ReactiveRectsUniform::default();
        };
        let Ok(nodes) = document.query_selector_all(REACTIVE_SELECTOR) else {
            return ReactiveRectsUniform::default();
        };

        if let Some(observer) = &self.element_size_observer {
            observer.disconnect();
        }

        let mut bounds = Vec::new();
        for index in 0..nodes.length() {
            if bounds.len() == MAX_REACTIVE_RECTS {
                break;
            }

            let Some(element) = nodes
                .item(index)
                .and_then(|node| node.dyn_into::<Element>().ok())
            else {
                continue;
            };

            if let Some(observer) = &self.element_size_observer {
                observer.observe(&element);
            }

            let rect = element.get_bounding_client_rect();
            let width = rect.width() as f32;
            let height = rect.height() as f32;
            if width <= 0.5 || height <= 0.5 {
                continue;
            }

            let x = rect.left() as f32;
            let y = rect.top() as f32;
            if x + width < -OFFSCREEN_MARGIN_PX
                || x > viewport.width + OFFSCREEN_MARGIN_PX
                || y + height < -OFFSCREEN_MARGIN_PX
                || y > viewport.height + OFFSCREEN_MARGIN_PX
            {
                continue;
            }

            bounds.push(ComponentBounds {
                id: element
                    .get_attribute("data-bg-reactive")
                    .unwrap_or_else(|| format!("reactive-surface-{index}")),
                x,
                y,
                width,
                height,
                radius: attribute_f32(&element, "data-bg-radius", DEFAULT_RADIUS),
                influence: attribute_f32(&element, "data-bg-influence", DEFAULT_INFLUENCE)
                    .clamp(0.0, 2.0),
            });
        }

        viewport.normalize(&bounds)
    }
}

struct Viewport {
    width: f32,
    height: f32,
    aspect: f32,
}

impl Viewport {
    fn current() -> Option<Self> {
        let browser_window = window()?;
        let width = browser_window.inner_width().ok()?.as_f64()? as f32;
        let height = browser_window.inner_height().ok()?.as_f64()? as f32;
        if width <= 1.0 || height <= 1.0 {
            return None;
        }

        Some(Self {
            width,
            height,
            aspect: width / height,
        })
    }

    fn normalize(&self, bounds: &[ComponentBounds]) -> ReactiveRectsUniform {
        let mut uniform = ReactiveRectsUniform::default();
        let count = bounds.len().min(MAX_REACTIVE_RECTS);
        uniform.count = count as u32;

        for (index, bounds) in bounds.iter().take(count).enumerate() {
            debug_assert!(!bounds.id.is_empty());

            let center_x = ((bounds.x + bounds.width * 0.5) / self.width - 0.5) * self.aspect;
            let center_y = 1.0 - (bounds.y + bounds.height * 0.5) / self.height - 0.5;
            let half_width = bounds.width / self.height * 0.5;
            let half_height = bounds.height / self.height * 0.5;
            let radius = (bounds.radius / self.height).min(half_width.min(half_height) * 0.85);

            uniform.rects[index] = ReactiveRectGpu {
                center: [center_x, center_y],
                half_size: [half_width, half_height],
                radius,
                influence: bounds.influence,
                _padding: [0.0; 2],
            };
        }

        uniform
    }
}

fn attribute_f32(element: &Element, name: &str, fallback: f32) -> f32 {
    element
        .get_attribute(name)
        .and_then(|value| value.parse::<f32>().ok())
        .filter(|value| value.is_finite())
        .unwrap_or(fallback)
}

fn element_size_observer(
    dirty: Rc<Cell<bool>>,
    settle_frames: Rc<Cell<u8>>,
) -> (Option<ResizeObserver>, Option<Closure<dyn FnMut()>>) {
    let callback = Closure::wrap(Box::new(move || {
        mark_dirty(&dirty, &settle_frames);
    }) as Box<dyn FnMut()>);

    match ResizeObserver::new(callback.as_ref().unchecked_ref()) {
        Ok(observer) => (Some(observer), Some(callback)),
        Err(_) => (None, None),
    }
}

fn mutation_observer(
    dirty: Rc<Cell<bool>>,
    settle_frames: Rc<Cell<u8>>,
) -> (Option<MutationObserver>, Option<Closure<dyn FnMut()>>) {
    let callback = Closure::wrap(Box::new(move || {
        mark_dirty(&dirty, &settle_frames);
    }) as Box<dyn FnMut()>);

    let Ok(observer) = MutationObserver::new(callback.as_ref().unchecked_ref()) else {
        return (None, None);
    };

    if let Some(root) = window()
        .and_then(|window| window.document())
        .and_then(|document| document.document_element())
    {
        let options = MutationObserverInit::new();
        options.set_child_list(true);
        options.set_subtree(true);
        options.set_attributes(true);
        let _ = observer.observe_with_options(&root, &options);
    }

    (Some(observer), Some(callback))
}

fn window_listener(
    event_name: &str,
    dirty: Rc<Cell<bool>>,
    settle_frames: Rc<Cell<u8>>,
) -> Option<Closure<dyn FnMut(Event)>> {
    let listener = Closure::wrap(Box::new(move |_event: Event| {
        mark_dirty(&dirty, &settle_frames);
    }) as Box<dyn FnMut(Event)>);

    window()
        .and_then(|window| {
            window
                .add_event_listener_with_callback(event_name, listener.as_ref().unchecked_ref())
                .ok()
        })
        .map(|_| listener)
}

fn mark_dirty(dirty: &Cell<bool>, settle_frames: &Cell<u8>) {
    dirty.set(true);
    settle_frames.set(SETTLE_FRAMES);
}
