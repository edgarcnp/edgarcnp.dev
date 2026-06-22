import { createSignal, createEffect, type JSX } from "solid-js"

interface TooltipProps {
    id?: string
    anchor: JSX.Element
    content: JSX.Element
}

export function Tooltip(props: TooltipProps) {
    const [anchorElement, setAnchorElement] = createSignal<HTMLDivElement>()
    const [popover, setPopover] = createSignal<HTMLDivElement>()

    const [visible, setVisible] = createSignal(false)

    const offsetY = 12
    const offsetX = 16

    const updatePosition = (e: PointerEvent) => {
        const el = popover()
        if (!el) return
        el.style.setProperty("--tooltip-x", `${e.clientX - offsetX}px`)
        el.style.setProperty("--tooltip-y", `${e.clientY - offsetY}px`)
    }

    const updatePositionFromAnchor = () => {
        const el = popover()
        const anchor = anchorElement()
        if (!el || !anchor) return
        const rect = anchor.getBoundingClientRect()
        el.style.setProperty("--tooltip-x", `${rect.left}px`)
        el.style.setProperty("--tooltip-y", `${rect.top - offsetY}px`)
    }

    createEffect(() => {
        const el = popover()
        if (!el) return
        if (visible()) {
            el.showPopover()
        } else {
            el.hidePopover()
        }
    })

    return (
        <>
            <div
                ref={setAnchorElement}
                class="tooltip-anchor"
                onPointerMove={updatePosition}
                onPointerEnter={() => setVisible(true)}
                onPointerLeave={() => setVisible(false)}
                onFocusIn={() => {
                    updatePositionFromAnchor()
                    setVisible(true)
                }}
                onFocusOut={() => setVisible(false)}
                role="group"
                aria-describedby={props.id}
            >
                {props.anchor}
            </div>
            <div
                ref={setPopover}
                popover="manual"
                class="tooltip-container"
                role="tooltip"
                id={props.id}
            >
                <div class="tooltip-content">{props.content}</div>
            </div>
        </>
    )
}
