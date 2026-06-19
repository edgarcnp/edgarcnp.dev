import { createMemo, type JSX } from "solid-js";

interface LinkProps {
    href: string;
    class?: string;
    target?: string;
    rel?: string;
    children?: JSX.Element;
}

export function Link(props: LinkProps) {
    const isExternal = createMemo(() => {
        try {
            return new URL(props.href, location.href).origin !== location.origin;
        } catch {
            return true;
        }
    });

    const target = createMemo(() =>
        isExternal() ? (props.target ?? "_blank") : props.target
    );

    const rel = createMemo(() =>
        isExternal() ? (props.rel ?? "noopener noreferrer") : props.rel
    );

    return (
        <a
            class={["p-link", props.class].filter(Boolean).join(" ")}
            href={props.href}
            target={target()}
            rel={rel()}
        >
            {props.children}
        </a>
    );
}
