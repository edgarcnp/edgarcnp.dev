import type { JSX } from "solid-js";

/** Typography variant — determines default HTML tag and styling. */
type Variant = "display" | "title" | "heading" | "subheading" | "body" | "caption";

/** Color tone — applies a tone-specific CSS class. */
type Tone = "primary" | "secondary" | "tertiary" | "white";

/** HTML element tag for the rendered output. */
type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

/**
 * Props for the Text component.
 */
type TextProps = {
    /** Typography variant — determines default tag and styling (default: "body"). */
    variant?: Variant;
    /** Override the default HTML tag for this variant. */
    tag?: Tag;
    /** Color tone class (e.g. "primary", "secondary"). */
    tone?: Tone;
    /** Center-align the text. */
    center?: boolean;
    /** Additional CSS classes. */
    class?: string;
    /** Text content. */
    children?: JSX.Element;
};

/**
 * Map a variant to its default HTML tag.
 *
 * @param variant - The typography variant.
 * @returns The default HTML tag for that variant.
 */
const defaultTag = (variant: Variant): Tag => {
    if (variant === "display") return "h1";
    if (variant === "title") return "h2";
    if (variant === "heading") return "h3";
    if (variant === "subheading") return "h4";
    return "p";
};

/**
 * Polymorphic text component with variant-driven styling.
 *
 * @remarks
 * - Variant determines the default HTML tag: display→h1, title→h2, heading→h3, subheading→h4, body→p.
 * - Override the default tag via the `tag` prop.
 * - Tone classes: `tone-primary`, `tone-secondary`, `tone-tertiary`, `tone-white`.
 * - Renders the correct semantic element via a switch statement.
 */
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
