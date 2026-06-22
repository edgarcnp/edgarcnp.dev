import { createSignal, createEffect, type JSX } from "solid-js"

interface InputProps {
    id: string
    "aria-label": string
    class?: string
    value?: string
    type?: string
    placeholder?: string
    small?: boolean
    width?: string
    disabled?: boolean
    leading?: JSX.Element
    trailing?: JSX.Element
    onInput?: (value: string) => void
    ref?: (el: HTMLInputElement) => void
}

export function Input(props: InputProps) {
    const [labelEl, setLabelEl] = createSignal<HTMLLabelElement>()

    createEffect(() => {
        const el = labelEl()
        if (!el) return
        if (props.width) {
            el.style.setProperty("--input-width", props.width)
        } else {
            el.style.removeProperty("--input-width")
        }
    })

    const handleInput = (e: Event) => {
        const input = e.target as HTMLInputElement
        props.onInput?.(input.value)
    }

    return (
        <label
            ref={setLabelEl}
            classList={{
                "input-field": true,
                small: props.small,
                disabled: props.disabled,
                [props.class ?? ""]: !!props.class,
            }}
        >
            {props.leading && (
                <span class="input-accessory" aria-hidden="true">
                    {props.leading}
                </span>
            )}
            <input
                ref={props.ref}
                id={props.id}
                type={props.type}
                value={props.value ?? ""}
                placeholder={props.placeholder}
                aria-label={props["aria-label"]}
                disabled={props.disabled}
                onInput={handleInput}
            />
            {props.trailing && (
                <span class="input-accessory" aria-hidden="true">
                    {props.trailing}
                </span>
            )}
        </label>
    )
}
