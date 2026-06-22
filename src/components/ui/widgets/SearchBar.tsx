import { createSignal, createEffect } from "solid-js"

import { Input } from "./Input"

interface SearchBarProps {
    id: string
    "aria-label": string
    class?: string
    value?: string
    placeholder?: string
    small?: boolean
    width?: string
    onInput?: (value: string) => void
}

export function SearchBar(props: SearchBarProps) {
    const [containerEl, setContainerEl] = createSignal<HTMLDivElement>()

    createEffect(() => {
        const el = containerEl()
        if (!el) return
        if (props.width) {
            el.style.setProperty("--input-width", props.width)
        } else {
            el.style.removeProperty("--input-width")
        }
    })

    return (
        <div ref={setContainerEl} class="search-bar" role="search">
            <Input
                id={props.id}
                small={props.small}
                width="100%"
                type="search"
                value={props.value}
                placeholder={props.placeholder}
                aria-label={props["aria-label"]}
                class={props.class}
                onInput={props.onInput}
                leading={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                        <path d="M21 21l-6 -6" />
                    </svg>
                }
            />
        </div>
    )
}
