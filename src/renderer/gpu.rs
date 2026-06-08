use web_sys::{HtmlCanvasElement, window};

const MAX_DEVICE_PIXEL_RATIO: f64 = 2.0;

pub struct GpuContext {
    canvas: HtmlCanvasElement,
    size_policy: CanvasSizePolicy,
    pub surface: wgpu::Surface<'static>,
    pub device: wgpu::Device,
    pub queue: wgpu::Queue,
    pub config: wgpu::SurfaceConfiguration,
}

impl GpuContext {
    pub async fn new(canvas: HtmlCanvasElement) -> Result<Self, RendererError> {
        if !wgpu::util::is_browser_webgpu_supported().await {
            return Err(RendererError::UnsupportedBackend(
                "browser WebGPU is not available".to_string(),
            ));
        }

        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::BROWSER_WEBGPU,
            ..wgpu::InstanceDescriptor::new_without_display_handle()
        });
        let surface = instance
            .create_surface(wgpu::SurfaceTarget::Canvas(canvas.clone()))
            .map_err(|error| RendererError::Surface(format!("{error:?}")))?;

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::LowPower,
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .map_err(|error| RendererError::Adapter(format!("{error:?}")))?;
        let size_policy = CanvasSizePolicy::new(&adapter);
        web_sys::console::log_1(
            &format!(
                "portfolio scene backend: BrowserWebGpu, max texture dimension: {}",
                size_policy.max_texture_dimension
            )
            .into(),
        );

        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: Some("portfolio-device"),
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::defaults(),
                experimental_features: wgpu::ExperimentalFeatures::disabled(),
                memory_hints: wgpu::MemoryHints::MemoryUsage,
                trace: wgpu::Trace::Off,
            })
            .await
            .map_err(|error| RendererError::Device(format!("{error:?}")))?;

        let size = size_policy.size_for(&canvas);
        size.apply_to(&canvas);

        let capabilities = surface.get_capabilities(&adapter);
        let format = capabilities
            .formats
            .iter()
            .copied()
            .find(wgpu::TextureFormat::is_srgb)
            .or_else(|| capabilities.formats.first().copied())
            .ok_or_else(|| RendererError::Surface("surface has no formats".to_string()))?;

        let present_mode = capabilities
            .present_modes
            .iter()
            .copied()
            .find(|mode| *mode == wgpu::PresentMode::Fifo)
            .unwrap_or(wgpu::PresentMode::AutoVsync);

        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format,
            width: size.width,
            height: size.height,
            present_mode,
            alpha_mode: capabilities
                .alpha_modes
                .first()
                .copied()
                .unwrap_or(wgpu::CompositeAlphaMode::Auto),
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };
        surface.configure(&device, &config);

        Ok(Self {
            canvas,
            size_policy,
            surface,
            device,
            queue,
            config,
        })
    }

    pub fn resize_if_needed(&mut self) -> bool {
        let size = self.size_policy.size_for(&self.canvas);
        if size.width == self.config.width && size.height == self.config.height {
            return false;
        }

        size.apply_to(&self.canvas);
        self.config.width = size.width;
        self.config.height = size.height;
        self.surface.configure(&self.device, &self.config);
        true
    }

    pub fn current_texture(&mut self) -> Option<wgpu::SurfaceTexture> {
        match self.surface.get_current_texture() {
            wgpu::CurrentSurfaceTexture::Success(output) => Some(output),
            wgpu::CurrentSurfaceTexture::Suboptimal(output) => {
                self.surface.configure(&self.device, &self.config);
                Some(output)
            }
            wgpu::CurrentSurfaceTexture::Outdated | wgpu::CurrentSurfaceTexture::Lost => {
                self.surface.configure(&self.device, &self.config);
                None
            }
            wgpu::CurrentSurfaceTexture::Timeout
            | wgpu::CurrentSurfaceTexture::Occluded
            | wgpu::CurrentSurfaceTexture::Validation => None,
        }
    }
}

#[derive(Clone, Copy)]
struct CanvasSizePolicy {
    max_texture_dimension: u32,
}

impl CanvasSizePolicy {
    fn new(adapter: &wgpu::Adapter) -> Self {
        let max_texture_dimension = adapter.limits().max_texture_dimension_2d.max(1);

        Self {
            max_texture_dimension,
        }
    }

    fn size_for(self, canvas: &HtmlCanvasElement) -> CanvasSize {
        let rect = canvas.get_bounding_client_rect();
        let scale = window()
            .map(|window| window.device_pixel_ratio().min(MAX_DEVICE_PIXEL_RATIO))
            .unwrap_or(1.0);
        let width = scaled_dimension(rect.width(), scale, self.max_texture_dimension);
        let height = scaled_dimension(rect.height(), scale, self.max_texture_dimension);

        CanvasSize { width, height }
    }
}

#[derive(Clone, Copy)]
struct CanvasSize {
    width: u32,
    height: u32,
}

impl CanvasSize {
    fn apply_to(self, canvas: &HtmlCanvasElement) {
        canvas.set_width(self.width);
        canvas.set_height(self.height);
    }
}

fn scaled_dimension(css_pixels: f64, scale: f64, max_dimension: u32) -> u32 {
    ((css_pixels * scale).round() as u32)
        .max(1)
        .min(max_dimension.max(1))
}

pub enum RendererError {
    UnsupportedBackend(String),
    Surface(String),
    Adapter(String),
    Device(String),
}

impl std::fmt::Debug for RendererError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnsupportedBackend(error) => formatter
                .debug_tuple("UnsupportedBackend")
                .field(error)
                .finish(),
            Self::Surface(error) => formatter.debug_tuple("Surface").field(error).finish(),
            Self::Adapter(error) => formatter.debug_tuple("Adapter").field(error).finish(),
            Self::Device(error) => formatter.debug_tuple("Device").field(error).finish(),
        }
    }
}
