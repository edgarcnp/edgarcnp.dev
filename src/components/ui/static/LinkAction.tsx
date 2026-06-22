import { A } from "@solidjs/router"

import { ACTION_CLASSES } from "~/lib/types"

import type { JSX } from "solid-js"
import type { ActionVariant } from "~/lib/types"

/**
 * Props for the LinkAction component.
 */
interface Props {
    /** Target URL — can be an internal route or external URL. */
    href: string
    /** Force external link treatment (target="_blank", noopener noreferrer). */
    external?: boolean
    /** Visual style variant (default: "secondary"). */
    variant?: ActionVariant
    /** Link text content. */
    children: JSX.Element
}

/**
 * Styled link button with automatic external link detection.
 *
 * @remarks
 * - Auto-detects external URLs by checking for `http` or `mailto:` prefix.
 * - External links open in a new tab with `rel="noopener noreferrer"`.
 * - Internal links use SolidStart `<A>` for SPA navigation.
 * - Applies variant-specific classes from `ACTION_CLASSES` lookup.
 */
export function LinkAction(props: Props) {
    const isExternal = () => props.external ?? (props.href.startsWith("http") || props.href.startsWith("mailto:"))

    return (
        <A
            href={props.href}
            target={isExternal() ? "_blank" : undefined}
            rel={isExternal() ? "noopener noreferrer" : undefined}
            class={ACTION_CLASSES[props.variant ?? "secondary"]}
        >
            {props.children}
        </A>
    )
}
