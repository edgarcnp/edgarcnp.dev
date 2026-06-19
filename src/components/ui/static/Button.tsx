import type { JSX } from "solid-js";

type ButtonProps = {
    class?: string;
    type?: "button" | "submit" | "reset";
    primary?: boolean;
    card?: boolean;
    selected?: boolean;
    circle?: boolean;
    transparent?: boolean;
    disabled?: boolean;
    children?: JSX.Element;
    onClick?: (e: MouseEvent) => void;
};

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
