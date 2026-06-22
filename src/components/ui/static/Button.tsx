import type { JSX } from "solid-js";

/**
 * Props for the Button component.
 */
type ButtonProps = {
    /** Additional CSS classes to merge with variant classes. */
    class?: string;
    /** HTML button type attribute (default: "button"). */
    type?: "button" | "submit" | "reset";
    /** Apply primary styling (blue accent). */
    primary?: boolean;
    /** Apply card styling (bordered container). */
    card?: boolean;
    /** Apply selected styling (active state). */
    selected?: boolean;
    /** Apply circle styling (square → rounded). */
    circle?: boolean;
    /** Apply transparent styling (no background/border). */
    transparent?: boolean;
    /** Disable the button and prevent interaction. */
    disabled?: boolean;
    /** Button content. */
    children?: JSX.Element;
    /** Click event handler. */
    onClick?: (e: MouseEvent) => void;
};

/**
 * Versatile button with multiple style variants.
 *
 * @remarks
 * - Combines multiple boolean props for styling: `primary`, `card`, `selected`, `circle`, `transparent`.
 * - All variant classes are joined with the base `button` class.
 * - Defaults to `type="button"` to prevent accidental form submissions.
 */
export function Button(props: ButtonProps) {
    const classes = () => [
        "button",
        props.primary && "primary",
        props.card && "card",
        props.selected && "selected",
        props.circle && "circle",
        props.transparent && "transparent",
        props.class,
    ].filter(Boolean).join(" ");

    return (
        <button
            class={classes()}
            type={props.type ?? "button"}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}
