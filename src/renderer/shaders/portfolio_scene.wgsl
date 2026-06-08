struct SceneUniforms {
    resolution: vec2<f32>,
    time: f32,
    scroll: f32,
    pointer: vec2<f32>,
    reduced_motion: f32,
    intensity: f32,
};

@group(0) @binding(0)
var<uniform> scene: SceneUniforms;

struct VertexOut {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOut {
    var position = vec2<f32>(-1.0, -3.0);
    if (vertex_index == 1u) {
        position = vec2<f32>(-1.0, 1.0);
    }
    if (vertex_index == 2u) {
        position = vec2<f32>(3.0, 1.0);
    }

    var out: VertexOut;
    out.position = vec4<f32>(position, 0.0, 1.0);
    out.uv = position * 0.5 + vec2<f32>(0.5);
    return out;
}

fn grid_line(value: f32, width: f32) -> f32 {
    let wrapped = abs(fract(value) - 0.5);
    return 1.0 - smoothstep(width, width + 0.018, wrapped);
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    let aspect = scene.resolution.x / max(scene.resolution.y, 1.0);
    let centered = vec2<f32>((in.uv.x - 0.5) * aspect, in.uv.y - 0.5);
    let pointer = (scene.pointer - vec2<f32>(0.5)) * vec2<f32>(0.16, -0.12);
    let motion = (1.0 - scene.reduced_motion) * scene.intensity;
    let time = scene.time * motion;

    let warped = centered + pointer + vec2<f32>(
        sin(centered.y * 5.0 + time * 0.7) * 0.018,
        cos(centered.x * 4.0 - time * 0.5) * 0.014,
    );

    let depth = 1.0 / (1.0 + length(warped) * 1.25);
    let scan = warped * (8.0 + depth * 10.0) + vec2<f32>(scene.scroll * 2.0, time * 0.12);
    let lines = max(grid_line(scan.x, 0.018), grid_line(scan.y, 0.012));
    let diagonal = grid_line((warped.x + warped.y) * 5.0 + time * 0.08, 0.008);
    let glow = pow(depth, 3.2);
    let pulse = 0.72 + 0.28 * sin(time + scene.scroll * 4.0);

    let base = vec3<f32>(0.010, 0.013, 0.020);
    let emerald = vec3<f32>(0.16, 0.86, 0.58);
    let cyan = vec3<f32>(0.12, 0.56, 0.72);
    let violet = vec3<f32>(0.30, 0.22, 0.44);

    let base_field = 1.0 - smoothstep(0.0, 0.78, length(centered));

    var color = base + emerald * base_field * 0.055;
    color += emerald * lines * 0.16 * scene.intensity;
    color += cyan * diagonal * 0.055 * scene.intensity;
    color += emerald * glow * 0.18 * pulse * scene.intensity;
    let center_glow = 1.0 - smoothstep(0.02, 0.48, length(centered + pointer));
    color += violet * center_glow * 0.08;

    let vignette = 1.0 - smoothstep(0.24, 0.92, length(centered));
    color *= vignette;

    return vec4<f32>(color, 1.0);
}
