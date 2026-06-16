use dioxus::prelude::*;

#[component]
pub fn BlueprintDiagram() -> Element {
    rsx! {
        div { class: "blueprint-frame overflow-hidden p-4 sm:p-5",
            div { class: "mb-4 flex items-center justify-between gap-4",
                p { class: "blueprint-label", "Content Pipeline" }
                p { class: "font-mono text-xs text-[var(--blueprint-subtle)]", "Static / Validated" }
            }
            svg {
                class: "blueprint-svg aspect-[13/9] w-full",
                view_box: "0 0 520 360",
                role: "img",
                title { "Portfolio content pipeline" }
                desc { "Local content files are validated in Rust, rendered through Dioxus routes, and delivered as a Cloudflare-ready portfolio." }
                rect {
                    x: "18",
                    y: "18",
                    width: "484",
                    height: "324",
                    rx: "14",
                    fill: "rgba(8, 10, 15, 0.58)",
                    stroke: "rgba(148, 163, 184, 0.18)",
                }
                path {
                    class: "blueprint-svg-line blueprint-draw",
                    d: "M116 118 H194 C215 118 215 178 236 178 H306 C327 178 327 118 348 118 H426",
                }
                path {
                    class: "blueprint-svg-line blueprint-svg-warm blueprint-draw draw-delay-1",
                    d: "M116 242 H194 C215 242 215 178 236 178",
                }
                rect {
                    x: "54",
                    y: "82",
                    width: "124",
                    height: "72",
                    rx: "8",
                    fill: "rgba(94, 214, 238, 0.07)",
                    stroke: "rgba(94, 214, 238, 0.44)",
                }
                rect {
                    x: "54",
                    y: "206",
                    width: "124",
                    height: "72",
                    rx: "8",
                    fill: "rgba(246, 201, 107, 0.06)",
                    stroke: "rgba(246, 201, 107, 0.42)",
                }
                rect {
                    x: "218",
                    y: "142",
                    width: "100",
                    height: "72",
                    rx: "8",
                    fill: "rgba(244, 247, 251, 0.035)",
                    stroke: "rgba(148, 163, 184, 0.22)",
                }
                rect {
                    x: "346",
                    y: "82",
                    width: "126",
                    height: "72",
                    rx: "8",
                    fill: "rgba(124, 231, 175, 0.06)",
                    stroke: "rgba(124, 231, 175, 0.36)",
                }
                rect {
                    x: "346",
                    y: "206",
                    width: "126",
                    height: "72",
                    rx: "8",
                    fill: "rgba(244, 247, 251, 0.035)",
                    stroke: "rgba(148, 163, 184, 0.22)",
                }
                circle {
                    class: "blueprint-svg-warm",
                    cx: "268",
                    cy: "178",
                    r: "5",
                    fill: "currentColor",
                }
                circle {
                    cx: "116",
                    cy: "118",
                    r: "4",
                    fill: "currentColor",
                }
                circle {
                    cx: "410",
                    cy: "118",
                    r: "4",
                    fill: "currentColor",
                }
                text { x: "76", y: "112", class: "blueprint-svg-text", "CONTENT" }
                text { x: "76", y: "130", class: "blueprint-svg-text blueprint-svg-muted", "TOML / MD" }
                text { x: "76", y: "236", class: "blueprint-svg-text blueprint-svg-warm", "CONTACT" }
                text { x: "76", y: "254", class: "blueprint-svg-text blueprint-svg-muted", "STATIC LINKS" }
                text { x: "238", y: "172", class: "blueprint-svg-text", "RUST" }
                text { x: "238", y: "190", class: "blueprint-svg-text blueprint-svg-muted", "VALIDATE" }
                text { x: "374", y: "112", class: "blueprint-svg-text", "DIOXUS" }
                text { x: "374", y: "130", class: "blueprint-svg-text blueprint-svg-muted", "ROUTES" }
                text { x: "370", y: "236", class: "blueprint-svg-text", "CLOUDFLARE" }
                text { x: "370", y: "254", class: "blueprint-svg-text blueprint-svg-muted", "EDGE READY" }
                path {
                    class: "blueprint-svg-line blueprint-svg-muted blueprint-draw draw-delay-2",
                    d: "M410 154 V206",
                }
                path {
                    class: "blueprint-svg-line blueprint-svg-muted blueprint-draw draw-delay-3",
                    d: "M68 308 H452",
                }
                text { x: "84", y: "330", class: "blueprint-svg-text blueprint-svg-muted", "NO FORM / NO CUSTOM JS / REDUCED MOTION" }
            }
        }
    }
}
