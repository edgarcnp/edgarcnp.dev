import type { JSX } from "solid-js";

type Variant = "display" | "title" | "heading" | "subheading" | "body" | "caption";
type Tone = "primary" | "secondary" | "tertiary" | "white";
type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

type TextProps = {
    variant?: Variant;
    tag?: Tag;
    tone?: Tone;
    center?: boolean;
    class?: string;
    children?: JSX.Element;
};

const defaultTag = (variant: Variant): Tag => {
    if (variant === "display") return "h1";
    if (variant === "title") return "h2";
    if (variant === "heading") return "h3";
    if (variant === "subheading") return "h4";
    return "p";
};

export function Text(props: TextProps) {
    const tag = () => props.tag ?? defaultTag(props.variant ?? "body");
    const classes = () => [
        "text",
        props.tone && `tone-${props.tone}`,
        props.center && "center",
        props.class,
    ].filter(Boolean).join(" ");

    const render = () => {
        const cls = classes();
        switch (tag()) {
            case "h1": return <h1 class={cls}>{props.children}</h1>;
            case "h2": return <h2 class={cls}>{props.children}</h2>;
            case "h3": return <h3 class={cls}>{props.children}</h3>;
            case "h4": return <h4 class={cls}>{props.children}</h4>;
            case "h5": return <h5 class={cls}>{props.children}</h5>;
            case "h6": return <h6 class={cls}>{props.children}</h6>;
            case "span": return <span class={cls}>{props.children}</span>;
            case "div": return <div class={cls}>{props.children}</div>;
            default: return <p class={cls}>{props.children}</p>;
        }
    };

    return render();
}
