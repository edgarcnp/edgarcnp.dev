use super::input::InputSnapshot;

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct SceneUniforms {
    resolution: [f32; 2],
    time: f32,
    scroll: f32,
    pointer: [f32; 2],
    reduced_motion: f32,
    intensity: f32,
}

impl Default for SceneUniforms {
    fn default() -> Self {
        Self {
            resolution: [1.0, 1.0],
            time: 0.0,
            scroll: 0.0,
            pointer: [0.5, 0.5],
            reduced_motion: 0.0,
            intensity: 1.0,
        }
    }
}

pub struct SceneState {
    time: f32,
    pointer: [f32; 2],
    scroll: f32,
    reduced_motion: bool,
}

impl SceneState {
    pub fn new() -> Self {
        Self {
            time: 0.0,
            pointer: [0.5, 0.5],
            scroll: 0.0,
            reduced_motion: false,
        }
    }

    pub fn update(&mut self, dt: f32, input: &InputSnapshot) {
        self.reduced_motion = input.reduced_motion;
        if !self.reduced_motion {
            self.time += dt;
        }

        self.pointer[0] = smooth(self.pointer[0], input.pointer_x, 0.08);
        self.pointer[1] = smooth(self.pointer[1], input.pointer_y, 0.08);
        self.scroll = smooth(self.scroll, input.scroll_progress, 0.12);
    }

    pub fn uniforms(&self, width: u32, height: u32) -> SceneUniforms {
        SceneUniforms {
            resolution: [width as f32, height as f32],
            time: self.time,
            scroll: self.scroll,
            pointer: self.pointer,
            reduced_motion: self.reduced_motion as u8 as f32,
            intensity: if self.reduced_motion { 0.35 } else { 1.0 },
        }
    }
}

fn smooth(current: f32, target: f32, amount: f32) -> f32 {
    current + (target - current) * amount
}
