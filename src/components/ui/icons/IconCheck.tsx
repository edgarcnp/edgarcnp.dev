import type { IconProps } from "~/lib/types"

export function IconCheck(props: IconProps) {
    return (
        <svg class={props.class} fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
