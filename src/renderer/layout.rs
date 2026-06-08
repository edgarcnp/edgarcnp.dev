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
#[cfg(debug_assertions)]
const DEBUG_OVERLAY_ID: &str = "portfolio-reactive-rect-debug-overlay";

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
    #[cfg(debug_assertions)]
    debug_signature: Option<String>,
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
            #[cfg(debug_assertions)]
            debug_signature: None,
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

        self.update_debug_overlay(&bounds);
        viewport.normalize(&bounds)
    }

    fn update_debug_overlay(&mut self, bounds: &[ComponentBounds]) {
        #[cfg(debug_assertions)]
        {
            let signature = debug_signature(bounds);
            if self.debug_signature.as_deref() == Some(signature.as_str()) {
                return;
            }

            self.debug_signature = Some(signature);
            render_debug_overlay(bounds);
        }
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

#[cfg(debug_assertions)]
fn debug_signature(bounds: &[ComponentBounds]) -> String {
    let mut signature = String::new();
    for bounds in bounds {
        signature.push_str(&format!(
            "{}:{:.1}:{:.1}:{:.1}:{:.1}:{:.1}:{:.2};",
            bounds.id,
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            bounds.radius,
            bounds.influence
        ));
    }
    signature
}

#[cfg(debug_assertions)]
fn render_debug_overlay(bounds: &[ComponentBounds]) {
    let Some(document) = window().and_then(|window| window.document()) else {
        return;
    };
    let Some(root) = document.document_element() else {
        return;
    };

    let overlay = if let Some(overlay) = document.get_element_by_id(DEBUG_OVERLAY_ID) {
        overlay
    } else {
        let Ok(overlay) = document.create_element("div") else {
            return;
        };
        overlay.set_id(DEBUG_OVERLAY_ID);
        let _ = root.append_child(&overlay);
        overlay
    };

    overlay.set_text_content(None);
    let _ = overlay.set_attribute(
        "style",
        concat!(
            "position:fi",
            "xed;inset:0;z-index:2147483647;",
            "pointer-events:none;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;",
            "color:#f8fafc;"
        ),
    );

    if let Ok(panel) = document.create_element("div") {
        let _ = panel.set_attribute(
            "style",
            concat!(
                "position:fi",
                "xed;right:12px;top:12px;max-width:min(520px,calc(100vw - 24px));",
                "max-height:calc(100vh - 24px);overflow:auto;padding:10px 12px;",
                "border:1px solid rgba(250,204,21,.85);background:rgba(2,6,23,.88);",
                "box-shadow:0 0 0 1px rgba(0,0,0,.45),0 12px 32px rgba(0,0,0,.45);",
                "border-radius:6px;white-space:pre;pointer-events:none;"
            ),
        );
        panel.set_text_content(Some(&debug_panel_text(bounds)));
        let _ = overlay.append_child(&panel);
    }

    for (index, bounds) in bounds.iter().enumerate() {
        let color = debug_color(index);
        let Ok(rect) = document.create_element("div") else {
            continue;
        };
        let _ = rect.set_attribute(
            "style",
            &format!(
                concat!(
                    "position:fi",
                    "xed;left:{:.1}px;top:{:.1}px;width:{:.1}px;height:{:.1}px;",
                    "border:1px solid {};box-shadow:0 0 0 1px rgba(0,0,0,.7),0 0 18px {};",
                    "background:{};border-radius:{:.1}px;box-sizing:border-box;",
                    "pointer-events:none;"
                ),
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                color.border,
                color.glow,
                color.fill,
                bounds.radius
            ),
        );

        if let Ok(label) = document.create_element("div") {
            let _ = label.set_attribute(
                "style",
                &format!(
                    concat!(
                        "position:absolute;left:0;top:0;max-width:min(360px,{:.1}px);",
                        "transform:translateY(-100%);padding:3px 5px;",
                        "background:{};border:1px solid {};border-bottom:0;",
                        "border-radius:4px 4px 0 0;color:#f8fafc;",
                        "text-shadow:0 1px 2px rgba(0,0,0,.9);white-space:pre;"
                    ),
                    bounds.width.max(120.0),
                    color.label,
                    color.border
                ),
            );
            label.set_text_content(Some(&format!(
                "{}\nx {:.1} y {:.1}  w {:.1} h {:.1}\nr {:.1}  i {:.2}",
                bounds.id,
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                bounds.radius,
                bounds.influence
            )));
            let _ = rect.append_child(&label);
        }

        let _ = overlay.append_child(&rect);
    }
}

#[cfg(debug_assertions)]
fn debug_panel_text(bounds: &[ComponentBounds]) -> String {
    let mut text = format!(
        "Reactive rects sent to wgpu: {} / {}\n\n",
        bounds.len(),
        MAX_REACTIVE_RECTS
    );

    for (index, bounds) in bounds.iter().enumerate() {
        text.push_str(&format!(
            "#{index:02} {}\n  x {:.1}  y {:.1}  w {:.1}  h {:.1}\n  radius {:.1}  influence {:.2}\n",
            bounds.id,
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            bounds.radius,
            bounds.influence
        ));
    }

    text
}

#[cfg(debug_assertions)]
#[derive(Clone, Copy)]
struct DebugColor {
    border: &'static str,
    fill: &'static str,
    glow: &'static str,
    label: &'static str,
}

#[cfg(debug_assertions)]
fn debug_color(index: usize) -> DebugColor {
    const COLORS: [DebugColor; 6] = [
        DebugColor {
            border: "#facc15",
            fill: "rgba(250,204,21,.08)",
            glow: "rgba(250,204,21,.42)",
            label: "rgba(113,63,18,.96)",
        },
        DebugColor {
            border: "#22d3ee",
            fill: "rgba(34,211,238,.08)",
            glow: "rgba(34,211,238,.42)",
            label: "rgba(21,94,117,.96)",
        },
        DebugColor {
            border: "#a78bfa",
            fill: "rgba(167,139,250,.08)",
            glow: "rgba(167,139,250,.42)",
            label: "rgba(76,29,149,.96)",
        },
        DebugColor {
            border: "#34d399",
            fill: "rgba(52,211,153,.08)",
            glow: "rgba(52,211,153,.42)",
            label: "rgba(6,95,70,.96)",
        },
        DebugColor {
            border: "#fb7185",
            fill: "rgba(251,113,133,.08)",
            glow: "rgba(251,113,133,.42)",
            label: "rgba(159,18,57,.96)",
        },
        DebugColor {
            border: "#fb923c",
            fill: "rgba(251,146,60,.08)",
            glow: "rgba(251,146,60,.42)",
            label: "rgba(154,52,18,.96)",
        },
    ];

    COLORS[index % COLORS.len()]
}
