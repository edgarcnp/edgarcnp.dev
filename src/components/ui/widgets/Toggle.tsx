import { type JSX } from "solid-js"

interface ToggleProps {
    class?: string
    checked?: boolean
    disabled?: boolean
    type?: "button" | "submit" | "reset"
    name?: string
    desc?: string
    children?: JSX.Element
    onchange?: (checked: boolean) => void
}

export function Toggle(props: ToggleProps) {
    const checked = () => props.checked ?? false

    const toggle = () => {
        if (props.disabled) return
        props.onchange?.(!checked())
    }

    return (
        <button
            class={["toggle-button card", props.class].filter(Boolean).join(" ")}
            disabled={props.disabled}
            type={props.type ?? "button"}
            role="switch"
            aria-checked={checked()}
            onClick={toggle}
        >
            <div class="toggle-text">
                {props.children ?? (
                    <>
                        {props.name && <h4>{props.name}</h4>}
                        {props.desc && <p>{props.desc}</p>}
                    </>
                )}
            </div>
            <div classList={{ toggle: true, enabled: checked() }} aria-hidden="true">
                <div class="runner" />
            </div>
        </button>
    )
}
