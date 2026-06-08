#[test]
fn portfolio_scene_wgsl_validates() {
    let source = include_str!("../src/renderer/shaders/portfolio_scene.wgsl");
    let module = naga::front::wgsl::parse_str(source).expect("portfolio scene WGSL should parse");
    let mut validator = naga::valid::Validator::new(
        naga::valid::ValidationFlags::all(),
        naga::valid::Capabilities::all(),
    );

    validator
        .validate(&module)
        .expect("portfolio scene WGSL should validate");
}
