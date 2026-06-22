import type { IconProps } from "~/lib/types"

export function IconBang(props: IconProps) {
    return (
        <svg class={props.class} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M11 8v6" /><path d="M11 16h.01" />
        </svg>
    )
}
