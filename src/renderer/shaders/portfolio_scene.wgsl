const MAX_REACTIVE_RECTS: u32 = 32u;

struct SceneUniforms {
    resolution: vec2<f32>,
    time: f32,
    scroll: f32,
    pointer: vec2<f32>,
    reduced_motion: f32,
    intensity: f32,
};

struct ReactiveRect {
    center: vec2<f32>,
    half_size: vec2<f32>,
    radius: f32,
    influence: f32,
    padding: vec2<f32>,
};

struct ReactiveRectsUniform {
    count: u32,
    padding_0: u32,
    padding_1: u32,
    padding_2: u32,
    rects: array<ReactiveRect, 32>,
};

@group(0) @binding(0)
var<uniform> scene: SceneUniforms;

@group(0) @binding(1)
var<uniform> reactive_rects: ReactiveRectsUniform;

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

fn safe_normalize(value: vec2<f32>, fallback: vec2<f32>) -> vec2<f32> {
    let magnitude = length(value);
    if (magnitude > 0.00001) {
        return value / magnitude;
    }

    return fallback;
}

fn rounded_rect_sdf(
    p: vec2<f32>,
    center: vec2<f32>,
    half_size: vec2<f32>,
    radius: f32,
) -> f32 {
    let q = abs(p - center) - half_size + vec2<f32>(radius);
    return length(max(q, vec2<f32>(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

fn sdf_normal(
    p: vec2<f32>,
    center: vec2<f32>,
    half_size: vec2<f32>,
    radius: f32,
) -> vec2<f32> {
    let eps = 0.001;
    let dx = rounded_rect_sdf(
        p + vec2<f32>(eps, 0.0),
        center,
        half_size,
        radius,
    ) - rounded_rect_sdf(
        p - vec2<f32>(eps, 0.0),
        center,
        half_size,
        radius,
    );
    let dy = rounded_rect_sdf(
        p + vec2<f32>(0.0, eps),
        center,
        half_size,
        radius,
    ) - rounded_rect_sdf(
        p - vec2<f32>(0.0, eps),
        center,
        half_size,
        radius,
    );

    return safe_normalize(vec2<f32>(dx, dy), vec2<f32>(0.0, 1.0));
}

fn grid_line(value: f32, width: f32) -> f32 {
    let wrapped = abs(fract(value) - 0.5);
    return 1.0 - smoothstep(width, width + 0.014, wrapped);
}

fn render_grid(p: vec2<f32>, time: f32, scroll: f32) -> f32 {
    let drift = vec2<f32>(scroll * 1.65, time * 0.075);
    let major = p * 18.0 + drift;
    let minor = p * 36.0 + drift * vec2<f32>(1.35, 1.8);

    let major_x = grid_line(major.x, 0.012);
    let major_y = grid_line(major.y, 0.010);
    let minor_x = grid_line(minor.x, 0.006);
    let minor_y = grid_line(minor.y, 0.005);
    let nodes = pow(max(major_x * major_y, 0.0), 0.42);

    return clamp(
        max(major_x, major_y) * 0.74 + max(minor_x, minor_y) * 0.18 + nodes * 0.62,
        0.0,
        1.0,
    );
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    let aspect = scene.resolution.x / max(scene.resolution.y, 1.0);
    let uv = vec2<f32>((in.uv.x - 0.5) * aspect, in.uv.y - 0.5);
    let pointer = (scene.pointer - vec2<f32>(0.5)) * vec2<f32>(0.018, -0.014);
    let motion = (1.0 - scene.reduced_motion) * scene.intensity;
    let time = scene.time * motion;

    var warped_uv = uv + pointer;
    var inside_mask = 0.0;
    var edge_mask = 0.0;
    var lane_mask = 0.0;
    var near_mask = 0.0;

    let rect_count = min(reactive_rects.count, MAX_REACTIVE_RECTS);
    for (var i = 0u; i < rect_count; i = i + 1u) {
        let rect = reactive_rects.rects[i];
        let influence = clamp(rect.influence, 0.0, 2.0);
        let distance = rounded_rect_sdf(uv, rect.center, rect.half_size, rect.radius);
        let normal = sdf_normal(uv, rect.center, rect.half_size, rect.radius);
        let tangent = vec2<f32>(-normal.y, normal.x);

        let edge_width = 0.013;
        let influence_width = 0.044;
        let outside = smoothstep(0.0, 0.010, distance);
        let inside = 1.0 - smoothstep(-0.008, 0.008, distance);
        let edge = 1.0 - smoothstep(0.0, edge_width, abs(distance));
        let near = 1.0 - smoothstep(edge_width, influence_width, abs(distance));
        let lane_a = outside * (1.0 - smoothstep(0.0, 0.009, abs(distance - 0.022)));
        let lane_b = outside * (1.0 - smoothstep(0.0, 0.010, abs(distance - 0.038)));
        let flow = 0.92 + 0.08 * sin(time * 0.65 + f32(i) * 1.37 + distance * 22.0);

        warped_uv += normal * near * 0.0024 * influence;
        warped_uv += tangent
            * (edge * 0.014 + lane_a * 0.0035 + lane_b * 0.0014)
            * flow
            * influence;

        inside_mask = max(inside_mask, inside * influence);
        edge_mask = max(edge_mask, edge * influence);
        lane_mask = max(lane_mask, max(lane_a * 0.48, lane_b * 0.18) * influence);
        near_mask = max(near_mask, near * 0.22 * influence);
    }

    inside_mask = clamp(inside_mask, 0.0, 1.0);
    edge_mask = clamp(edge_mask, 0.0, 1.0);
    lane_mask = clamp(lane_mask, 0.0, 1.0);
    near_mask = clamp(near_mask, 0.0, 1.0);

    let grid = render_grid(warped_uv, time, scene.scroll);
    let visibility = 0.060 + edge_mask * 1.12 + lane_mask * 0.42 + near_mask * 0.018;
    let readable_grid = grid * visibility * mix(1.0, 0.018, inside_mask);
    let pulse = 0.82 + 0.18 * sin(time * 1.35 + scene.scroll * 5.0);

    let base = vec3<f32>(0.006, 0.008, 0.014);
    let emerald = vec3<f32>(0.13, 0.78, 0.56);
    let cyan = vec3<f32>(0.11, 0.48, 0.68);
    let violet = vec3<f32>(0.52, 0.34, 0.94);
    let reactive_tint = clamp(edge_mask * 0.72 + lane_mask * 0.46, 0.0, 1.0);
    let grid_color = mix(mix(emerald, cyan, 0.32), violet, reactive_tint);

    let ambient = 1.0 - smoothstep(0.12, 1.04, length(uv * vec2<f32>(0.72, 1.0)));
    var color = base + emerald * ambient * 0.008;
    color += grid_color * readable_grid * max(scene.intensity, 0.35);
    color += violet * edge_mask * 0.026 * pulse * max(scene.intensity, 0.35);
    color += cyan * lane_mask * 0.010 * max(scene.intensity, 0.35);

    let component_dim = mix(1.0, 0.62, inside_mask);
    let vignette = 1.0 - smoothstep(0.74, 1.25, length(uv * vec2<f32>(0.72, 1.0)));
    color *= component_dim * (0.58 + 0.42 * vignette);

    return vec4<f32>(color, 1.0);
}
